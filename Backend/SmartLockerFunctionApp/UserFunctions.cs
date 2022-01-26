using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using SmartLockerFunctionApp.Services.Authentication;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace SmartLockerFunctionApp
{
    class UserFunctions : AuthorizedServiceBase
    {
        [FunctionName("GetUsers")]
        public async Task<IActionResult> GetUsers(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "users")] HttpRequest req,
            ILogger log)
        {
            try
            {
                if (Auth.Role != "Admin")
                    return new UnauthorizedResult();

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Users");

                List<Models.User> users = new List<Models.User>();
                QueryDefinition query = new QueryDefinition("SELECT * FROM Users u WHERE u.role = 'User'");
                FeedIterator<Models.User> iterator = container.GetItemQueryIterator<Models.User>(query);
                while (iterator.HasMoreResults)
                {
                    FeedResponse<Models.User> response = await iterator.ReadNextAsync();
                    users.AddRange(response);
                }

                return new OkObjectResult(users);
            }
            catch (Exception)
            {
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("GetUser")]
        public async Task<IActionResult> GetUser(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "users/{userId}")] HttpRequest req,
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
                Container container = cosmosClient.GetContainer("SmartLocker", "Users");

                Models.User user;
                try
                {
                    user = await container.ReadItemAsync<Models.User>(userId, new PartitionKey(userId));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                return new OkObjectResult(user);
            }
            catch (Exception)
            {
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("BlockUser")]
        public async Task<IActionResult> BlockUser(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "users/{userId}/block")] HttpRequest req,
            string userId,
            ILogger log)
        {
            try
            {
                if (Auth.Role != "Admin")
                    return new UnauthorizedResult();

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Users");

                Models.User user;
                try
                {
                    user = await container.ReadItemAsync<Models.User>(userId, new PartitionKey(userId));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                user.IsBlocked = true;
                await container.ReplaceItemAsync(user, user.Id, new PartitionKey(user.Id));

                return new OkObjectResult(user);
            }
            catch (Exception)
            {
                return new OkResult();
            }
        }

        [FunctionName("UnBlockUser")]
        public async Task<IActionResult> UnBlockUser(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "users/{userId}/unblock")] HttpRequest req,
            string userId,
            ILogger log)
        {
            try
            {
                if (Auth.Role != "Admin")
                    return new UnauthorizedResult();

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Users");

                Models.User user;
                try
                {
                    user = await container.ReadItemAsync<Models.User>(userId, new PartitionKey(userId));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                user.IsBlocked = false;
                await container.ReplaceItemAsync(user, user.Id, new PartitionKey(user.Id));

                return new OkObjectResult(user);
            }
            catch (Exception)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
