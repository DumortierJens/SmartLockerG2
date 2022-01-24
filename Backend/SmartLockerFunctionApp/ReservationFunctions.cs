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
using Microsoft.Azure.Cosmos;
using System.Collections.Generic;
using SmartLockerFunctionApp.Models;

namespace SmartLockerFunctionApp
{
    public class ReservationFunctions : AuthorizedServiceBase
    {
        [FunctionName("GetReserevationsByUserId")]
        public async Task<IActionResult> GetReserevationsByUserId(
         [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reservations/users/{userId}")] HttpRequest req,
         string userId,
         ILogger log)
        {
            try
            {
                if (Auth.Role != "Admin" && userId != "me")
                    return new UnauthorizedResult();
                else if (userId == "me")
                    userId = Auth.Id;

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");

                List<Reservation> reservations = new List<Reservation>();
                QueryDefinition query = new QueryDefinition("SELECT * FROM Reservations r WHERE r.userId = @id");
                query.WithParameter("@id", userId);

                FeedIterator<Reservation> iterator = container.GetItemQueryIterator<Reservation>(query);
                while (iterator.HasMoreResults)
                {
                    FeedResponse<Reservation> response = await iterator.ReadNextAsync();
                    reservations.AddRange(response);
                }

                return new OkObjectResult(reservations);
            }

            catch
            {
                return new StatusCodeResult(500);
            }

        }

        [FunctionName("GetReserevationsByLockerId")]
        public async Task<IActionResult> GetReserevationsByLockerId(
          [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reservations/lockers/{lockerId}")] HttpRequest req,
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
                while (iterator.HasMoreResults)
                {
                    FeedResponse<Reservation> response = await iterator.ReadNextAsync();
                    reservations.AddRange(response);
                }

                return new OkObjectResult(reservations);
            }
            catch
            {
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("AddReservation")]
        public async Task<IActionResult> AddReservation(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "reservations/lockers/{lockerId}")] HttpRequest req,
            Guid lockerId,
            ILogger log)
        {
            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Reservation reservation = JsonConvert.DeserializeObject<Reservation>(requestBody);

                reservation.Id = Guid.NewGuid();
                reservation.LockerId = lockerId;
                reservation.UserId = Auth.Id;
                reservation.IsUsed = false;

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");

                await container.CreateItemAsync(reservation, new PartitionKey(reservation.Id.ToString()));
                
                return new OkObjectResult(reservation);
            }

            catch (Exception)
            {
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("UpdateReservation")]
        public async Task<IActionResult> UpdateReservation(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "reservations/{reservationId}")] HttpRequest req,
            Guid reservationId,
            ILogger log)
        {
            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Reservation updatedReservation = JsonConvert.DeserializeObject<Reservation>(requestBody);

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");

                Reservation reservation;
                try
                {
                    reservation = await container.ReadItemAsync<Reservation>(reservationId.ToString(), new PartitionKey(reservationId.ToString()));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                if (!(Auth.Role == "Admin" || reservation.UserId == Auth.Id))
                    return new UnauthorizedResult();

                reservation.StartTime = updatedReservation.StartTime;
                reservation.EndTime = updatedReservation.EndTime;

                await container.ReplaceItemAsync(reservation, reservation.Id.ToString(), new PartitionKey(reservation.Id.ToString()));

                return new StatusCodeResult(200);
            }

            catch
            {
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("DeleteReservation")]
        public async Task<IActionResult> DeleteReservation(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "reservations/{reservationId}")] HttpRequest req,
            Guid reservationId,
            ILogger log)
        {
            try
            {
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");

                Reservation reservation;
                try
                {
                    reservation = await container.ReadItemAsync<Reservation>(reservationId.ToString(), new PartitionKey(reservationId.ToString()));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                if (!(Auth.Role == "Admin" || reservation.UserId == Auth.Id))
                    return new UnauthorizedResult();

                await container.DeleteItemAsync<Reservation>(reservationId.ToString(), new PartitionKey(reservationId.ToString()));

                return new StatusCodeResult(200);
            }

            catch
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
