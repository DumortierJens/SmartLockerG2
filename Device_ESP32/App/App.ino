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
#include "Sonar.h"


// Methods for tasks
void CheckMaterialSonar();
void CheckLock();


// Variables
Scheduler taskRunner;

int selectedSonar = 0;
int sonarDiff = 4;
Sonar sonars[] {
  Sonar("6e557e60-84a8-45b0-a026-37ae6d0d06fb", US_RIGHT_TRIGGER_PIN, US_RIGHT_ECHO_PIN, 17, sonarDiff),
  Sonar("ed1f152e-822d-4940-935c-70c40e1b8c3e", US_LEFT_TRIGGER_PIN, US_LEFT_ECHO_PIN, 17, sonarDiff)
};

LockerLock lock("fc5a0661-20fc-4eb1-95d7-e27e19f211df", LOCK_PIN, LOCK_FEEDBACK_PIN);
bool lockLastState = LOW;

// IoT hub
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
    lock.OpenLock();
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
Task checkMaterialTask(1000, TASK_FOREVER, &CheckMaterialSonar, NULL );
Task checkLockTask(500, TASK_FOREVER, &CheckLock, NULL );

void UpdateDeviceStatus(String deviceId, bool value){

    // Create json payload
    String messagePayload = "{\"iotDeviceId\":\"" + String(IOTHUB_DEVICEID) + "\", \"deviceId\":\"" + deviceId + "\", \"value\":" + value + "}";
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
