// Pins
#define RESET_WIFI_CONFIG_PIN   4
#define US_LEFT_TRIGGER_PIN     5  
#define US_LEFT_ECHO_PIN        18 
#define US_RIGHT_TRIGGER_PIN    19  
#define US_RIGHT_ECHO_PIN       21

// Const values
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
NewPing usRight(US_RIGHT_TRIGGER_PIN, US_RIGHT_ECHO_PIN, 400);
double usLeftThreshold = 50;
double usRightThreshold = 50;

// Tasks
Task checkMaterialTask(500, TASK_FOREVER, &checkMaterial, NULL );

void checkMaterial(){              

    double usLeftValue = usLeft.ping_cm();
    double usRightValue = usLeft.ping_cm();

    Serial.println("Ultrasoon left: " + String(usLeftValue) + "cm");
    Serial.println("Ultrasoon right: " + String(usRightValue) + "cm");

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
