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
        public static async Task<bool> ValidateReservation(Reservation reservation)
        {
            if (reservation.StartTime > reservation.EndTime || reservation.EndTime < DateTime.Now)
                return false;

            var reservations = await GetReservations(reservation.LockerId);
            var currentRegistration = await GetCurrentRegistration(reservation.LockerId);

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

        public static async Task<bool> ValidateRegistration(Registration registration)
        {
            if (registration.StartTime > registration.EndTime || registration.EndTime < DateTime.Now)
                return false;

            var currentRegistration = await GetCurrentRegistration(registration.LockerId);
            if (currentRegistration != null)
                return false;

            var currentReservation = await GetCurrentReservation(registration.LockerId);
            if (currentReservation != null && currentReservation.StartTime < DateTime.Now)
                return false;

            return true;
        }

        private static async Task<List<Reservation>> GetReservations(Guid lockerId)
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

        private static async Task<Reservation> GetCurrentReservation(Guid lockerId)
        {
            CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
            Container container = cosmosClient.GetContainer("SmartLocker", "Reservations");

            List<Reservation> reservations = new List<Reservation>();
            QueryDefinition query = new QueryDefinition("SELECT TOP 1 * FROM Reservations r WHERE r.lockerId = @id and r.endTime > @endTime ORDER BY r.startTime");
            query.WithParameter("@id", lockerId);
            query.WithParameter("@endTime", DateTime.Now);

            FeedIterator<Reservation> iterator = container.GetItemQueryIterator<Reservation>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Reservation> response = await iterator.ReadNextAsync();
                reservations.AddRange(response);
            }

            return reservations.Count > 0 ? reservations[0] : null;
        }

        private static async Task<Registration> GetCurrentRegistration(Guid lockerId)
        {
            CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
            Container container = cosmosClient.GetContainer("SmartLocker", "Registration");

            List<Registration> registrations = new List<Registration>();
            QueryDefinition query = new QueryDefinition("SELECT TOP 1 * FROM Registrations r WHERE r.lockerId = @id and r.endTime = @endTime");
            query.WithParameter("@id", lockerId);
            query.WithParameter("@endTime", DateTime.Now);

            FeedIterator<Registration> iterator = container.GetItemQueryIterator<Registration>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Registration> response = await iterator.ReadNextAsync();
                registrations.AddRange(response);
            }

            return registrations.Count > 0 ? registrations[0] : null;
        }
    }
}
