using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace SmartLockerFunctionApp.Models
{
    public class Device
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }

        [JsonProperty("lockerId")]
        public Guid LockerId { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }
    }
}
