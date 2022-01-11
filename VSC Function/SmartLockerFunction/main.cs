using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using System.Text;
using System.Net.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs.Extensions.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
namespace SmartLockerFunction
{
    class main
    {
        [FunctionName("GetCodes")]
        public static async Task<IActionResult> RunAzureTableStorage(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "codes/{email}")] HttpRequest req, string email,
            ILogger log)
        {

            try
            {
                CloudStorageAccount storageAccount = CloudStorageAccount.Parse(Environment.GetEnvironmentVariable("AzureStorageConStr"));
                CloudTableClient client = storageAccount.CreateCloudTableClient();
                CloudTable table = client.GetTableReference("struyvemattice");

                TableQuery<CodeEntity> rangeQuery = new TableQuery<CodeEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, email));

                var queryResult = await table.ExecuteQuerySegmentedAsync<CodeEntity>(rangeQuery, null);
                List<ReceivedCode> receivedCodes = new List<ReceivedCode>();

                foreach (var reg in queryResult.Results)
                {
                    receivedCodes.Add(new ReceivedCode()
                    {
                        Code = reg.Code,
                        Timestamp = reg.Timestamp,
                        EMail = reg.PartitionKey

                    });
                }
                return new OkObjectResult(receivedCodes);
            }
            catch (Exception ex)
            {

                throw ex;
            }


        }
    }
}
