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
                newLog.Timestamp = DateTime.UtcNow;
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

        [FunctionName("GetLockers")]
        public static async Task<IActionResult> GetLockers(
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
        [FunctionName("GetLockerById")]
        public static async Task<IActionResult> GetLockerByID(
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
                return new OkObjectResult(lockers[0]);
            }
            catch
            {
                return new StatusCodeResult(500);
            }

        }
        
        [FunctionName("GetMaterialStatusByDeviceId")]
        public static async Task<IActionResult> GetMaterialStatusById(
          [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "devices/{deviceId}/status")] HttpRequest req,
          Guid deviceId,
          ILogger log)
        {
            try
            {
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Logs");
                List<Log> logs = new List<Log>();
                QueryDefinition query = new QueryDefinition("SELECT TOP 1 * FROM Logs l WHERE l.deviceId = @id ORDER BY l.timestamp DESC");
                query.WithParameter("@id", deviceId);
                FeedIterator<Log> iterator = container.GetItemQueryIterator<Log>(query);
                FeedResponse<Log> response = await iterator.ReadNextAsync();
                logs.AddRange(response);
                return new OkObjectResult(logs);
            }

            catch
            {
                return new StatusCodeResult(500);
            }

        }
        [FunctionName("AddReservation")]
        public static async Task<IActionResult> AddReservation(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "reservations/{lockerId}/{userId}")] HttpRequest req,
            Guid lockerId, string userId,
            ILogger log)
        {
            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Reservation newReservation = JsonConvert.DeserializeObject<Reservation>(requestBody);

                newReservation.Id = Guid.NewGuid();
                newReservation.StartTime = DateTime.UtcNow;
                newReservation.EndTime = DateTime.UtcNow;
                newReservation.IsUsed = true;
                newReservation.LockerId = lockerId;
                newReservation.UserId = userId;

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");
                await container.CreateItemAsync<Reservation>(newReservation, new PartitionKey(userId));
                return new StatusCodeResult(200);
            }

            catch
            {
                return new StatusCodeResult(500);
            }
        }
        [FunctionName("GetReserevationsByLockerId")]
        public static async Task<IActionResult> GetReserevationsByLockerId(
          [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reservations/{lockerId}")] HttpRequest req,
          string lockerId,
          ILogger log)
        {
            try
            {
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");
                List<Reservation> reservations = new List<Reservation>();
                QueryDefinition query = new QueryDefinition("SELECT * FROM Reservations r WHERE r.lockerId = @id DESC");
                query.WithParameter("@id", lockerId);
                FeedIterator<Reservation> iterator = container.GetItemQueryIterator<Reservation>(query);
                FeedResponse<Reservation> response = await iterator.ReadNextAsync();
                reservations.AddRange(response);
                return new OkObjectResult(reservations);
            }

            catch
            {
                return new StatusCodeResult(500);
            }

        }
        [FunctionName("GetReserevationsByUserId")]
        public static async Task<IActionResult> GetReserevationsByUserId(
         [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reservations/{userId}")] HttpRequest req,
         string userId,
         ILogger log)
        {
            try
            {
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");
                List<Reservation> reservations = new List<Reservation>();
                QueryDefinition query = new QueryDefinition("SELECT * FROM Reservations r WHERE r.lockerId = @id DESC");
                query.WithParameter("@id", userId);
                FeedIterator<Reservation> iterator = container.GetItemQueryIterator<Reservation>(query);
                FeedResponse<Reservation> response = await iterator.ReadNextAsync();
                reservations.AddRange(response);
                return new OkObjectResult(reservations);
            }

            catch
            {
                return new StatusCodeResult(500);
            }

        }
    }
}
