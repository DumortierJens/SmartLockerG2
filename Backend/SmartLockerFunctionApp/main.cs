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
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "devices/{deviceId}/log")] HttpRequest req, 
            Guid deviceId,
            ILogger log)
        {
            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Log newLog = JsonConvert.DeserializeObject<Log>(requestBody);
                
                newLog.Id = Guid.NewGuid();
                newLog.Timestamp = DateTime.Now;
                newLog.DeviceId = deviceId;

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Logs");
                await container.CreateItemAsync<Log>(newLog, new PartitionKey(deviceId.ToString()));
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
                List<Locker> lockers = new List<Locker>();
                QueryDefinition query = new QueryDefinition("SELECT * FROM Lockers");
                FeedIterator<Locker> iterator = container.GetItemQueryIterator<Locker>(query);
                while (iterator.HasMoreResults)
                {
                    FeedResponse<Locker> response = await iterator.ReadNextAsync();
                    lockers.AddRange(response);
                }
                return new OkObjectResult(lockers);

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
                List<Locker> lockers = new List<Locker>();
                QueryDefinition query = new QueryDefinition("SELECT * FROM Lockers l WHERE l.id = @id");
                query.WithParameter("@id", lockerId);
                FeedIterator<Locker> iterator = container.GetItemQueryIterator<Locker>(query);
                while (iterator.HasMoreResults)
                {
                    FeedResponse<Locker> response = await iterator.ReadNextAsync();
                    lockers.AddRange(response);
                }
                return new OkObjectResult(lockers);

            }

            catch
            {
                return new StatusCodeResult(500);
            }

        }
        [FunctionName("GetMaterialStatusById")]
        public static async Task<IActionResult> GetMaterialStatusById(
          [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "lockers/{lockerId}/status")] HttpRequest req,
          string lockerId,
          ILogger log)
        {
            try
            {

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Devices");
                List<Device> devices = new List<Device>();
                QueryDefinition query_devices = new QueryDefinition("SELECT * FROM Devices");
                FeedIterator<Device> iterator = container.GetItemQueryIterator<Device>(query_devices);
                while (iterator.HasMoreResults)
                {
                    FeedResponse<Device> response = await iterator.ReadNextAsync();
                    devices.AddRange(response);
                }
                foreach (Device device in devices)
                {
                    
                }
                return new OkObjectResult("");

            }

            catch
            {
                return new StatusCodeResult(500);
            }

        }
    }
}
