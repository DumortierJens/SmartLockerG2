using Microsoft.Azure.Cosmos;
using SmartLockerFunctionApp.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace SmartLockerFunctionApp.Services.LockerManagement
{
    public class RegistrationService
    {
        private static CosmosClient CosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
        private static Container Container = CosmosClient.GetContainer("SmartLocker", "Registrations");

        public static async Task<List<Registration>> GetRegistrationsAsync()
        {
            List<Registration> registrations = new List<Registration>();
            QueryDefinition query = new QueryDefinition("SELECT * FROM Registrations r");

            FeedIterator<Registration> iterator = Container.GetItemQueryIterator<Registration>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Registration> response = await iterator.ReadNextAsync();
                registrations.AddRange(response);
            }

            return registrations;
        }

        public static async Task<List<Registration>> GetRegistrationsAsync(Guid lockerId)
        {
            List<Registration> registrations = new List<Registration>();
            QueryDefinition query = new QueryDefinition("SELECT * FROM Registrations r WHERE r.lockerId = @id ORDER BY r.startTime ASC");
            query.WithParameter("@id", lockerId);

            FeedIterator<Registration> iterator = Container.GetItemQueryIterator<Registration>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Registration> response = await iterator.ReadNextAsync();
                registrations.AddRange(response);
            }

            return registrations;
        }

        public static async Task<Registration> GetCurrentRegistrationAsync(Guid lockerId)
        {
            List<Registration> registrations = new List<Registration>();
            QueryDefinition query = new QueryDefinition("SELECT TOP 1 * FROM Registrations r WHERE r.lockerId = @id and r.endTime = '0001-01-01T00:00:00' ORDER BY r.startTime");
            query.WithParameter("@id", lockerId);

            FeedIterator<Registration> iterator = Container.GetItemQueryIterator<Registration>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Registration> response = await iterator.ReadNextAsync();
                registrations.AddRange(response);
            }

            return registrations.Count > 0 ? registrations[0] : null;
        }

        public static async Task<Registration> GetCurrentRegistrationAsync(Guid lockerId, string userId)
        {
            List<Registration> registrations = new List<Registration>();
            QueryDefinition query = new QueryDefinition("SELECT TOP 1 * FROM Registrations r WHERE (r.lockerId = @id and r.userId = @userId) and r.endTime = '0001-01-01T00:00:00' ORDER BY r.startTime");
            query.WithParameter("@id", lockerId);
            query.WithParameter("@userId", userId);

            try
            {
                FeedIterator<Registration> iterator = Container.GetItemQueryIterator<Registration>(query);
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
