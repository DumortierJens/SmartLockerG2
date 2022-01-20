using System;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace AzureFunctionsWithTwilioBindings
{
    public class SendSmsTimer
    {

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
