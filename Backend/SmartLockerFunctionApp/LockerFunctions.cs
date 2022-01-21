using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using SmartLockerFunctionApp.Services.Authentication;
using Microsoft.Azure.Devices;
using SmartLockerFunctionApp.Services.LockerManagement;
using SmartLockerFunctionApp.Models;
using Microsoft.Azure.Cosmos;

namespace SmartLockerFunctionApp
{
    public class LockerFunctions : AuthorizedServiceBase
    {
        [FunctionName("GetLockers")]
        public async Task<IActionResult> GetLockers(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "lockers")] HttpRequest req,
            ILogger log)
        {
            try
            {
                var lockers = await LockerConnector.GetLockersAsync();

                return new OkObjectResult(lockers);
            }
            catch
            {
                return new StatusCodeResult(500);
            }

        }

        [FunctionName("GetLockerById")]
        public async Task<IActionResult> GetLockerByID(
          [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "lockers/{lockerId}")] HttpRequest req,
          Guid lockerId,
          ILogger log)
        {
            try
            {
                Locker locker;
                try
                {
                    locker = await LockerConnector.Container.ReadItemAsync<Locker>(lockerId.ToString(), new PartitionKey(lockerId.ToString()));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                return new OkObjectResult(locker);
            }
            catch
            {
                return new StatusCodeResult(500);
            }

        }

        [FunctionName("OpenLocker")]
        public async Task<IActionResult> OpenLocker(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "lockers/{lockerId}/open")] HttpRequest req,
            Guid lockerId,
            ILogger log)
        {
            try
            {
                if (Auth.Role != "Admin" && !await LockerManagementService.CheckRegistrationAsync(lockerId, Auth.Id))
                    return new UnauthorizedResult();

                ServiceClient serviceClient = ServiceClient.CreateFromConnectionString(Environment.GetEnvironmentVariable("IoTHubAdmin"));

                CloudToDeviceMethod cloudToDeviceMethod = new CloudToDeviceMethod("open");
                await serviceClient.InvokeDeviceMethodAsync(lockerId.ToString(), cloudToDeviceMethod);

                return new OkObjectResult("Locker opened");
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
