using System;
using System.Collections.Generic;
using System.Text;

namespace SmartLockerFunction.Models
{
    public class Device
    {
        public string DeviceName { get; set; }
        public string Status { get; set; }
        public DateTime Timestamp { get { return Timestamp; } set { Timestamp = DateTime.UtcNow; } }
    }

}
