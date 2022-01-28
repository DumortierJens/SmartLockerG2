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
using SmartLockerFunctionApp.Services.LockerManagement;

namespace SmartLockerFunctionApp
{
    public class ReservationFunctions : AuthorizedServiceBase
    {
        [FunctionName("GetReserevations")]
        public async Task<IActionResult> GetReserevations(
         [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reservations")] HttpRequest req,
         ILogger log)
        {
            try
            {
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 851, message = "This account is blocked" });

                if (Auth.Role != "Admin")
                    return new UnauthorizedResult();

                var reservations = await ReservationService.GetReservationsAsync();

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
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 851, message = "This account is blocked" });

                var reservations = await ReservationService.GetReservationsAsync(lockerId);

                return new OkObjectResult(reservations);
            }

            catch
            {
                return new StatusCodeResult(500);
            }

        }

        [FunctionName("GetReserevationsByUserId")]
        public async Task<IActionResult> GetReserevationsByUserId(
         [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "reservations/users/{userId}")] HttpRequest req,
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

                var reservations = await ReservationService.GetReservationsAsync(userId);

                return new OkObjectResult(reservations);
            }
            catch
            {
                return new StatusCodeResult(500);
            }

        }

        [FunctionName("AddReservation")]
        public async Task<IActionResult> AddReservation(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "reservations/users/{userId}")] HttpRequest req,
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

                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Reservation reservation = JsonConvert.DeserializeObject<Reservation>(requestBody);

                reservation.Id = Guid.NewGuid();
                reservation.UserId = userId;
                reservation.IsUsed = false;

                // Validate reservation
                if (!await LockerManagementService.ValidateReservationAsync(reservation, reservation.StartTime))
                    return new BadRequestObjectResult(new { code = 805, message = "Time slot is not available" });

                await ReservationService.Container.CreateItemAsync(reservation, new PartitionKey(reservation.Id.ToString()));
                
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
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 851, message = "This account is blocked" });

                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Reservation updatedReservation = JsonConvert.DeserializeObject<Reservation>(requestBody);

                Reservation reservation;
                try
                {
                    reservation = await ReservationService.Container.ReadItemAsync<Reservation>(reservationId.ToString(), new PartitionKey(reservationId.ToString()));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                if (!(Auth.Role == "Admin" || reservation.UserId == Auth.Id))
                    return new UnauthorizedResult();

                reservation.StartTime = updatedReservation.StartTime;
                reservation.EndTime = updatedReservation.EndTime;

                // Validate reservation
                if (!await LockerManagementService.ValidateReservationAsync(reservation, reservation.StartTime))
                    return new BadRequestObjectResult(new { code = 805, message = "Time slot is not available" });

                await ReservationService.Container.ReplaceItemAsync(reservation, reservation.Id.ToString(), new PartitionKey(reservation.Id.ToString()));

                return new OkObjectResult(reservation);
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
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 851, message = "This account is blocked" });

                Reservation reservation;
                try
                {
                    reservation = await ReservationService.Container.ReadItemAsync<Reservation>(reservationId.ToString(), new PartitionKey(reservationId.ToString()));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                if (!(Auth.Role == "Admin" || reservation.UserId == Auth.Id))
                    return new UnauthorizedResult();

                await ReservationService.Container.DeleteItemAsync<Reservation>(reservationId.ToString(), new PartitionKey(reservationId.ToString()));

                return new OkObjectResult(reservation);
            }
            catch
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
