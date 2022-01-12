using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using System.Text;
using System.Net.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using SmartLockerFunctionApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs.Extensions.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.IO;
using Microsoft.Azure.Cosmos;

namespace SmartLockerFunctionApp
{
    class main
    {
        [FunctionName("StatusLog")]
        public static async Task<IActionResult> StatusLog(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "lockers/{lockerid}/log")] HttpRequest req, Guid lockerid,
            ILogger log)
        {
            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Log newLog = JsonConvert.DeserializeObject<Log>(requestBody);
                
                newLog.Id = Guid.NewGuid();
                newLog.Timestamp = DateTime.Now;
                newLog.DeviceId = lockerid;

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Logs");

                await container.CreateItemAsync<Log>(newLog, new PartitionKey(newLog.DeviceName));

                return new StatusCodeResult(200);
            }

            catch 
            {
                return new StatusCodeResult(500);
            }

           
        }

        [FunctionName("GetLockerDetails")]
        public static async Task<IActionResult> GetLockerDetails(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "lockers")] HttpRequest req,
            ILogger log)
        {
            try
            {

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Lockers");
                List<LockerDetails> lockerDetails = new List<LockerDetails>();
                QueryDefinition query = new QueryDefinition("SELECT * FROM Lockers");
                FeedIterator<LockerDetails> iterator = container.GetItemQueryIterator<LockerDetails>(query);
                while (iterator.HasMoreResults)
                {
                    FeedResponse<LockerDetails> response = await iterator.ReadNextAsync();
                    lockerDetails.AddRange(response);
                }
                return new OkObjectResult(lockerDetails);

            }

            catch
            {
                return new StatusCodeResult(500);
            }

        }
        [FunctionName("GetLockerDetailsByID")]
        public static async Task<IActionResult> GetLockerDetailsByID(
          [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "lockers/{lockerId}")] HttpRequest req, 
          string lockerId,
          ILogger log)
        {
            try
            {

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Lockers");
                List<LockerDetails> lockerDetails = new List<LockerDetails>();
                QueryDefinition query = new QueryDefinition("SELECT * FROM Lockers l WHERE l.id = @id");
                query.WithParameter("@id", lockerId);
                FeedIterator<LockerDetails> iterator = container.GetItemQueryIterator<LockerDetails>(query);
                while (iterator.HasMoreResults)
                {
                    FeedResponse<LockerDetails> response = await iterator.ReadNextAsync();
                    lockerDetails.AddRange(response);
                }
                return new OkObjectResult(lockerDetails);

            }

            catch
            {
                return new StatusCodeResult(500);
            }

        }
        [FunctionName("GetMaterialStatusByID")]
        public static async Task<IActionResult> GetMaterialStatusByID(
          [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "lockers/{lockerId}/status")] HttpRequest req,
          string lockerId,
          ILogger log)
        {
            try
            {

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Logs");
                List<LockerDetails> lockerDetails = new List<LockerDetails>();
                QueryDefinition query = new QueryDefinition("SELECT * FROM Lockers l WHERE l.id = @id");
                query.WithParameter("@id", lockerId);
                FeedIterator<LockerDetails> iterator = container.GetItemQueryIterator<LockerDetails>(query);
                while (iterator.HasMoreResults)
                {
                    FeedResponse<LockerDetails> response = await iterator.ReadNextAsync();
                    lockerDetails.AddRange(response);
                }
                return new OkObjectResult(lockerDetails);

            }

            catch
            {
                return new StatusCodeResult(500);
            }

        }
    }
}
