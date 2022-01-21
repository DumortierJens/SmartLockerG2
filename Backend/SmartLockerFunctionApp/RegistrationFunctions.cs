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
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "registration/start")] HttpRequest req,
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

                // Validate registration
                if (!await LockerManagementService.ValidateRegistration(registration))
                    return new ConflictResult();

                // Get cosmos container
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Registrations");

                // Save registration
                await container.CreateItemAsync(registration, new PartitionKey(registration.LockerId.ToString()));

                return new OkObjectResult(registration);
            }
            catch (Exception)
            {
                throw;
            }
        }

        [FunctionName("StopRegistration")]
        public async Task<IActionResult> StopRegistration(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "registration/stop")] HttpRequest req,
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
                    registration = await container.ReadItemAsync<Registration>(registrationEnd.Id.ToString(), new PartitionKey(registrationEnd.LockerId.ToString()));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                // Set registration defaults
                registration.EndTime = DateTime.Now;
                registration.Note += "\nAfter:\n" + registrationEnd.Note;

                // Update registration
                await container.ReplaceItemAsync<Registration>(registration, registration.Id.ToString(), new PartitionKey(registration.LockerId.ToString()));

                return new OkObjectResult(registration);
            }
            catch (Exception)
            {

                throw;
            }
        }

        [FunctionName("GetRegistrations")]
        public async Task<IActionResult> GetUsers(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "registrations")] HttpRequest req,
            ILogger log)
        {
            try
            {
                if (Auth.Role != "Admin")
                    return new UnauthorizedResult();

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Registrations");

                List<Registration> registrations = new List<Registration>();
                QueryDefinition query = new QueryDefinition("SELECT * FROM Registrations r");
                FeedIterator<Registration> iterator = container.GetItemQueryIterator<Registration>(query);
                while (iterator.HasMoreResults)
                {
                    FeedResponse<Registration> response = await iterator.ReadNextAsync();
                    registrations.AddRange(response);
                }

                return new OkObjectResult(registrations);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
