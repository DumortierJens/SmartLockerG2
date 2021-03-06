using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using SmartLockerFunctionApp.Services.Authentication;
using SmartLockerFunctionApp.Models;
using Microsoft.Azure.Cosmos;
using System.Collections.Generic;
using SmartLockerFunctionApp.Services.LockerManagement;
using Newtonsoft.Json.Linq;
using SmartLockerFunctionApp.Services.Sms;
using SmartLockerFunctionApp.Services.ErrorLogging;

namespace SmartLockerFunctionApp
{
    public class RegistrationFunctions : AuthorizedServiceBase
    {
        [FunctionName("StartRegistration")]
        public async Task<IActionResult> StartRegistration(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "registrations/start")] HttpRequest req,
            ILogger log)
        {
            try
            {
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 851, message = "This account is blocked" });

                // Get registration info
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Registration registration = JsonConvert.DeserializeObject<Registration>(requestBody);

                // Set registration defaults
                registration.Id = Guid.NewGuid();
                registration.UserId = Auth.Id;
                registration.StartTime = DateTime.Now;
                registration.EndTime = DateTime.MinValue;

                // Check for user reservation
                Reservation reservation = await ReservationService.GetCurrentReservationAsync(registration.LockerId, registration.UserId);
                if (reservation != null)
                {
                    reservation.RegistrationId = registration.Id;
                    reservation.IsUsed = true;

                    // Validate registration
                    if (!await LockerManagementService.ValidateStartRegistrationAsync(registration))
                        return new BadRequestObjectResult(new { code = 806, message = "Er is nog een activiteit bezig" });
                }
                else {
                    // Get end time
                    DateTime endTimeReservation;
                    if (!JObject.Parse(requestBody).TryGetValue("endTimeReservation", out JToken endTimeReservationToken))
                        return new BadRequestObjectResult(JsonConvert.SerializeObject(new { errorMessage = "No endTimeReservated found" }));
                    else if (!DateTime.TryParse(endTimeReservationToken.ToString(), out endTimeReservation))
                        return new BadRequestObjectResult(JsonConvert.SerializeObject(new { errorMessage = "endTimeReservation is not in datetime format" }));

                    // Create reservation
                    reservation = new Reservation()
                    {
                        Id = Guid.NewGuid(),
                        LockerId = registration.LockerId,
                        UserId = registration.UserId,
                        RegistrationId = registration.Id,
                        StartTime = DateTime.UtcNow,
                        EndTime = endTimeReservation,
                        IsUsed = true
                    };

                    // Validate reservation
                    if (!await LockerManagementService.ValidateReservationAsync(reservation, reservation.StartTime))
                        return new BadRequestObjectResult(new { code = 805, message = "Time slot is not available" });
                }

                // Get cosmos client
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                
                // Add registration to cosmos
                Container registrationContainer = cosmosClient.GetContainer("SmartLocker", "Registrations");
                await registrationContainer.CreateItemAsync(registration, new PartitionKey(registration.Id.ToString()));

                // Add/replace reservation in cosmos
                Container reservationContainer = cosmosClient.GetContainer("SmartLocker", "Reservations");
                await reservationContainer.UpsertItemAsync(reservation, new PartitionKey(reservation.Id.ToString()));

                Container userContainer = cosmosClient.GetContainer("SmartLocker", "Users");
                Models.User user = await userContainer.ReadItemAsync<Models.User>(registration.UserId, new PartitionKey(registration.UserId));

                SmsService.AddMessageToQueue(user, reservation);

                return new OkObjectResult(registration);
            }
            catch (Exception ex)
            {
                await ErrorService.SaveError(new Error("500", ex.Message));
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("StopRegistration")]
        public async Task<IActionResult> StopRegistration(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "registrations/{registrationId}/stop")] HttpRequest req,
            Guid registrationId,
            ILogger log)
        {
            try
            {
                // Get registration info
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Registration registrationEnd = JsonConvert.DeserializeObject<Registration>(requestBody);

                // Get cosmos container
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Registrations");

                // Get registration
                Registration registration;
                try
                {
                    registration = await container.ReadItemAsync<Registration>(registrationId.ToString(), new PartitionKey(registrationId.ToString()));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                // Set registration defaults
                registration.EndTime = DateTime.UtcNow;
                registration.Note = registrationEnd.Note;

                // Validate end registration
                if (!await LockerManagementService.ValidateEndRegistrationAsync(registration))
                    return new BadRequestObjectResult(new { code = 806, message = "No active registration" });

                // Check material
                if (!await LockerService.CheckMaterialStatusAsync(registration.LockerId))
                {
                    Locker locker = await LockerService.LockerContainer.ReadItemAsync<Locker>(registration.LockerId.ToString(), new PartitionKey(registration.LockerId.ToString()));
                    await LockerService.LockerContainer.ReplaceItemAsync(locker, locker.Id.ToString(), new PartitionKey(locker.Id.ToString()));
                }
                
                // Check lock
                if (!await LockerService.CheckLockStatusAsync(registration.LockerId))
                    return new BadRequestObjectResult(new { code = 801, message = "The locker is not closed" });

                // Update registration
                await container.ReplaceItemAsync<Registration>(registration, registration.Id.ToString(), new PartitionKey(registration.Id.ToString()));

                return new OkObjectResult(registration);
            }
            catch (Exception ex)
            {
                await ErrorService.SaveError(new Error("500", ex.Message));
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("GetAllRegistrations")]
        public async Task<IActionResult> GetRegistrations(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "registrations")] HttpRequest req,
            ILogger log)
        {
            try
            {
                if (Auth.Role != "Admin")
                    return new UnauthorizedResult();

                var registrations = await RegistrationService.GetRegistrationsAsync();

                return new OkObjectResult(registrations);
            }
            catch (Exception)
            {
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("GetRegistrationsByLockerId")]
        public async Task<IActionResult> GetRegistrationsByLockerId(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "registrations/lockers/{lockerId}")] HttpRequest req,
            Guid lockerId,
            ILogger log)
        {
            try
            {
                if (Auth.Role != "Admin")
                    return new UnauthorizedResult();

                var registrations = await RegistrationService.GetRegistrationsAsync(lockerId);

                return new OkObjectResult(registrations);
            }
            catch (Exception ex)
            {
                await ErrorService.SaveError(new Error("500", ex.Message));
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("GetRegistrationsByUserId")]
        public async Task<IActionResult> GetRegistrationsByUserId(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "registrations/users/{userId}")] HttpRequest req,
            string userId,
            ILogger log)
        {
            try
            {
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 851, message = "This account is blocked" });

                if (Auth.Role != "Admin" && userId != "me")
                    return new UnauthorizedResult();
                else if (userId == "me")
                    userId = Auth.Id;

                List<Registration> registrations = await RegistrationService.GetRegistrationsAsync(userId);

                return new OkObjectResult(registrations);
            }
            catch (Exception ex)
            {
                await ErrorService.SaveError(new Error("500", ex.Message));
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("GetCurrentRegistrationsByUserId")]
        public async Task<IActionResult> GetCurrentRegistrationsByUserId(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "registrations/users/{userId}/current")] HttpRequest req,
            string userId,
            ILogger log)
        {
            try
            {
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 851, message = "This account is blocked" });

                if (userId == "me")
                    userId = Auth.Id;

                List<Registration> registrations = new List<Registration>();
                IDictionary<string, string> queryParams = req.GetQueryParameterDictionary();
                if (queryParams.Count > 0 && Guid.TryParse(queryParams["lockerId"].ToString(), out Guid lockerId))
                    registrations.Add(await RegistrationService.GetCurrentRegistrationAsync(lockerId, userId));
                else
                    registrations.AddRange(await RegistrationService.GetCurrentRegistrationsAsync(userId));

                return new OkObjectResult(registrations);
            }
            catch (Exception ex)
            {
                await ErrorService.SaveError(new Error("500", ex.Message));
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("GetRegistration")]
        public async Task<IActionResult> GetRegistration(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "registrations/{registrationId}")] HttpRequest req,
            string registrationId,
            ILogger log)
        {
            try
            {
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 851, message = "This account is blocked" });

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Registrations");

                Models.Registration registration;
                try
                {
                    registration = await container.ReadItemAsync<Models.Registration>(registrationId, new PartitionKey(registrationId));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                return new OkObjectResult(registration);
            }
            catch (Exception ex)
            {
                await ErrorService.SaveError(new Error("500", ex.Message));
                return new StatusCodeResult(500);
            }
        }
        [FunctionName("UpdateRegistration")]
        public async Task<IActionResult> UpdateRegistration(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "registrations/{registrationId}")] HttpRequest req,
            string registrationId,
            ILogger log)
        {
            try
            {
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 851, message = "This account is blocked" });

                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Models.Registration updatedRegistration = JsonConvert.DeserializeObject<Registration>(requestBody);

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Registrations");

                Registration registration;
                try
                {
                    registration = await container.ReadItemAsync<Registration>(registrationId, new PartitionKey(registrationId));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                if (Auth.Role != "Admin" && Auth.Id != registration.UserId)
                    return new UnauthorizedResult();

                registration.Note = updatedRegistration.Note;
                await container.ReplaceItemAsync(registration, registration.Id.ToString(), new PartitionKey(registration.Id.ToString()));

                return new OkObjectResult(registration);
            }
            catch (Exception ex)
            {
                await ErrorService.SaveError(new Error("500", ex.Message));
                return new StatusCodeResult(500);
            }
        }
    }
}
