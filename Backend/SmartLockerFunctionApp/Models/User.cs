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
        public int FacebookId { get; set; }

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

        [JsonProperty("firstLogin")]
        public DateTime FirstLogin { get; set; }
    }
}
