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
using System.Text.Json;
namespace SmartLockerFunctionApp.Services.Sms
{
    public static class SmsService
    {
        public static void AddMessageToQueue(User user, Reservation res)
        {
            Message msg = new Message() { Tel = user.Tel, Bericht = $"Hallo {user.Name},\n minder dan 15 minuten resterend!", EndTime = res.EndTime };
            string jsonString = JsonSerializer.Serialize(msg);

            string connectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage");

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, "twilio");

            // Create the queue
            queueClient.CreateIfNotExists();

            if (queueClient.Exists())
            {
                queueClient.SendMessage(jsonString);
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
            string connectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage");
            QueueClient queueClient = new QueueClient(connectionString, "twilio");

            string fromPhoneNumber = "+19378825833";

            queueClient.CreateIfNotExists();

            if (queueClient.Exists())
            {
                QueueMessage[] peekedMessages = queueClient.ReceiveMessages();
                if (peekedMessages.Length != 0)
                {
                    foreach (var msg in peekedMessages)
                    {
                        Message fullMsg = JsonSerializer.Deserialize<Message>(msg.Body);
                        if ((fullMsg.EndTime - DateTime.UtcNow).TotalMinutes < 15)
                        {
                            for (int i = 1; i <= 2; i++)
                            {
                                var message = new CreateMessageOptions(new PhoneNumber(fullMsg.Tel))
                                {
                                    From = new PhoneNumber(fromPhoneNumber),
                                    Body = fullMsg.Bericht
                                };
                                messageCollector.Add(message);

                            }
                            queueClient.DeleteMessage(msg.MessageId, msg.PopReceipt);
                        }
                        
                    }
                }

            }
            else
            {
                Console.WriteLine($"Make sure the Azurite storage emulator running and try again.");
            }




        }
    }
}
