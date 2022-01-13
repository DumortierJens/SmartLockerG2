using IoTHubTrigger = Microsoft.Azure.WebJobs.EventHubTriggerAttribute;

using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Azure.EventHubs;
using System.Text;
using System.Net.Http;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs.Extensions.Http;
using System;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Devices;
using SmartLockerFunctionApp.Models;
using Newtonsoft.Json;
using Microsoft.Azure.Cosmos;

namespace SmartLockerFunctionApp
{
    public class LockerFunctions
    {
        [FunctionName("ReceiveLockerMessages")]
        public async Task ReceiveLockerMessages([IoTHubTrigger("messages/events", Connection = "IoTHub")]EventData message, ILogger log)
        {
            string json = Encoding.UTF8.GetString(message.Body.Array);
            Log newLog = JsonConvert.DeserializeObject<Log>(json);
            
            newLog.Id = Guid.NewGuid();
            newLog.Timestamp = DateTime.UtcNow;

            CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
            Container container = cosmosClient.GetContainer("SmartLocker", "Logs");
            await container.CreateItemAsync<Log>(newLog, new PartitionKey(newLog.DeviceId.ToString()));
        }

        [FunctionName("OpenLocker")]
        public static async Task<IActionResult> OpenLocker(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "lockers/{lockerId}/open")] HttpRequest req,
            Guid lockerId,
            ILogger log)
        {
            try
            {
                ServiceClient serviceClient = ServiceClient.CreateFromConnectionString(Environment.GetEnvironmentVariable("IoTHubAdmin"));
                CloudToDeviceMethod cloudToDeviceMethod = new CloudToDeviceMethod("open");
                await serviceClient.InvokeDeviceMethodAsync(lockerId.ToString(), cloudToDeviceMethod);

                return new StatusCodeResult(200);
            }

            catch (Exception ex)
            {
                log.LogError(ex.ToString());
                //throw ex;
                return new StatusCodeResult(500);
            }


        }
    }
}