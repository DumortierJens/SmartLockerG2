#ifndef Sonar_h
#define Sonar_h

#include <NewPing.h>

class Sonar {

    private: 
        NewPing _sonar;
        int _threshold;
        int _diff;

    public:
        String Id;
        bool LastState;
        
        Sonar(String id, uint8_t triggerPin, uint8_t echoPin, int threshold, int diff):_sonar(triggerPin, echoPin, 400) {
            Id = id;
            _threshold = threshold;
            _diff = diff;
        }

        int GetValue() {  
            int value = _sonar.ping_cm();
            Serial.println("Sonar: " + String(Id) + " Value: " + String(value));
            return value;
        }

        bool MaterialDetected() {  
            int value = GetValue();     
            bool materialDetected = ((value > _threshold - _diff) && (value < _threshold + _diff)) ? true : false;
            LastState = materialDetected;
            return materialDetected;  
        }
};

#endif