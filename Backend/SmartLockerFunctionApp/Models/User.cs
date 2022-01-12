using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace SmartLockerFunctionApp.Models
{
    public class User
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("type")]
        public string Type { get; set; }
        [JsonProperty("email")]
        public string Email { get; set; }
    }
}
