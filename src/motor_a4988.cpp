#include "motor_a4988.h"

MotorA4988::MotorA4988(
  uint8_t pinStep, uint8_t pinDir, uint8_t pinEnable, uint8_t pinSleep, uint8_t pinReset, uint8_t pinMs1,
  uint8_t pinMs2, uint8_t pinMs3, uint32_t cordLength_mm, uint32_t cordDiameter_mm, uint32_t axisDiameter_mm, uint16_t stepsPerRev
) {
  Serial.println("[MotorA4988] constructor");
  _isInit = false;
  this->pinStep = pinStep;
  this->pinDir = pinDir;
  this->pinEnable = pinEnable;
  this->pinSleep = pinSleep;
  this->pinReset = pinReset;
  this->pinms1 = pinMs1;
  this->pinms2 = pinMs2;
  this->pinms3 = pinMs3;
  this->cordLength_mm = cordLength_mm;
  this->cordDiameter_mm = cordDiameter_mm;
  this->axisDiameter_mm = axisDiameter_mm;
  this->stepsPerRev = stepsPerRev;

  this->_resolution = WBlinds::resolution_t::kFull;
  this->maxTurns = calculateMaxTurns(axisDiameter_mm, cordDiameter_mm, cordLength_mm);
  setResolution(_resolution);
  _setMaximumPosition();

  pinMode(this->pinms1, OUTPUT);
  pinMode(this->pinms2, OUTPUT);
  pinMode(this->pinms3, OUTPUT);
  pinMode(this->pinSleep, OUTPUT);
  pinMode(this->pinReset, OUTPUT);
  pinMode(this->pinEnable, OUTPUT);

  // Not reset
  digitalWrite(this->pinReset, HIGH);

  // Not asleep
  _isAsleep = false;
  digitalWrite(this->pinSleep, HIGH);

  // Using auto enable, initially disabled
  _isEnabled = false;
  digitalWrite(this->pinEnable, HIGH);
}

/**
 * @brief Initialize the motor with an existing engine.
 *
 * @param engine
 */
void MotorA4988::init(FastAccelStepperEngine& engine) {
  Serial.println("[MotorA4988] init(engine)");

  this->engine = engine;
  stepper = this->engine.stepperConnectToPin(pinStep);

  stepper->setDirectionPin(this->pinDir);
  stepper->setEnablePin(this->pinEnable);
  stepper->disableOutputs();
  stepper->setAutoEnable(true);

  // restore state
  auto state = State::getInstance();
  stepper->setCurrentPosition(state->getPosition());

  _isInit = true;
}

/**
 * @brief Initialize the motor.
 */
void MotorA4988::init() {
  Serial.println("[MotorA4988] init()");

  this->engine = FastAccelStepperEngine();
  engine.init();
  init(engine);
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
void MotorA4988::setResolution(const WBlinds::resolution_t resolution) {
  Serial.println("[MotorA4988] setResolution()");

  digitalWrite(this->pinms1, LOW);
  digitalWrite(this->pinms2, LOW);
  digitalWrite(this->pinms3, LOW);
  if (resolution > WBlinds::resolution_t::kFull && resolution != WBlinds::resolution_t::kQuarter) {
    digitalWrite(this->pinms1, HIGH);
  }
  if (resolution > WBlinds::resolution_t::kHalf) {
    digitalWrite(this->pinms2, HIGH);
  }
  if (resolution == WBlinds::resolution_t::kSixteenth) {
    digitalWrite(this->pinms3, HIGH);
  }
  if (_resolution != resolution) {
    // recalculate the max position
    _resolution = resolution;
    _setMaximumPosition();
  }
}

/**
 * @brief Set whether the motor is asleep.
 *
 * @param shouldSleep true to go to sleep, false to wake
 */
void MotorA4988::setSleep(const bool shouldSleep) {
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
    // TODO: set current position from SPIFFS
    delay(1); // let it reach power
  }
}

/**
 * @brief Set whether motor is enabled.
 *
 * @param isEnabled
 */
void MotorA4988::setEnabled(const bool isEnabled) {
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
 * @brief Run the motor up until stopped or marked as home.
 *
 * @return int8_t
 */
int8_t MotorA4988::runUp() {
  Serial.println("[A4988] Run up");
  return stepper->runForward();
}

/**
 * @brief Run the motor down until stopped or marked as home.
 *
 * @return int8_t
 */
int8_t MotorA4988::runDown() {
  Serial.println("[A4988] Run down");
  return stepper->runBackward();
}

/**
 * @brief Stop the motor
 */
void MotorA4988::stop(bool immediate = true) {
  Serial.println("[A4988] Stop");
  if (!immediate) {
    return stepper->stopMove();
  }

  Serial.println("[A4988] Stop immediate");
  stepper->forceStopAndNewPosition(stepper->getCurrentPosition());
}

/**
 * @brief Set the current position of the motor as 0.
 * Stops the motor if currently moving.
 */
void MotorA4988::setCurrentPositionAsHome() {
  stepper->forceStopAndNewPosition(0);
}

int8_t MotorA4988::moveToPercent(uint8_t pct) {
  if (isInit()) {
    return -1;
  }
  pct = max(pct, 100);
  int32_t pos = (pct * this->maxPosition) / 100;

  Serial.print("new pos: ");
  Serial.println(pos);
  return moveTo(pos);
}

int8_t MotorA4988::moveToPercent(uint8_t pct, uint32_t speed_hz) {
  stepper->setSpeedInHz(speed_hz);
  return this->moveToPercent(pct);
}

int8_t MotorA4988::moveToPercent(uint8_t pct, uint32_t speed_hz, int32_t accel) {
  stepper->setAcceleration(accel);
  return this->moveToPercent(pct, speed_hz);
}

int8_t MotorA4988::moveTo(int32_t pos) {
  if (!isInit()) {
    return -1;
  }

  if (this->isAsleep()) {
    // TODO: wake before move?
    return -1;
  }

  State::getInstance()->setPosition(pos);

  return stepper->moveTo(pos);
}

int8_t MotorA4988::moveTo(int32_t pos, uint32_t speed_hz) {
  stepper->setSpeedInHz(speed_hz);
  State::getInstance()->setSpeed(speed_hz);
  return this->moveTo(pos);
}

int8_t MotorA4988::moveTo(int32_t pos, uint32_t speed_hz, int32_t accel) {
  stepper->setAcceleration(accel);
  return this->moveTo(pos, speed_hz);
}

/**
 * @brief Get the current position.
 *
 * @return int32_t
 */
int32_t MotorA4988::getCurrentPosition() {
  return stepper->getCurrentPosition();
}

/**
 * @brief Set maximum position.
 */
void MotorA4988::setMaximumPosition(uint32_t pos) {
  this->maxPosition = pos;
}

/**
 * @brief Calculate maximum position based on height,
 *        axis radius, and resolution.
 */
void MotorA4988::_setMaximumPosition() {
  Serial.println("[MotorA4988] _setMaximumPosition()");

  uint32_t nSteps = maxTurns * stepsPerRev * (uint8_t)_resolution;
  Serial.print("[MotorA4988] _setMaximumPosition() nSteps: ");
  Serial.println(nSteps);
  setMaximumPosition(nSteps);
}