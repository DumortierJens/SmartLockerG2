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

namespace SmartLockerFunctionApp
{
    public class LockerFunctions : AuthorizedServiceBase
    {
        [FunctionName("OpenLocker")]
        public async Task<IActionResult> OpenLocker(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "lockers/{lockerId}/open")] HttpRequest req,
            Guid lockerId,
            ILogger log)
        {
            try
            {
                ServiceClient serviceClient = ServiceClient.CreateFromConnectionString(Environment.GetEnvironmentVariable("IoTHubAdmin"));
                
                CloudToDeviceMethod cloudToDeviceMethod = new CloudToDeviceMethod("open");
                await serviceClient.InvokeDeviceMethodAsync(lockerId.ToString(), cloudToDeviceMethod);

                return new OkResult();
            }

            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
