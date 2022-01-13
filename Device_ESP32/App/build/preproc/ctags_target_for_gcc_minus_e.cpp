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
#define IOTHUB_DEVICEID "11cf21d4-03ef-4e0a-8a17-27c26ae80abd"
#define IOTHUB_CONNSTRING "HostName=smartlockeriothub.azure-devices.net;DeviceId=11cf21d4-03ef-4e0a-8a17-27c26ae80abd;SharedAccessKey=76vh2TvxkhMTTdQqsgM+yPIMaIXgCs03ryoCSmFRRt4="
#define IOTHUB_MESSAGE_MAX_LEN 256
#define US_THRESHOLD_DIFF 5


// Libraries
# 20 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2
# 21 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2
# 22 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2
# 23 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2
# 24 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2
# 25 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2
# 26 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 2


// Methods for tasks
void checkMaterial();
bool checkMaterialOfUltrasoonSensor(NewPing, double);
void checkLock();


// Variables
Scheduler taskRunner;

NewPing usLeft(5, 18, 400);
double usLeftThreshold = 22;
bool usLeftLastState = false;

NewPing usRight(19, 21, 400);
double usRightThreshold = 22;
bool usRightLastState = false;

LockerLock lock(22, 23);
bool lockLastState = 0x0;


// IoT hub
static void SendConfirmationCallback(IOTHUB_CLIENT_CONFIRMATION_RESULT result)
{
  if (result == IOTHUB_CLIENT_CONFIRMATION_OK)
  {
    Serial.println("Send Confirmation Callback finished.");
  }
}

static void MessageCallback(const char* payLoad, int size)
{
  Serial.println("Message callback:");
  Serial.println(payLoad);
}

static void DeviceTwinCallback(DEVICE_TWIN_UPDATE_STATE updateState, const unsigned char *payLoad, int size)
{
  char *temp = (char *)malloc(size + 1);
  if (temp == 
# 67 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 3 4
             __null
# 67 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
                 )
  {
    return;
  }
  memcpy(temp, payLoad, size);
  temp[size] = '\0';
  // Display Twin message.
  Serial.println(temp);
  free(temp);
}

static int DeviceMethodCallback(const char *methodName, const unsigned char *payload, int size, unsigned char **response, int *response_size)
{
  do{{ LOGGER_LOG l = xlogging_get_log_function(); if (l != 
# 80 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 3 4
 __null
# 80 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
 ) l(AZ_LOG_INFO, "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino", __func__, 80, 0x01, "Try to invoke method %s", methodName); }; }while((void)0,0);
  const char *responseMessage = "\"Successfully invoke device method\"";
  int result = 200;

  if (strcmp(methodName, "open") == 0)
  {
    do{{ LOGGER_LOG l = xlogging_get_log_function(); if (l != 
# 86 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 3 4
   __null
# 86 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
   ) l(AZ_LOG_INFO, "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino", __func__, 86, 0x01, "Open lock"); }; }while((void)0,0);
    lock.openLock();
  }
  // else if (strcmp(methodName, "stop") == 0)
  // {
  //   LogInfo("Stop sending temperature and humidity data");
  // }
  else
  {
    do{{ LOGGER_LOG l = xlogging_get_log_function(); if (l != 
# 95 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 3 4
   __null
# 95 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
   ) l(AZ_LOG_INFO, "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino", __func__, 95, 0x01, "No method %s found", methodName); }; }while((void)0,0);
    responseMessage = "\"No method found\"";
    result = 404;
  }

  *response_size = strlen(responseMessage) + 1;
  *response = (unsigned char *)strdup(responseMessage);

  return result;
}

// Tasks
Task checkMaterialTask(500, (-1), &checkMaterial, 
# 107 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 3 4
                                                         __null 
# 107 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
                                                              );
Task checkLockTask(500, (-1), &checkLock, 
# 108 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino" 3 4
                                                 __null 
# 108 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
                                                      );

void updateDeviceStatus(String deviceId, bool value){


    // Create json payload
    String messagePayload = "{\"iotDeviceId\":\"" + String("11cf21d4-03ef-4e0a-8a17-27c26ae80abd") + "\", \"deviceId\":\"" + deviceId + "\", \"value\":" + value + "}";
    Serial.println(messagePayload);
    EVENT_INSTANCE* message = Esp32MQTTClient_Event_Generate(messagePayload.c_str(), MESSAGE);
    Esp32MQTTClient_SendEventInstance(message);


    // WiFiClientSecure *wifiClientSecure = new WiFiClientSecure;

    // if (wifiClientSecure) {
    //     wifiClientSecure -> setCACert(rootCACertificateBaltimoreCyberTrust);

    //     {
    //         HTTPClient https;

    //         Serial.print("[HTTPS] begin...\n");
    //         if (https.begin(*wifiClientSecure, String(API_URL) + "/devices/" + String(deviceId) + "/log")) {
    //             Serial.print("[HTTPS] POST...\n");
    //             https.addHeader("Content-Type", "application/json");

    //             char jsonOutput[128];
    //             const size_t CAPACITY = JSON_OBJECT_SIZE(1);
    //             StaticJsonDocument<CAPACITY> doc;

    //             JsonObject object = doc.to<JsonObject>();
    //             object["value"] = value;
    //             serializeJson(doc, jsonOutput);

    //             int httpCode = https.POST(String(jsonOutput));
    //         }
    //     }
    // }
}

void checkMaterial(){
    bool usLeftState = checkMaterialOfUltrasoonSensor(usLeft, usLeftThreshold);
    bool usRightState = checkMaterialOfUltrasoonSensor(usLeft, usLeftThreshold);

    if (usLeftState != usLeftLastState)
    {
        if (usLeftState)
            Serial.println("Ultrasoon left: material detected");
        else
            Serial.println("Ultrasoon left: no material detected");

        updateDeviceStatus("ed1f152e-822d-4940-935c-70c40e1b8c3e", usLeftState);
    }

    if (usRightState != usRightLastState)
    {
        if (usRightState)
            Serial.println("Ultrasoon right: material detected");
        else
            Serial.println("Ultrasoon right: no material detected");

        updateDeviceStatus("6e557e60-84a8-45b0-a026-37ae6d0d06fb", usRightState);
    }

    usLeftLastState = usLeftState;
    usRightLastState = usRightState;
}

bool checkMaterialOfUltrasoonSensor(NewPing us, double usThresholdValue){
    double usValue = us.ping_cm();
    Serial.println(usValue);

    if (usValue > usThresholdValue - 5 && usValue < usThresholdValue + 5)
        return true;

    return false;
}

void checkLock() {
    bool lockState = lock.getLockState();
    Serial.println(lockState);

    if (lockState != lockLastState)
    {
        if (lockState)
            Serial.println("Locker: closed");
        else
            Serial.println("Locker: opened");

        updateDeviceStatus("fc5a0661-20fc-4eb1-95d7-e27e19f211df", lockState);
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
    Esp32MQTTClient_SetMessageCallback(MessageCallback);
    Esp32MQTTClient_SetDeviceTwinCallback(DeviceTwinCallback);
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

    if ( !digitalRead(15) ) {
        lock.openLock();
    }

}
