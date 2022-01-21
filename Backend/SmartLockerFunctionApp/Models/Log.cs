using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace SmartLockerFunctionApp.Models
{
    public class Log
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }

        [JsonProperty("deviceId")]
        public Guid DeviceId { get; set; }

        [JsonProperty("value")]
        public Boolean Value { get; set; }

        [JsonProperty("timestamp")]
        public DateTime Timestamp { get; set; }
    }
}
