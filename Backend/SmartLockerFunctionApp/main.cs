using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using System.Text;
using System.Net.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using SmartLockerFunctionApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs.Extensions.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.IO;
using Microsoft.Azure.Cosmos;
using SmartLockerFunctionApp.Services.Authentication;

namespace SmartLockerFunctionApp
{
    class Main : AuthorizedServiceBase
    {
        [FunctionName("GetMaterialStatusById")]
        public async Task<IActionResult> GetMaterialStatusById(
          [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "devices/{deviceId}/status")] HttpRequest req,
          Guid deviceId,
          ILogger log)
        {
            try
            {
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Logs");
                List<Log> logs = new List<Log>();
                QueryDefinition query = new QueryDefinition("SELECT TOP 1 * FROM Logs l WHERE l.deviceId = @id ORDER BY l.timestamp DESC");
                query.WithParameter("@id", deviceId);
                FeedIterator<Log> iterator = container.GetItemQueryIterator<Log>(query);
                FeedResponse<Log> response = await iterator.ReadNextAsync();
                logs.AddRange(response);
                return new OkObjectResult(logs);
            }
            catch
            {
                return new StatusCodeResult(500);
            }

        }

        
    }
}
