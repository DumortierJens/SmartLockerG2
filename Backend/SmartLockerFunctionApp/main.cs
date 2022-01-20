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
using SmartLockerFunctionApp.Services.Authentication;

namespace SmartLockerFunctionApp
{
    class main : AuthorizedServiceBase
    {
        [FunctionName("StatusLog")]
        public async Task<IActionResult> StatusLog(
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
        public async Task<IActionResult> GetLockers(
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
        [FunctionName("GetLockerByID")]
        public async Task<IActionResult> GetLockerByID(
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
        
        [FunctionName("GetMaterialStatusById")]
        public async Task<IActionResult> GetMaterialStatusById(
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
        [FunctionName("AddReservationMe")]
        public async Task<IActionResult> AddReservationMe(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "reservations/{lockerId}")] HttpRequest req,
            Guid lockerId,
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
                newReservation.UserId = Auth.Id;

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");
                await container.CreateItemAsync<Reservation>(newReservation, new PartitionKey(Auth.Id));
                return new StatusCodeResult(200);
            }

            catch
            {
                return new StatusCodeResult(500);
            }
        }
        [FunctionName("GetReserevationsByLockerId")]
        public async Task<IActionResult> GetReserevationsByLockerId(
          [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "lockers/reservations/{lockerId}")] HttpRequest req,
          Guid lockerId,
          ILogger log)
        {
            try
            {
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");
                List<Reservation> reservations = new List<Reservation>();
                QueryDefinition query = new QueryDefinition("SELECT * FROM Reservations r WHERE r.lockerId = @id");
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
        [FunctionName("GetReserevationsByMe")]
        public async Task<IActionResult> GetReserevationsByMe(
         [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "users/reservations/me")] HttpRequest req,
         ILogger log)
        {
            try
            {
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");
                List<Reservation> reservations = new List<Reservation>();
                QueryDefinition query = new QueryDefinition("SELECT * FROM Reservations r WHERE r.userId = @id");
                query.WithParameter("@id", Auth.Id);
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
        public async Task<IActionResult> GetReserevationsByUserId(
         [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "users/reservations/{userId}")] HttpRequest req,
         string userId,
         ILogger log)
        {
            try
            {
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");
                List<Reservation> reservations = new List<Reservation>();
                QueryDefinition query = new QueryDefinition("SELECT * FROM Reservations r WHERE r.userId = @id");
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
