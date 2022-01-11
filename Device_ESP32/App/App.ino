// Pins
#define RESET_WIFI_CONFIG_PIN   4
#define US_LEFT_TRIGGER_PIN     5  
#define US_LEFT_ECHO_PIN        18 
#define US_RIGHT_TRIGGER_PIN    19  
#define US_RIGHT_ECHO_PIN       21

// Const values
#define LOCKER_ID               1
#define US_THRESHOLD_DIFF       5


// Libraries
#include <WiFiManager.h>  // https://github.com/tzapu/WiFiManager
#include <TaskScheduler.h>
#include <NewPing.h>


// Methods
void checkMaterial();

// Variables
Scheduler taskRunner;

NewPing usLeft(US_LEFT_TRIGGER_PIN, US_LEFT_ECHO_PIN, 400);
double usLeftThreshold = 22;
bool usLeftLastState = false;

NewPing usRight(US_RIGHT_TRIGGER_PIN, US_RIGHT_ECHO_PIN, 400);
double usRightThreshold = 22;
bool usRightLastState = false;

// Tasks
Task checkMaterialTask(500, TASK_FOREVER, &checkMaterial, NULL );
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


// Setup
void setup() {
    
    // Start serial monitor
    Serial.begin(115200);

    // Connect to wifi with WiFiManager
    WiFiManager wifiManager;
    wifiManager.autoConnect("SmartLockerSetup"); // wifi ap settings (ssid, password)

    // Pin initialisation
    pinMode(RESET_WIFI_CONFIG_PIN, INPUT_PULLUP);

    // Initialize tasks
    Serial.println("Initializing tasks...");
    taskRunner.init();
    taskRunner.addTask(checkMaterialTask);
    checkMaterialTask.enable();

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

}
