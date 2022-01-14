using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using SmartLockerFunctionApp.Models;
using Microsoft.Azure.Cosmos;
using Newtonsoft.Json.Linq;
using System.Net.Http;

namespace SmartLockerFunctionApp
{
    public class AuthenticationFunctions
    {
        [FunctionName("Login")]
        public async Task<IActionResult> Login(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "users/login")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();

                // Get user from facebook accesstoken
                JObject jObject = JObject.Parse(requestBody);
                JToken accessToken;
                if (!jObject.TryGetValue("accessToken", out accessToken))
                    return new BadRequestObjectResult(JsonConvert.SerializeObject( new { errorMessage = "No accesstoken" } ));

                var user = await getUserDetails(accessToken.ToString());

                // Save new user in CosmosDB
                user.Id = Guid.NewGuid();
                user.Type = "user";
                user.FirstLogin = DateTime.UtcNow;

                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Users");
                await container.CreateItemAsync(user, new PartitionKey(user.Email));

                return new OkObjectResult(user);
            }
            catch
            {
                return new StatusCodeResult(500);
            }
        }

        private static async Task<Models.User> getUserDetails(string accessToken)
        {
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Add("Accept", "application/json");

            using (client)
            {
                try
                {
                    string url = $"https://graph.facebook.com/v12.0/me?fields=name,email,birthday,location,picture&{accessToken}";
                    
                    string json = await client.GetStringAsync(url);
                    if (json != null)
                    {
                        JObject jObject = JObject.Parse(json);
                        Guid lockerId = Guid.Parse(jObject["iotDeviceId"].ToString());

                        Models.User user = new Models.User()
                        {
                            FacebookId = int.Parse(jObject["int"].ToString()),
                            Name = jObject["name"].ToString(),
                            Email = jObject["email"].ToString(),
                            Birthday = DateTime.Parse(jObject["birthday"].ToString()),
                            Location = jObject["location"]["name"].ToString(),
                            Picture = jObject["picture"]["url"].ToString()
                        };

                        return user;
                    }
                    else
                    {
                        throw new Exception();
                    }
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }

            return new Models.User();
        }
    }
}
