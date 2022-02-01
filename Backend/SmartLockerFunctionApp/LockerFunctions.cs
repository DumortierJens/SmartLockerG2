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
using System.Collections.Generic;
using System.Security.Authentication;

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
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 888, message = "This account is blocked" });

                var lockers = await LockerService.GetLockersAsync();

                for (int i = 0; i < lockers.Count; i++)
                {
                    lockers[i] = await LockerManagementService.UpdateLockerStatusAsync(lockers[i]);
                }

                return new OkObjectResult(lockers);
            }
            catch (Exception)
            {
                return new StatusCodeResult(400);
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
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 888, message = "This account is blocked" });

                Locker locker;
                try
                {
                    locker = await LockerService.LockerContainer.ReadItemAsync<Locker>(lockerId.ToString(), new PartitionKey(lockerId.ToString()));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                locker = await LockerManagementService.UpdateLockerStatusAsync(locker);

                return new OkObjectResult(locker);
            }
            catch (Exception)
            {
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("GetLockerStatus")]
        public async Task<IActionResult> GetLockerLockStatus(
          [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "lockers/{lockerId}/status")] HttpRequest req,
          Guid lockerId,
          ILogger log)
        {
            try
            {
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 888, message = "This account is blocked" });

                List<bool> materialStatus = await LockerService.GetLockerMaterialStatusAsync(lockerId);
                bool lockStatus = await LockerService.CheckLockStatusAsync(lockerId);

                return new OkObjectResult(new { lockStatus, materialStatus });
            }
            catch (Exception)
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
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 888, message = "This account is blocked" });

                if (Auth.Role != "Admin" && !await LockerManagementService.CheckRegistrationAsync(lockerId, Auth.Id))
                    return new UnauthorizedResult();

                ServiceClient serviceClient = ServiceClient.CreateFromConnectionString(Environment.GetEnvironmentVariable("IoTHubAdmin"));
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Lockers");

                Locker locker;

                try
                {
                    CloudToDeviceMethod cloudToDeviceMethod = new CloudToDeviceMethod("open");
                    await serviceClient.InvokeDeviceMethodAsync(lockerId.ToString(), cloudToDeviceMethod);
                }
                catch (Exception)
                {
                    locker = await container.ReadItemAsync<Locker>(lockerId.ToString(), new PartitionKey(lockerId.ToString()));
                    locker.Status = "Buiten gebruik";
                    await container.ReplaceItemAsync(locker, locker.Id.ToString(), new PartitionKey(locker.Id.ToString()));
                    return new StatusCodeResult(503);
                }

                return new OkObjectResult(new { Message = "Locker Opened"});
            }
            catch (Exception)
            {
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("UpdateLocker")]
        public async Task<IActionResult> UpdateLockerDescription(
            [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "lockers/{lockerId}")] HttpRequest req,
            Guid lockerId,
            ILogger log)
        {
            try
            {
                if (Auth.IsBlocked)
                    return new BadRequestObjectResult(new { code = 888, message = "This account is blocked" });

                if (Auth.Role != "Admin")
                    return new UnauthorizedResult();

                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Locker updatedLocker = JsonConvert.DeserializeObject<Locker>(requestBody);

                Locker locker;
                try
                {
                    locker = await LockerService.LockerContainer.ReadItemAsync<Locker>(lockerId.ToString(), new PartitionKey(lockerId.ToString()));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return new NotFoundResult();
                }

                locker.Name = updatedLocker.Name;
                locker.Description = updatedLocker.Description;
                locker.Sport = updatedLocker.Sport;
                locker.Status = updatedLocker.Status;

                await LockerService.LockerContainer.ReplaceItemAsync(locker, locker.Id.ToString(), new PartitionKey(locker.Id.ToString()));

                locker = await LockerManagementService.UpdateLockerStatusAsync(locker);

                return new OkObjectResult(locker);
            }
            catch
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
