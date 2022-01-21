using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace SmartLockerFunctionApp.Models
{
    public class Locker
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("sport")]
        public string Sport { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("status")]
        public string Status { get; set; }
    }
}
