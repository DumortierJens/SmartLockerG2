using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Host;
using SmartLockerFunctionApp.Models;
using SmartLockerFunctionApp.Services.ErrorLogging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Authentication;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace SmartLockerFunctionApp.Services.Authentication
{
    /// <summary>
    ///     Base class for authenticated service which checks the incoming JWT token.
    /// </summary>
    public abstract class AuthorizedServiceBase : IFunctionInvocationFilter
    {
        // Access the authentication info.
        protected AuthenticationInfo Auth { get; private set; }

        /// <summary>
        ///     Pre-execution filter.
        /// </summary>
        /// <remarks>
        ///     This mechanism can be used to extract the authentication information.  Unfortunately, the binding in SignalRConnectionInfoAttribute
        ///     does not pick this up from the headers even when bound.
        /// </remarks>
        public Task OnExecutingAsync(FunctionExecutingContext executingContext, CancellationToken cancellationToken)
        {
            HttpRequest httpRequest = executingContext.Arguments.First().Value as HttpRequest;

            if (httpRequest == null || !httpRequest.Headers.ContainsKey("Authorization"))
            {
                return Task.FromException(new AuthenticationException("No Authorization header was present"));
            }

            try
            {
                Auth = new AuthenticationInfo(httpRequest);
            }
            catch (Exception exception)
            {
                return Task.FromException(exception);
            }

            if (!Auth.IsValid)
            {
                return Task.FromException(new AuthenticationException("No identity key was found in the claims."));
            }

            return Task.CompletedTask;
        }

        /// <summary>
        ///     Post-execution filter.
        /// </summary>
        public Task OnExecutedAsync(FunctionExecutedContext executedContext, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
