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
        [FunctionName("GetUserDetails")]
        public async Task<IActionResult> GetUserDetails(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "users/me")] HttpRequest req,
            ILogger log)
        {
            try
            {
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Users");

                Models.User user;
                try
                {
                    user = await container.ReadItemAsync<Models.User>(Auth.Id, new PartitionKey(Auth.Id));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                return new OkObjectResult(user);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
