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

        [JsonProperty("facebookId")]
        public string FacebookId { get; set; } = null;

        [JsonProperty("googleId")]
        public string googleId { get; set; } = null;

        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("birthday")]
        public DateTime Birthday { get; set; }

        [JsonProperty("location")]
        public string Location { get; set; }

        [JsonProperty("picture")]
        public string Picture { get; set; }

        [JsonProperty("userCreated")]
        public DateTime UserCreated { get; set; }
    }
}
