using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace SmartLockerFunctionApp.Models
{
    public class Message
    {
        public string Tel { get; set; }
        public string Bericht { get; set; }
        public DateTime EndTime { get; set; }

    }
}
