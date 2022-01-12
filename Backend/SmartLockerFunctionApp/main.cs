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
          Guid lockerId,
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
          [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "lockers/{deviceId}/status")] HttpRequest req,
          string deviceId,
          ILogger log)
        {
            try
            {
                string ultrasoon = null;
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container_devices = cosmosClient.GetContainer("SmartLocker", "Devices");
                List<Device> devices = new List<Device>();
                QueryDefinition query_devices = new QueryDefinition("SELECT * FROM Devices d WHERE d.id = @id");
                query_devices.WithParameter("@id", deviceId);
                FeedIterator<Device> iterator_devices = container_devices.GetItemQueryIterator<Device>(query_devices);
                while (iterator_devices.HasMoreResults)
                {
                    FeedResponse<Device> response_device = await iterator_devices.ReadNextAsync();
                    devices.AddRange(response_device);
                }
                foreach (Device device in devices)
                {
                    if (device.Type == "ultrasoon")
                    {
                        ultrasoon = device.Id.ToString();
                    }
                }
                Container container_logs = cosmosClient.GetContainer("SmartLocker", "Logs");
                List<Log> logs = new List<Log>();
                QueryDefinition query_logs = new QueryDefinition("SELECT * FROM Logs l WHERE l.deviceId = @id");
                query_logs.WithParameter("@id", ultrasoon);
                FeedIterator<Log> iterator_logs = container_logs.GetItemQueryIterator<Log>(query_logs);
                while (iterator_logs.HasMoreResults)
                {
                    FeedResponse<Log> response_log = await iterator_logs.ReadNextAsync();
                    logs.AddRange(response_log);
                }
                return new OkObjectResult(logs);

            }

            catch
            {
                return new StatusCodeResult(500);
            }

        }
    }
}
