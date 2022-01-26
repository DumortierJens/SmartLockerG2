using System;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using Twilio.Rest.Api.V2010.Account;
using Azure.Storage.Queues;
using Azure.Storage.Queues.Models;
using Twilio.Types;
using System.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Mvc;
using SmartLockerFunctionApp.Models;
using SmartLockerFunctionApp.Services.Sms;
using System.Text.Json;

namespace AzureFunctionsWithTwilioBindings
{
    public class SendSmsTimer
    {
        [FunctionName("InsertMessage")]
        public void InsertMessage(
          [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "test")] HttpRequest req,
          ILogger log)
        {
            try
            {
                User user = new User()
                {
                    Id = "1515656156153135213215231565",
                    Name = "Jarne Demoen",
                    Role = "Homo",
                    Email = "Jarne.demoen@student.howest.be",
                    Tel = "+32498300975",
                    UserCreated = DateTime.UtcNow,
                    IsBlocked = false
                };

                Reservation res = new Reservation()
                {
                    StartTime = DateTime.UtcNow,
                    EndTime = DateTime.UtcNow.AddMinutes(20)
                };

                SmsService.AddMessageToQueue(user, res);

            }

            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }

    }
}
