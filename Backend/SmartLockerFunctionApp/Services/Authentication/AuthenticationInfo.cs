using JWT.Algorithms;
using JWT.Builder;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace SmartLockerFunctionApp.Services.Authentication
{
    /// <summary>
    ///     Wrapper class for encapsulating claims parsing.
    /// </summary>
    public class AuthenticationInfo
    {
        public bool IsValid { get; }
        public string Id { get; }
        public string Name { get; }
        public string Role { get; }

        public AuthenticationInfo(HttpRequest request)
        {
            // Check if we have a header.
            if (!request.Headers.ContainsKey("Authorization"))
            {
                IsValid = false;

                return;
            }

            string authorizationHeader = request.Headers["Authorization"];

            // Check if the value is empty.
            if (string.IsNullOrEmpty(authorizationHeader))
            {
                IsValid = false;

                return;
            }

            // Check if we can decode the header.
            IDictionary<string, object> claims = null;

            try
            {
                if (authorizationHeader.StartsWith("Bearer"))
                {
                    authorizationHeader = authorizationHeader.Substring(7);
                }

                // Validate the token and decode the claims.
                claims = new JwtBuilder()
                    .WithAlgorithm(new HMACSHA256Algorithm())
                    .WithSecret(Environment.GetEnvironmentVariable("JWTsecret"))
                    .MustVerifySignature()
                    .Decode<IDictionary<string, object>>(authorizationHeader);
            }
            catch (Exception ex)
            {
                IsValid = false;

                return;
            }

            // Check if we have user claim.
            if (!claims.ContainsKey("id") || !claims.ContainsKey("name"))
            {
                IsValid = false;

                return;
            }

            IsValid = true;
            Id = Convert.ToString(claims["id"]);
            Name = Convert.ToString(claims["name"]);
            Role = Convert.ToString(claims["role"]);
        }
    }
}
