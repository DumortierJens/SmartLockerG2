using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace SmartLockerFunctionApp.Models
{
    public class Message
    {
        [JsonProperty("tel")]
        public string Tel { get; set; }
        [JsonProperty("bericht")]
        public string Bericht { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }
        [JsonProperty("endTime")]
        public DateTime EndTime { get; set; }

    }
}
