using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using System.Text;
using System.Net.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using SmartLockerFunction.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs.Extensions.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.IO;
using Microsoft.Azure.Cosmos;

namespace SmartLockerFunction
{
    class main
    {
        [FunctionName("StatusLock")]
        public static async Task<IActionResult> StatusLock(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "data/{lockerid}/{status}")] HttpRequest req, int lockerid, bool status,
            ILogger log)
        {
            try
            {

                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Device device = JsonConvert.DeserializeObject<Device>(requestBody);

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Database database = cosmosClient.GetDatabase("SmartLocker");
                Container container = database.GetContainer("Logs");

                QueryDefinition queryDefinition = new QueryDefinition("INSERT INTO Logs (DeviceName, Status, Timestamp) VALUES(Lock, @Status, @Timestamp); ");
                queryDefinition.WithParameter("@Status", status);
                queryDefinition.WithParameter("@Timestamp", DateTime.UtcNow);

            }

            catch (Exception ex)
            {
                throw ex;
            }

            return new OkObjectResult("");
        }

        [FunctionName("StatusMaterial")]
        public static async Task<IActionResult> StatusMaterial(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "data/{lockerid}/{devicename}/{status}")] HttpRequest req, int lockerid, string devicename, bool status,
            ILogger log)
        {
            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Device device = JsonConvert.DeserializeObject<Device>(requestBody);

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Database database = cosmosClient.GetDatabase("SmartLocker");
                Container container = database.GetContainer("Logs");

                QueryDefinition queryDefinition = new QueryDefinition("INSERT INTO Logs (DeviceName, Status, Timestamp) VALUES(@DeviceName, @Status, @Timestamp);");
                queryDefinition.WithParameter("@DeviceName", devicename);
                queryDefinition.WithParameter("@Status", status);
                queryDefinition.WithParameter("@Timestamp", DateTime.UtcNow);

            }

            catch (Exception ex)
            {
                throw ex;
            }

            return new OkObjectResult("");
        }

        //[FunctionName("GetLockerDetails")]
        //public static async Task<IActionResult> GetLockerDetails(
        //    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "data/{lockerid}")] HttpRequest req, int lockerid,
        //    ILogger log)
        //{
        //    try
        //    {



        //    }

        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //return new OkObjectResult("");
        //}
    }
}
