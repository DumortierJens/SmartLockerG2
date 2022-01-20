using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace SmartLockerFunctionApp.Models
{
    public class Registration
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }

        [JsonProperty("lockerId")]
        public Guid LockerId { get; set; }

        [JsonProperty("userId")]
        public string UserId { get; set; }

        [JsonProperty("start")]
        public DateTime Start { get; set; }

        [JsonProperty("end")]
        public DateTime End { get; set; }

        [JsonProperty("note")]
        public string Note { get; set; }
    }
}
