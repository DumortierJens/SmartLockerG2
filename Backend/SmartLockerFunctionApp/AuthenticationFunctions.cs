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
using System.Globalization;
using System.Collections.Generic;

namespace SmartLockerFunctionApp
{
    public class AuthenticationFunctions
    {
        [FunctionName("Login")]
        public async Task<IActionResult> Login(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "users/login/{social}")] HttpRequest req,
            string social,
            ILogger log)
        {
            try
            {
                // Get access token from user
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                JObject jObject = JObject.Parse(requestBody);
                JToken accessToken;
                if (!jObject.TryGetValue("accessToken", out accessToken))
                    return new BadRequestObjectResult(JsonConvert.SerializeObject( new { errorMessage = "No accesstoken" } ));

                // Create cosmosDB client
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Users");

                // Get user by social access token & try to get user out of CosmosDB
                Models.User user;
                QueryDefinition query;
                if (social == "facebook")
                {
                    user = await getUserFacebookDetails(accessToken.ToString());
                    query = new QueryDefinition("SELECT * FROM Users u WHERE u.facebookId = @id");
                    query.WithParameter("@id", user.FacebookId);
                }
                else
                {
                    return new BadRequestObjectResult(JsonConvert.SerializeObject(new { errorMessage = "Social don't exist" }));
                }

                List<Models.User> foundUsers = new List<Models.User>();
                FeedIterator <Models.User> iterator = container.GetItemQueryIterator<Models.User>(query);
                while (iterator.HasMoreResults)
                {
                    FeedResponse<Models.User> response = await iterator.ReadNextAsync();
                    foundUsers.AddRange(response);
                }

                // If user don't exists, create the user with its social details
                if (foundUsers.Count == 0)
                {
                    // Set default properties
                    user.Id = Guid.NewGuid();
                    user.Type = "user";
                    user.UserCreated = DateTime.UtcNow;
                    await container.CreateItemAsync(user, new PartitionKey(user.Id.ToString()));
                }
                else
                {
                    user = foundUsers[0];
                }

                return new OkObjectResult(user);
            }
            catch (Exception ex)
            {
                throw ex;
                return new StatusCodeResult(500);
            }
        }

        private static async Task<Models.User> getUserFacebookDetails(string accessToken)
        {
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Add("Accept", "application/json");

            using (client)
            {
                try
                {
                    string url = $"https://graph.facebook.com/v12.0/me?fields=name,email,birthday,location,picture&access_token={accessToken}";
                    
                    string json = await client.GetStringAsync(url);
                    if (json != null)
                    {
                        JObject jObject = JObject.Parse(json);

                        Models.User user = new Models.User()
                        {
                            FacebookId = jObject["id"].ToString(),
                            Name = jObject["name"].ToString(),
                            Email = jObject["email"].ToString(),
                            Birthday = DateTime.ParseExact(jObject["birthday"].ToString(), "d", CultureInfo.InvariantCulture),
                            Location = jObject["location"]["name"].ToString(),
                            Picture = jObject["picture"]["data"]["url"].ToString()
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
