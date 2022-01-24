using Microsoft.Azure.Cosmos;
using SmartLockerFunctionApp.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace SmartLockerFunctionApp.Services.LockerManagement
{
    public class ReservationService
    {
        private static readonly CosmosClient _cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
        public static readonly Container Container = _cosmosClient.GetContainer("SmartLocker", "Reservations");

        public static async Task<List<Reservation>> GetReservationsAsync()
        {
            List<Reservation> reservations = new List<Reservation>();
            QueryDefinition query = new QueryDefinition("SELECT * FROM Reservations r ORDER BY r.startTime");
            query.WithParameter("@minEndTime", DateTime.Now);

            FeedIterator<Reservation> iterator = Container.GetItemQueryIterator<Reservation>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Reservation> response = await iterator.ReadNextAsync();
                reservations.AddRange(response);
            }

            return reservations;
        }

        public static async Task<List<Reservation>> GetReservationsAsync(Guid lockerId)
        {
            List<Reservation> reservations = new List<Reservation>();
            QueryDefinition query = new QueryDefinition("SELECT * FROM Reservations r WHERE r.lockerId = @id ORDER BY r.startTime");
            query.WithParameter("@id", lockerId);

            FeedIterator<Reservation> iterator = Container.GetItemQueryIterator<Reservation>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Reservation> response = await iterator.ReadNextAsync();
                reservations.AddRange(response);
            }

            return reservations;
        }

        public static async Task<List<Reservation>> GetReservationsNewAsync(Guid lockerId)
        {
            List<Reservation> reservations = new List<Reservation>();
            QueryDefinition query = new QueryDefinition("SELECT TOP 1 * FROM Reservations r WHERE r.lockerId = @id and r.endTime > @now ORDER BY r.startTime");
            query.WithParameter("@id", lockerId);
            query.WithParameter("@now", DateTime.Now);

            FeedIterator<Reservation> iterator = Container.GetItemQueryIterator<Reservation>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Reservation> response = await iterator.ReadNextAsync();
                reservations.AddRange(response);
            }

            return reservations;
        }

        public static async Task<List<Reservation>> GetReservationsAsync(string userId)
        {
            List<Reservation> reservations = new List<Reservation>();
            QueryDefinition query = new QueryDefinition("SELECT * FROM Reservations r WHERE r.userId = @userId ORDER BY r.startTime");
            query.WithParameter("@userId", userId);

            FeedIterator<Reservation> iterator = Container.GetItemQueryIterator<Reservation>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Reservation> response = await iterator.ReadNextAsync();
                reservations.AddRange(response);
            }

            return reservations;
        }
    }
}
