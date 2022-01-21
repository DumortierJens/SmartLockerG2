using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;
using SmartLockerFunctionApp.Models;

namespace SmartLockerFunctionApp.Services.LockerManagement
{
    public static class LockerManagementService
    {
        public static async Task<bool> ValidateReservationAsync(Reservation reservation)
        {
            if (reservation.StartTime > reservation.EndTime || reservation.EndTime < DateTime.Now)
                return false;

            // Check current registration

            var reservations = await GetReservationsAsync(reservation.LockerId);
            foreach (var validReservation in reservations)
            {
                if (reservation.StartTime < validReservation.EndTime)
                {
                    if (reservation.EndTime > validReservation.StartTime)
                        return false;
                    else
                        break;
                }
            }

            return true;
        }

        public static async Task<bool> ValidateStartRegistrationAsync(Registration registration)
        {
            var currentRegistration = await GetCurrentRegistrationAsync(registration.LockerId);
            if (currentRegistration != null)
                return false;

            var currentReservation = await GetCurrentReservationAsync(registration.LockerId);
            if (currentReservation != null && currentReservation.StartTime < DateTime.Now)
                return false;

            return true;
        }

        public static async Task<bool> ValidateStopRegistrationAsync(Registration registration)
        {
            if (registration.EndTime != DateTime.MinValue && registration.StartTime > registration.EndTime)
                return false;

            var currentRegistration = await GetCurrentRegistrationAsync(registration.LockerId);
            if (currentRegistration == null)
                return false;

            return true;
        }

        public static async Task<bool> CheckRegistrationAsync(Guid lockerId, string userId)
        {
            var currentUserRegistration = await GetCurrentUserRegistrationAsync(lockerId, userId);

            if (currentUserRegistration == null)
                return false;

            return true;
        }

        private static async Task<List<Reservation>> GetReservationsAsync(Guid lockerId)
        {
            CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
            Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");

            List<Reservation> reservations = new List<Reservation>();
            QueryDefinition query = new QueryDefinition("SELECT * FROM Reservations r WHERE r.lockerId = @id and r.endTime > @endTime ORDER BY r.startTime LIMIT 1");
            query.WithParameter("@id", lockerId);
            query.WithParameter("@endTime", DateTime.Now);

            FeedIterator<Reservation> iterator = container.GetItemQueryIterator<Reservation>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Reservation> response = await iterator.ReadNextAsync();
                reservations.AddRange(response);
            }

            return reservations;
        }

        private static async Task<Reservation> GetCurrentReservationAsync(Guid lockerId)
        {
            CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
            Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");

            List<Reservation> reservations = new List<Reservation>();
            QueryDefinition query = new QueryDefinition("SELECT TOP 1 * FROM Reservations r WHERE r.lockerId = @id and r.endTime > @now ORDER BY r.startTime");
            query.WithParameter("@id", lockerId);
            query.WithParameter("@now", DateTime.Now);

            FeedIterator<Reservation> iterator = container.GetItemQueryIterator<Reservation>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Reservation> response = await iterator.ReadNextAsync();
                reservations.AddRange(response);
            }

            return reservations.Count > 0 ? reservations[0] : null;
        }

        private static async Task<Registration> GetCurrentRegistrationAsync(Guid lockerId)
        {
            CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
            Container container = cosmosClient.GetContainer("SmartLocker", "Registrations");

            List<Registration> registrations = new List<Registration>();
            QueryDefinition query = new QueryDefinition("SELECT TOP 1 * FROM Registrations r WHERE r.lockerId = @id and r.endTime = '0001-01-01T00:00:00' ORDER BY r.startTime");
            query.WithParameter("@id", lockerId);

            FeedIterator<Registration> iterator = container.GetItemQueryIterator<Registration>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Registration> response = await iterator.ReadNextAsync();
                registrations.AddRange(response);
            }

            return registrations.Count > 0 ? registrations[0] : null;
        }

        private static async Task<Registration> GetCurrentUserRegistrationAsync(Guid lockerId, string userId)
        {
            CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
            Container container = cosmosClient.GetContainer("SmartLocker", "Registrations");

            List<Registration> registrations = new List<Registration>();
            QueryDefinition query = new QueryDefinition("SELECT TOP 1 * FROM Registrations r WHERE (r.lockerId = @id and r.userId = @userId) and r.endTime = '0001-01-01T00:00:00' ORDER BY r.startTime");
            query.WithParameter("@id", lockerId);
            query.WithParameter("@userId", userId);

            try
            {
                FeedIterator<Registration> iterator = container.GetItemQueryIterator<Registration>(query);
                while (iterator.HasMoreResults)
                {
                    FeedResponse<Registration> response = await iterator.ReadNextAsync();
                    registrations.AddRange(response);
                }
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }

            return registrations.Count > 0 ? registrations[0] : null;
        }
    }
}
