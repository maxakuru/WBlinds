#include "motor_a4988.h"

MotorA4988::MotorA4988(
  uint8_t pinStep, uint8_t pinDir, uint8_t pinEnable, uint8_t pinSleep,
  uint8_t pinReset, uint8_t pinMs1, uint8_t pinMs2, uint8_t pinMs3
) {
  _isInit = false;
  this->pinStep = pinStep;
  this->pinDir = pinDir;
  this->pinEnable = pinEnable;
  this->pinSleep = pinSleep;
  this->pinReset = pinReset;
  this->pinms1 = pinMs1;
  this->pinms2 = pinMs2;
  this->pinms3 = pinMs3;
}

/**
 * @brief Initialize the motor with an existing engine.
 *
 * @param engine
 */
void MotorA4988::init(FastAccelStepperEngine& engine) {
  this->engine = engine;
  stepper = this->engine.stepperConnectToPin(pinStep);
  pinMode(this->pinms1, OUTPUT);
  pinMode(this->pinms2, OUTPUT);
  pinMode(this->pinms3, OUTPUT);
  pinMode(this->pinSleep, OUTPUT);
  pinMode(this->pinReset, OUTPUT);
  stepper->setDirectionPin(this->pinDir);
  stepper->setEnablePin(this->pinEnable);
  stepper->enableOutputs();
  digitalWrite(this->pinReset, HIGH);
  digitalWrite(this->pinSleep, HIGH);
  _isInit = true;
}

/**
 * @brief Initialize the motor.
 */
void MotorA4988::init() {
  this->engine = FastAccelStepperEngine();
  engine.init();
  init(engine);
  // if (!this->engineIsInit) {
  //   this->engine = FastAccelStepperEngine();
  //   engine.init();
  //   this->engineIsInit = true;
  //   // BlindsMotor::engineIsInit = true;
  // }


  // stepper->setAutoEnable(true);
  // If auto enable/disable need delays, just add (one or both):
  // stepper->setDelayToEnable(50);
  // stepper->setDelayToDisable(1000);
}

/**
 * @brief Whether the motor/engine is initialized already.
 */
bool MotorA4988::isInit() {
  return _isInit;
}

/**
 * @brief Whether the motor is asleep.
 */
bool MotorA4988::isAsleep() {
  return _isAsleep;
}

/**
 * @brief Whether the motor is enabled.
 */
bool MotorA4988::isEnabled() {
  return _isEnabled;
}

/**
 * @brief Set the motor microstep resolution.
 *
 * @param resolution
 */
void MotorA4988::setResolution(const stdBlinds::resolution_t resolution) {
  digitalWrite(this->pinms1, LOW);
  digitalWrite(this->pinms2, LOW);
  digitalWrite(this->pinms3, LOW);
  if (resolution > stdBlinds::resolution_t::kFull && resolution != stdBlinds::resolution_t::kQuarter) {
    digitalWrite(this->pinms1, HIGH);
  }
  if (resolution > stdBlinds::resolution_t::kHalf) {
    digitalWrite(this->pinms2, HIGH);
  }
  if (resolution == stdBlinds::resolution_t::kSixteenth) {
    digitalWrite(this->pinms3, HIGH);
  }
}

/**
 * @brief Set whether the motor is asleep.
 *
 * @param shouldSleep true to go to sleep, false to wake
 */
void MotorA4988::setSleep(const bool shouldSleep) {
  if (shouldSleep == _isAsleep) return;
  this->_isAsleep = shouldSleep;

  if (shouldSleep) {
    if (this->stepper) {
      this->stepper->stopMove();
    }
    Serial.println("sleeping");
    digitalWrite(this->pinSleep, LOW);
  }
  else {
    Serial.println("waking");
    digitalWrite(this->pinSleep, HIGH);
  }
}

/**
 * @brief Set whether motor is enabled.
 *
 * @param isEnabled
 */
void MotorA4988::setEnabled(const bool isEnabled) {
  if (isEnabled == _isEnabled) return;
  this->_isEnabled = isEnabled;
  digitalWrite(this->pinEnable, isEnabled ? LOW : HIGH);
}

/**
 * @brief Whether the motor is moving.
 */
bool MotorA4988::isRunning() {
  return stepper->isRunning();
}

/**
 * @brief Run the motor forward until stopped or marked as home.
 *
 * @return int8_t
 */
int8_t MotorA4988::runForward() {
  Serial.println("[A4988] Run forward");
  return stepper->runForward();
}

/**
 * @brief Run the motor backward until stopped or marked as home.
 *
 * @return int8_t
 */
int8_t MotorA4988::runBackward() {
  Serial.println("[A4988] Run backward");
  return stepper->runBackward();
}

/**
 * @brief Stop the motor
 */
void MotorA4988::stop() {
  Serial.println("[A4988] Stop");
  return stepper->stopMove();
}

/**
 * Set the current position of the motor as 0.
 */
void MotorA4988::setCurrentPositionAsHome() {
  stop();
}

/**
 * @brief Get the current position.
 *
 * @return int32_t
 */
int32_t MotorA4988::getCurrentPosition() {
  return stepper->getCurrentPosition();
}

