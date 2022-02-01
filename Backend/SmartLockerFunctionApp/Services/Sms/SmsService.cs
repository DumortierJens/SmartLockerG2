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
using IO.ClickSend.ClickSend.Api;
using IO.ClickSend.Client;
using IO.ClickSend.ClickSend.Model;
using System.Collections.Generic;
using SmartLockerFunctionApp.Services.ErrorLogging;
using System.IO;

namespace SmartLockerFunctionApp.Services.Sms
{
    public static class SmsService
    {
        public static SMSApi SmsApi = new SMSApi( new IO.ClickSend.Client.Configuration() { Username = Environment.GetEnvironmentVariable("ClickSendUsername"), Password = Environment.GetEnvironmentVariable("ClickSendKey") });

        public static void AddMessageToQueue(User user, Reservation res)
        {
            Message msg = new Message() { Tel = user.Tel, Bericht = $"Hallo {user.Name},\nJe heb minder dan 5 minuten resterend!", EndTime = res.EndTime };
            string jsonString = JsonSerializer.Serialize(msg);

            string connectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage");

            // Instantiate a QueueClient which will be used to create and manipulate the queue
            QueueClient queueClient = new QueueClient(connectionString, "sms");

            // Create the queue
            queueClient.CreateIfNotExists();

            if (queueClient.Exists())
            {
                queueClient.SendMessage(jsonString);
            }
        }


        [FunctionName("TimeTrigger")]
        public static async Task Run(
        [TimerTrigger("0 */1 * * * *")] TimerInfo myTimer, 
        ILogger log)
        {
            try
            {
                QueueClient queueClient = new QueueClient(Environment.GetEnvironmentVariable("AzureWebJobsStorage"), "sms");
                queueClient.CreateIfNotExists();

                if (queueClient.Exists())
                {
                    QueueMessage[] peekedMessages = queueClient.ReceiveMessages();
                    if (peekedMessages.Length > 0)
                    {
                        foreach (var msg in peekedMessages)
                        {
                            //string requestBody = await new StreamReader(msg.Body).ReadToEndAsync();
                            Message fullMsg = JsonSerializer.Deserialize<Message>(msg.MessageText);
                            
                            if ((fullMsg.EndTime - DateTime.Now).TotalMinutes < 5)
                            {
                                var listOfSms = new List<SmsMessage> { new SmsMessage(
                                    from: "from",
                                    to: fullMsg.Tel,
                                    body: fullMsg.Bericht,
                                    source: "sdk"
                                )};
                                var smsCollection = new SmsMessageCollection(listOfSms);
                                var response = SmsApi.SmsSendPost(smsCollection);
                                queueClient.DeleteMessage(msg.MessageId, msg.PopReceipt);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                await ErrorService.SaveError(new Error("500", ex.Message));
            }
        }
    }
}
