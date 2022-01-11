class Lock {
  
  private:
    byte lockPin;
    byte feedbackPin;
    bool lockState;
    bool lastLockState;
    unsigned long lastDebounceTime = 0;
    unsigned long debounceDelay = 50;

    void updateLockState() {
      bool newLockState = digitalRead(feedbackPin);
      
      if (newLockState != lastLockState) {
        lastDebounceTime = millis();
      }
      
      if (millis() - lastDebounceTime > debounceDelay) {
        lockState = newLockState;
      }
      
      lastLockState = newLockState;
    }
  
  public:
    Lock(byte lockPin, byte feedbackPin) {
      this->lockPin = lockPin;
      this->feedbackPin = feedbackPin;
      init();
    }

    void init() {
      lastLockState = LOW;

      pinMode(lockPin, OUTPUT);
      pinMode(feedbackPin, INPUT_PULLUP);

      updateLockState();
      digitalWrite(lockPin, LOW);
    }

    void openLock() {
      digitalWrite(lockPin, HIGH);
      delay(5);
      digitalWrite(lockPin, LOW);
    }

    bool getLockState() {
      updateLockState();
      return !lockState;
    }

};
