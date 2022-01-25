class LockerLock {
  
  private:
    byte _lockPin;
    byte _feedbackPin;
    bool _lockState;
    bool _lastLockState;
    unsigned long _lastDebounceTime = 0;
    unsigned long _debounceDelay = 50;

    void _UpdateLockState() {
      bool _newLockState = digitalRead(_feedbackPin);
      
      if (_newLockState != _lastLockState) {
        _lastDebounceTime = millis();
      }
      
      if (millis() - _lastDebounceTime > _debounceDelay) {
        _lockState = _newLockState;
      }
      
      _lastLockState = _newLockState;
    }
  
  public:
    String Id;

    LockerLock(String id, byte lockPin, byte feedbackPin) {
      Id = id;
      _lockPin = lockPin;
      _feedbackPin = feedbackPin;
      init();
    }

    void init() {
      _lastLockState = LOW;

      pinMode(_lockPin, OUTPUT);
      pinMode(_feedbackPin, INPUT_PULLUP);

      _UpdateLockState();
      digitalWrite(_lockPin, LOW);
    }

    void OpenLock() {
      digitalWrite(_lockPin, HIGH);
      delay(15);
      digitalWrite(_lockPin, LOW);
    }

    bool GetLockState() {
      _UpdateLockState();
      return !_lockState;
    }

};
