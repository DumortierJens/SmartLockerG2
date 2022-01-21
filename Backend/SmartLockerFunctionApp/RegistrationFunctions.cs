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
                // Get registration info
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Registration registration = JsonConvert.DeserializeObject<Registration>(requestBody);

                // Set registration defaults
                registration.Id = Guid.NewGuid();
                registration.UserId = Auth.Id;
                registration.StartTime = DateTime.Now;
                registration.EndTime = DateTime.MinValue;

                // Validate start registration
                if (!await LockerManagementService.ValidateStartRegistrationAsync(registration))
                    return new ConflictResult();

                // Get cosmos container
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Registrations");

                // Save registration
                await container.CreateItemAsync(registration, new PartitionKey(registration.Id.ToString()));

                return new OkObjectResult(registration);
            }
            catch (Exception ex)
            {
                throw ex;
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
                registration.EndTime = DateTime.Now;
                registration.Note = registrationEnd.Note;

                // Validate end registration
                if (!await LockerManagementService.ValidateEndRegistrationAsync(registration))
                    return new ConflictResult();

                // Update registration
                await container.ReplaceItemAsync<Registration>(registration, registration.Id.ToString(), new PartitionKey(registration.Id.ToString()));

                return new OkObjectResult(registration);
            }
            catch (Exception)
            {

                throw;
            }
        }

        [FunctionName("GetAllRegistrations")]
        public async Task<IActionResult> GetRegistrations(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "registrations/all")] HttpRequest req,
            ILogger log)
        {
            try
            {
                if (Auth.Role != "Admin")
                    return new UnauthorizedResult();

                var registrations = await RegistrationConnector.GetRegistrationsAsync();

                return new OkObjectResult(registrations);
            }
            catch (Exception ex)
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

                var registrations = await RegistrationConnector.GetRegistrationsAsync(lockerId);

                return new OkObjectResult(registrations);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("GetCurrentRegistrationsByUserId")]
        public async Task<IActionResult> GetCurrentRegistrationsByUserId(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "registrations/users/{userId}")] HttpRequest req,
            string userId,
            ILogger log)
        {
            try
            {
                if (Auth.Role != "Admin" && userId != "me")
                    return new UnauthorizedResult();
                else if (userId == "me")
                    userId = Auth.Id;

                List<Registration> registrations = new List<Registration>();
                IDictionary<string, string> queryParams = req.GetQueryParameterDictionary();
                if (Guid.TryParse(queryParams["lockerId"], out Guid lockerId))
                    registrations.Add(await RegistrationConnector.GetCurrentRegistrationAsync(lockerId, userId));
                else
                    registrations.AddRange(await RegistrationConnector.GetCurrentRegistrationsAsync(userId));

                return new OkObjectResult(registrations);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
