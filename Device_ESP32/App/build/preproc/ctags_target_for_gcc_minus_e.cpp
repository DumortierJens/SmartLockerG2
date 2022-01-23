# 1 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
// Pins
#define RESET_WIFI_CONFIG_PIN 4
#define US_LEFT_TRIGGER_PIN 5
#define US_LEFT_ECHO_PIN 18
#define US_RIGHT_TRIGGER_PIN 19
#define US_RIGHT_ECHO_PIN 21
#define BUTTON_LOCK_PIN 15
#define LOCK_PIN 22
#define LOCK_FEEDBACK_PIN 23

// Const values
#define IOTHUB_CONNSTRING "HostName=smartlockeriothub.azure-devices.net;DeviceId=11cf21d4-03ef-4e0a-8a17-27c26ae80abd;SharedAccessKey=76vh2TvxkhMTTdQqsgM+yPIMaIXgCs03ryoCSmFRRt4="
#define IOTHUB_DEVICEID "11cf21d4-03ef-4e0a-8a17-27c26ae80abd"
#define US_THRESHOLD_DIFF 5


// Libraries
# 19 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2
# 20 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2
# 21 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2
# 22 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2
# 23 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2
# 24 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2
# 25 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2
# 26 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2


// Methods for tasks
void CheckMaterialSonar();
void CheckLock();


// Variables
Scheduler taskRunner;

int selectedSonar = 0;
int sonarDiff = 4;
Sonar sonars[] {
  Sonar("6e557e60-84a8-45b0-a026-37ae6d0d06fb", 19, 21, 17, sonarDiff),
  Sonar("ed1f152e-822d-4940-935c-70c40e1b8c3e", 5, 18, 17, sonarDiff)
};

LockerLock lock("fc5a0661-20fc-4eb1-95d7-e27e19f211df", 22, 23);
bool lockLastState = 0x0;

// IoT hub
static void SendConfirmationCallback(IOTHUB_CLIENT_CONFIRMATION_RESULT result)
{
  if (result == IOTHUB_CLIENT_CONFIRMATION_OK)
  {
    Serial.println("Send Confirmation Callback finished.");
  }
}

static int DeviceMethodCallback(const char *methodName, const unsigned char *payload, int size, unsigned char **response, int *response_size)
{
  do{{ LOGGER_LOG l = xlogging_get_log_function(); if (l != 
# 57 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 3 4
 __null
# 57 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
 ) l(AZ_LOG_INFO, "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino", __func__, 57, 0x01, "Try to invoke method %s", methodName); }; }while((void)0,0);
  const char *responseMessage = "\"Successfully invoke device method\"";
  int result = 200;

  if (strcmp(methodName, "open") == 0)
  {
    do{{ LOGGER_LOG l = xlogging_get_log_function(); if (l != 
# 63 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 3 4
   __null
# 63 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
   ) l(AZ_LOG_INFO, "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino", __func__, 63, 0x01, "Open lock"); }; }while((void)0,0);
    lock.OpenLock();
  }
  else
  {
    do{{ LOGGER_LOG l = xlogging_get_log_function(); if (l != 
# 68 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 3 4
   __null
# 68 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
   ) l(AZ_LOG_INFO, "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino", __func__, 68, 0x01, "No method %s found", methodName); }; }while((void)0,0);
    responseMessage = "\"No method found\"";
    result = 404;
  }

  *response_size = strlen(responseMessage) + 1;
  *response = (unsigned char *)strdup(responseMessage);

  return result;
}

// Tasks
Task checkMaterialTask(1000, (-1), &CheckMaterialSonar, 
# 80 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 3 4
                                                               __null 
# 80 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
                                                                    );
Task checkLockTask(500, (-1), &CheckLock, 
# 81 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 3 4
                                                 __null 
# 81 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
                                                      );

void UpdateDeviceStatus(String deviceId, bool value){

    // Create json payload
    String messagePayload = "{\"iotDeviceId\":\"" + String("11cf21d4-03ef-4e0a-8a17-27c26ae80abd") + "\", \"deviceId\":\"" + deviceId + "\", \"value\":" + value + "}";
    Serial.println(messagePayload);

    // Send message with IoTHub
    EVENT_INSTANCE* message = Esp32MQTTClient_Event_Generate(messagePayload.c_str(), MESSAGE);
    Esp32MQTTClient_SendEventInstance(message);

}

void CheckMaterialSonar(){
    bool sonarLastState = sonars[selectedSonar].LastState;
    bool materialDetected = sonars[selectedSonar].MaterialDetected();

    if (sonarLastState != materialDetected) {
        Serial.println("DeviceId: " + sonars[selectedSonar].Id + " Detected: " + String(materialDetected));
        UpdateDeviceStatus(sonars[selectedSonar].Id, materialDetected);
    }

    selectedSonar++;
    if (selectedSonar >= sizeof(sonars) / sizeof(sonars[0]))
        selectedSonar = 0;
}

void CheckLock() {
    bool lockState = lock.GetLockState();
    Serial.println(lockState);

    if (lockState != lockLastState)
    {
        if (lockState)
            Serial.println("Locker: closed");
        else
            Serial.println("Locker: opened");

        UpdateDeviceStatus(lock.Id, lockState);
    }

    lockLastState = lockState;
}


// Setup
void setup() {

    // Start serial monitor
    Serial.begin(115200);

    // Connect to wifi with WiFiManager
    Serial.println("> WiFi setup");
    WiFiManager wifiManager;
    wifiManager.autoConnect("SmartLockerSetup"); // wifi ap settings (ssid, password)

    // Connect to IoTHub
    Serial.println("> IoTHub setup");
    Esp32MQTTClient_SetOption("MiniSolution", "GetStarted");
    Esp32MQTTClient_Init((const uint8_t*)"HostName=smartlockeriothub.azure-devices.net;DeviceId=11cf21d4-03ef-4e0a-8a17-27c26ae80abd;SharedAccessKey=76vh2TvxkhMTTdQqsgM+yPIMaIXgCs03ryoCSmFRRt4=", true);
    Esp32MQTTClient_SetSendConfirmationCallback(SendConfirmationCallback);
    Esp32MQTTClient_SetDeviceMethodCallback(DeviceMethodCallback);

    // Pin initialisation
    pinMode(4, 0x05);
    pinMode(15, 0x05);

    // Initialize tasks
    Serial.println("Initializing tasks...");
    taskRunner.init();
    taskRunner.addTask(checkMaterialTask);
    checkMaterialTask.enable();
    taskRunner.addTask(checkLockTask);
    checkLockTask.enable();

}


// Main Task
void loop() {

    // Execute tasks
    taskRunner.execute();
    Esp32MQTTClient_Check();

    // Start AP with configuration portal if RESET_WIFI_CONFIG_PIN is active
    if ( !digitalRead(4) ) {
      WiFiManager wifiManager;
      wifiManager.setTimeout(120); // sets timeout until configuration portal gets turned off in sec
      wifiManager.startConfigPortal("SmartLockerSetup"); // wifi ap settings (ssid, password)
    }

}
