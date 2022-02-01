using Microsoft.Azure.Cosmos;
using SmartLockerFunctionApp.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace SmartLockerFunctionApp.Services.ErrorLogging
{
    public static class ErrorService
    {
        public static async Task SaveError(Error error)
        {
            try
            {
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "ErrorLogging");
                await container.CreateItemAsync(error, new PartitionKey(error.Id.ToString()));
            }
            catch (Exception)
            {
                return;
            }
        }
    }
}
