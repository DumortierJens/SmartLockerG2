#define RESET_WIFI_CONFIG_PIN 4

// Libraries
#include <WiFiManager.h>  // https://github.com/tzapu/WiFiManager

// Variables

// Tasks

// Methods

// Setup
void setup() {
    
    // Start serial monitor
    Serial.begin(115200);

    // Connect to wifi with WiFiManager
    WiFiManager wifiManager;
    wifiManager.autoConnect("SmartLockerSetup"); // wifi ap settings (ssid, password)

    // Pin initialisation
    pinMode(RESET_WIFI_CONFIG_PIN, INPUT_PULLUP);

}

// Main Task
void loop() {

    // Start AP with configuration portal if RESET_WIFI_CONFIG_PIN is active
    if ( !digitalRead(RESET_WIFI_CONFIG_PIN) ) {
      WiFiManager wifiManager;
      wifiManager.setTimeout(120); // sets timeout until configuration portal gets turned off in sec
      wifiManager.startConfigPortal("SmartLockerSetup"); // wifi ap settings (ssid, password)
    }

}