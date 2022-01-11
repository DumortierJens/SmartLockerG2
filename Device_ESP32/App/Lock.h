class Lock {
  
  private:
    byte lockPin;
  
  public:
    Lock(byte lockPin) {
      this->lockPin = lockPin;
      init();
    }

    void init() {
      pinMode(lockPin, OUTPUT);
      digitalWrite(lockPin, LOW);
    }

    void openLock() {
      digitalWrite(lockPin, HIGH);
      delay(10);
      digitalWrite(lockPin, LOW);
    }

};
