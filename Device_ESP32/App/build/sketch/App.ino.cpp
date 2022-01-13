#include <Arduino.h>
#line 1 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
// Pins
#define RESET_WIFI_CONFIG_PIN   4
#define US_LEFT_TRIGGER_PIN     5  
#define US_LEFT_ECHO_PIN        18 
#define US_RIGHT_TRIGGER_PIN    19  
#define US_RIGHT_ECHO_PIN       21
#define BUTTON_LOCK_PIN         15
#define LOCK_PIN                22
#define LOCK_FEEDBACK_PIN       23

// Const values
#define IOTHUB_CONNSTRING       "HostName=smartlockeriothub.azure-devices.net;DeviceId=11cf21d4-03ef-4e0a-8a17-27c26ae80abd;SharedAccessKey=76vh2TvxkhMTTdQqsgM+yPIMaIXgCs03ryoCSmFRRt4="
#define IOTHUB_DEVICEID         "11cf21d4-03ef-4e0a-8a17-27c26ae80abd"
#define US_THRESHOLD_DIFF       5


// Libraries
#include <WiFiManager.h>  // https://github.com/tzapu/WiFiManager
#include <TaskScheduler.h>
#include <NewPing.h>
#include <ArduinoJson.h>
#include "Lock.h"
#include "AzureIotHub.h"
#include "Esp32MQTTClient.h"


// Methods for tasks
void checkMaterial();
bool checkMaterialOfUltrasoonSensor(NewPing, double);
void checkLock();


// Variables
Scheduler taskRunner;

NewPing usLeft(US_LEFT_TRIGGER_PIN, US_LEFT_ECHO_PIN, 400);
double usLeftThreshold = 22;
bool usLeftLastState = false;

NewPing usRight(US_RIGHT_TRIGGER_PIN, US_RIGHT_ECHO_PIN, 400);
double usRightThreshold = 22;
bool usRightLastState = false;

LockerLock lock(LOCK_PIN, LOCK_FEEDBACK_PIN);
bool lockLastState = LOW;


// IoT hub
#line 49 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
static void SendConfirmationCallback(IOTHUB_CLIENT_CONFIRMATION_RESULT result);
#line 57 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
static int DeviceMethodCallback(const char *methodName, const unsigned char *payload, int size, unsigned char **response, int *response_size);
#line 85 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
void updateDeviceStatus(String deviceId, bool value);
#line 125 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
bool checkMaterialOfUltrasoonSensor(NewPing us, double usThresholdValue);
#line 154 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
void setup();
#line 187 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
void loop();
#line 49 "d:\\_SCHOOL\\2MCT_S3\\Project\\SmartLockerG2\\Device_ESP32\\App\\App.ino"
static void SendConfirmationCallback(IOTHUB_CLIENT_CONFIRMATION_RESULT result)
{
  if (result == IOTHUB_CLIENT_CONFIRMATION_OK)
  {
    Serial.println("Send Confirmation Callback finished.");
  }
}

static int  DeviceMethodCallback(const char *methodName, const unsigned char *payload, int size, unsigned char **response, int *response_size)
{
  LogInfo("Try to invoke method %s", methodName);
  const char *responseMessage = "\"Successfully invoke device method\"";
  int result = 200;

  if (strcmp(methodName, "open") == 0)
  {
    LogInfo("Open lock");
    lock.openLock();
  }
  else
  {
    LogInfo("No method %s found", methodName);
    responseMessage = "\"No method found\"";
    result = 404;
  }

  *response_size = strlen(responseMessage) + 1;
  *response = (unsigned char *)strdup(responseMessage);

  return result;
}

// Tasks
Task checkMaterialTask(500, TASK_FOREVER, &checkMaterial, NULL );
Task checkLockTask(500, TASK_FOREVER, &checkLock, NULL );

void updateDeviceStatus(String deviceId, bool value){

    // Create json payload
    String messagePayload = "{\"iotDeviceId\":\"" + String(IOTHUB_DEVICEID) + "\", \"deviceId\":\"" + deviceId + "\", \"value\":" + value + "}";
    Serial.println(messagePayload);

    // Send message with IoTHub
    EVENT_INSTANCE* message = Esp32MQTTClient_Event_Generate(messagePayload.c_str(), MESSAGE);
    Esp32MQTTClient_SendEventInstance(message);

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
    
    if (usValue > usThresholdValue - US_THRESHOLD_DIFF && usValue < usThresholdValue + US_THRESHOLD_DIFF)
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
    Esp32MQTTClient_SetOption(OPTION_MINI_SOLUTION_NAME, "GetStarted");
    Esp32MQTTClient_Init((const uint8_t*)IOTHUB_CONNSTRING, true);
    Esp32MQTTClient_SetSendConfirmationCallback(SendConfirmationCallback);
    Esp32MQTTClient_SetDeviceMethodCallback(DeviceMethodCallback);

    // Pin initialisation
    pinMode(RESET_WIFI_CONFIG_PIN, INPUT_PULLUP);
    pinMode(BUTTON_LOCK_PIN, INPUT_PULLUP);

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
    if ( !digitalRead(RESET_WIFI_CONFIG_PIN) ) {
      WiFiManager wifiManager;
      wifiManager.setTimeout(120); // sets timeout until configuration portal gets turned off in sec
      wifiManager.startConfigPortal("SmartLockerSetup"); // wifi ap settings (ssid, password)
    }

}

