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
using Azure.Messaging.WebPubSub;
using Newtonsoft.Json.Linq;
using SmartLockerFunctionApp.Services.LockerManagement;

namespace SmartLockerFunctionApp
{
    public class LockerReceiveMessages
    {
        [FunctionName("ReceiveLockerMessages")]
        public async Task ReceiveLockerMessages([IoTHubTrigger("messages/events", Connection = "IoTHub")] EventData message, ILogger log)
        {
            string json = Encoding.UTF8.GetString(message.Body.Array);
            log.LogInformation(json);

            Log newLog = JsonConvert.DeserializeObject<Log>(json);
            newLog.Id = Guid.NewGuid();
            newLog.Timestamp = DateTime.UtcNow;

            JObject jObject = JObject.Parse(json);
            Guid lockerId = Guid.Parse(jObject["iotDeviceId"].ToString());

            // Save in CosmosDB
            CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
            Container container = cosmosClient.GetContainer("SmartLocker", "Logs");
            await container.CreateItemAsync<Log>(newLog, new PartitionKey(newLog.DeviceId.ToString()));

            // Send device + newLog to all users with websockets
            Models.Device device = await LockerService.DeviceContainer.ReadItemAsync<Models.Device>(newLog.DeviceId.ToString(), new PartitionKey(lockerId.ToString()));
            WebPubSubServiceClient serviceClient = new WebPubSubServiceClient(Environment.GetEnvironmentVariable("PubSub"), "SmartLockerHub");
            await serviceClient.SendToAllAsync(JsonConvert.SerializeObject(new { device, log = newLog }));
        }
    }
}