using Microsoft.Azure.Cosmos;
using SmartLockerFunctionApp.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace SmartLockerFunctionApp.Services.LockerManagement
{
    public class LockerConnector
    {
        private static CosmosClient _cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
        public static Container Container = _cosmosClient.GetContainer("SmartLocker", "Lockers");

        public static async Task<List<Locker>> GetLockersAsync()
        {
            List<Locker> lockers = new List<Locker>();
            QueryDefinition query = new QueryDefinition("SELECT * FROM Lockers");

            FeedIterator<Locker> iterator = Container.GetItemQueryIterator<Locker>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Locker> response = await iterator.ReadNextAsync();
                lockers.AddRange(response);
            }

            return lockers;
        }
    }
}
