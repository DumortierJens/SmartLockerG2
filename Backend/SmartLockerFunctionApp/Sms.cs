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

namespace AzureFunctionsWithTwilioBindings
{
    public class SendSmsTimer
    {
        [FunctionName("Test")]
        public static async Task<IActionResult> Test(
          [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "test")] HttpRequest req,
          ILogger log)
        {
            try
            {
                User user = new User()
                {
                    Id = Guid.NewGuid(),
                    Name = "Jarne Demoen",
                    Type = "Homo",
                    Email = "Jarne.demoen@student.howest.be",
                    Tel = "+32498300975"
                };

                return new OkObjectResult(user);
            }
            catch
            {
                return new StatusCodeResult(500);
            }

        }

        public bool CreateQueue(string queueName)
        {
            try
            {
                // Get the connection string from app settings
                string connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];

                // Instantiate a QueueClient which will be used to create and manipulate the queue
                QueueClient queueClient = new QueueClient(connectionString, queueName);

                // Create the queue
                queueClient.CreateIfNotExists();

                if (queueClient.Exists())
                {
                    Console.WriteLine($"Queue created: '{queueClient.Name}'");
                    return true;
                }
                else
                {
                    Console.WriteLine($"Make sure the Azurite storage emulator running and try again.");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}\n\n");
                Console.WriteLine($"Make sure the Azurite storage emulator running and try again.");
                return false;
            }
        }

        [FunctionName("TimeTrigger")]
        public static void Run(
        [TimerTrigger("0 */5 * * * *")] TimerInfo myTimer,
        ILogger log,
        [TwilioSms(AccountSidSetting = "TwilioAccountSid", AuthTokenSetting = "TwilioAuthToken")]
        ICollector<CreateMessageOptions> messageCollector
        )
        {
            // Get the connection string from app settings
            string connectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage");

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, "TwilioQueue");

            // Create the queue
            queueClient.CreateIfNotExists();

            if (queueClient.Exists())
            {
                Console.WriteLine($"Queue created: '{queueClient.Name}'");
                PeekedMessage[] peekedMessage = queueClient.PeekMessages();

                
                Console.WriteLine($"Peeked message: '{peekedMessage[0].Body}'");
            }
            else
            {
                Console.WriteLine($"Make sure the Azurite storage emulator running and try again.");
            }

            string toPhoneNumber = "+32498300975";
            string fromPhoneNumber = "+19378825833";
            for (int i = 1; i <= 2; i++)
            {
                var message = new CreateMessageOptions(new PhoneNumber(toPhoneNumber))
                {
                    From = new PhoneNumber(fromPhoneNumber),
                    Body = "15 Minutes Left"
                };

                messageCollector.Add(message);
            }
        }

        [FunctionName("QueueTwilio")]
        public static void Run(
         [QueueTrigger("sms-queue", Connection = "AzureWebJobsStorage")] JObject order,
         [TwilioSms(AccountSidSetting = "TwilioAccountSid", AuthTokenSetting = "TwilioAuthToken")]
         ICollector<CreateMessageOptions> messageCollector,
         ILogger log)
        {
            log.LogInformation($"SendMultilpeSmsTimer executed at: {DateTime.Now}");

            string toPhoneNumber = "+32498300975";
            string fromPhoneNumber = "+19378825833";
            for (int i = 1; i <= 2; i++)
            {
                var message = new CreateMessageOptions(new PhoneNumber(toPhoneNumber))
                {
                    From = new PhoneNumber(fromPhoneNumber),
                    Body = "15 Minutes Left"
                };

                messageCollector.Add(message);

            }
        }
    }
}
