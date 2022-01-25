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
using Newtonsoft.Json.Linq;
using Microsoft.Azure.Cosmos;
using System.Net.Http;
using System.Globalization;

namespace SmartLockerFunctionApp.Services.Authentication
{
    public class AuthenticationService
    {
        private readonly TokenIssuer _tokenIssuer;

        /// <summary>
        ///     Injection constructor.
        /// </summary>
        /// <param name="tokenIssuer">DI injected token issuer singleton.</param>
        public AuthenticationService(TokenIssuer tokenIssuer)
        {
            _tokenIssuer = tokenIssuer;
        }

        [FunctionName("Login")]
        public async Task<IActionResult> Login(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "users/login")] HttpRequest req,
            ILogger log)
        {
            try
            {
                // Get access token from user
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                JObject jObject = JObject.Parse(requestBody);
                JToken accessToken;
                if (!jObject.TryGetValue("accessToken", out accessToken))
                    return new BadRequestObjectResult(new { code = 850, message = "No accesstoken" });

                // Create cosmosDB client
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Users");

                // Get user by social access token & try to get user out of CosmosDB
                Models.User user = await getUserFacebookDetails(accessToken.ToString());

                try
                {
                    user = await container.ReadItemAsync<Models.User>(user.Id, new PartitionKey(user.Id.ToString()));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    user.Role = "User";
                    user.UserCreated = DateTime.UtcNow;
                    await container.CreateItemAsync(user, new PartitionKey(user.Id.ToString()));
                }

                return new OkObjectResult(new { token = _tokenIssuer.IssueTokenForUser(user) });
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }

        private async Task<Models.User> getUserFacebookDetails(string accessToken)
        {
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Add("Accept", "application/json");

            using (client)
            {
                try
                {
                    string url = $"https://graph.facebook.com/v12.0/me?fields=name,email,picture.width(512).height(512)&access_token={accessToken}";

                    string json = await client.GetStringAsync(url);
                    if (json != null)
                    {
                        JObject jObject = JObject.Parse(json);

                        Models.User user = new Models.User()
                        {
                            Id = jObject["id"].ToString(),
                            Name = jObject["name"].ToString(),
                            Email = jObject["email"].ToString(),
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
        }
    }
}
