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
#define API_URL                 "http://192.168.1.51:7071/api"
#define US_THRESHOLD_DIFF       5


// Libraries
#include <WiFiManager.h>  // https://github.com/tzapu/WiFiManager
#include <TaskScheduler.h>
#include <NewPing.h>
#include "Lock.h"
#include <HTTPClient.h>
#include <ArduinoJson.h>


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

Lock lock(LOCK_PIN, LOCK_FEEDBACK_PIN);
bool lockLastState = LOW;


// Tasks
Task checkMaterialTask(500, TASK_FOREVER, &checkMaterial, NULL );
Task checkLockTask(500, TASK_FOREVER, &checkLock, NULL );

void updateDeviceStatus(String deviceId, bool value){
    HTTPClient httpClient;
    char jsonOutput[128];
    
    httpClient.begin(String(API_URL) + "/devices/" + String(deviceId) + "/log");
    httpClient.addHeader("Content-Type", "application/json");

    const size_t CAPACITY = JSON_OBJECT_SIZE(1);
    StaticJsonDocument<CAPACITY> doc;

    JsonObject object = doc.to<JsonObject>();
    object["value"] = value;
    serializeJson(doc, jsonOutput);

    int httpCode = httpClient.POST(String(jsonOutput));

    if (httpCode > 0) {
        String payload = httpClient.getString();
        Serial.println("\nStatuscode: " + String(httpCode));
        Serial.println(payload);

        httpClient.end();
    }
    else {
        Serial.println("Error on HTTP request");
    }
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
    }

    if (usRightState != usRightLastState)
    {
        if (usRightState)
            Serial.println("Ultrasoon right: material detected");
        else
            Serial.println("Ultrasoon right: no material detected");
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
    WiFiManager wifiManager;
    wifiManager.autoConnect("SmartLockerSetup"); // wifi ap settings (ssid, password)

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

    // Start AP with configuration portal if RESET_WIFI_CONFIG_PIN is active
    if ( !digitalRead(RESET_WIFI_CONFIG_PIN) ) {
      WiFiManager wifiManager;
      wifiManager.setTimeout(120); // sets timeout until configuration portal gets turned off in sec
      wifiManager.startConfigPortal("SmartLockerSetup"); // wifi ap settings (ssid, password)
    }

    if ( !digitalRead(BUTTON_LOCK_PIN) ) {
        lock.openLock();
    }

}
