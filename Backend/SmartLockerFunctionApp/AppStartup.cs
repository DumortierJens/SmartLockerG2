using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using SmartLockerFunctionApp.Services.Authentication;

[assembly: FunctionsStartup(typeof(AuthenticationApp.AppStartup))]

namespace AuthenticationApp
{
    public class AppStartup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddSingleton<TokenIssuer>();
        }
    }
}
