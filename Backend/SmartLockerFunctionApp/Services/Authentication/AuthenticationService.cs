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
using SmartLockerFunctionApp.Services.ErrorLogging;

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
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                JObject jObject = JObject.Parse(requestBody);

                // Get access token from user
                JToken accessToken;
                if (!jObject.TryGetValue("accessToken", out accessToken))
                    return new BadRequestObjectResult(new { code = 850, message = "No accesstoken" });
                    

                // Get social from user
                JToken socialType;
                if (!jObject.TryGetValue("socialType", out socialType))
                    return new BadRequestObjectResult(new { code = 851, message = "No socialType" });

                // Create cosmosDB client
                CosmosClient cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
                Container container = cosmosClient.GetContainer("SmartLocker", "Users");

                // Get user by social access token & try to get user out of CosmosDB
                Models.User user;
                if (socialType.ToString() == "facebook")
                    user = await getUserFacebookDetails(accessToken.ToString());
                else if (socialType.ToString() == "google")
                    user = await getUserGoogleDetails(accessToken.ToString());
                else
                    return new BadRequestObjectResult(new { code = 852, message = "socialType is not 'facebook' or 'google'" });

                try
                {
                    Models.User foundUser = await container.ReadItemAsync<Models.User>(user.Id, new PartitionKey(user.Id.ToString()));
                    user.Tel = foundUser.Tel;
                    user.Role = foundUser.Role;
                    user.UserCreated = foundUser.UserCreated;
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    user.Role = "User";
                    user.UserCreated = DateTime.UtcNow;
                }

                // Check if user is blocked
                if (user.IsBlocked)
                    return new BadRequestObjectResult(new { code = 888, message = "This account is blocked" });

                // Add/update user details
                await container.UpsertItemAsync(user, new PartitionKey(user.Id.ToString()));

                return new OkObjectResult(new { token = _tokenIssuer.IssueTokenForUser(user) });
            }
            catch (Exception ex)
            {
                await ErrorService.SaveError(new Error("500", ex.Message));
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
                            Id = "facebook_" + jObject["id"].ToString(),
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

        private async Task<Models.User> getUserGoogleDetails(string accessToken)
        {
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Add("Accept", "application/json");

            using (client)
            {
                try
                {
                    string url = $"https://oauth2.googleapis.com/tokeninfo?id_token={accessToken}";

                    string json = await client.GetStringAsync(url);
                    if (json != null)
                    {
                        JObject jObject = JObject.Parse(json);

                        Models.User user = new Models.User()
                        {
                            Id = "google_" + jObject["sub"].ToString(),
                            Name = jObject["name"].ToString(),
                            Email = jObject["email"].ToString(),
                            Picture = jObject["picture"].ToString()
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
