using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace SmartLockerFunctionApp.Models
{
    public class Error
    {
        public Error(string type, string message)
        {
            Id = Guid.NewGuid();
            Timestamp = DateTime.UtcNow;
            Type = type;
            Message = message;
        }

        [JsonProperty("id")]
        public Guid Id { get; set; }

        [JsonProperty("timestamp")]
        public DateTime Timestamp { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }
    }
}
