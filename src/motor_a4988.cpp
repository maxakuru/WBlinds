#include "motor_a4988.h"

MotorA4988::MotorA4988() {
  WLOG_I(TAG);

  isInit_ = false;
  auto state = State::getInstance();

  this->axisDiameter_mm_ = state->getAxisDiameter();
  this->cordDiameter_mm_ = state->getCordDiameter();
  this->cordLength_mm_ = state->getCordLength();
  this->stepsPerRev_ = state->getStepsPerRev();
  this->maxTurns_ = calculateMaxTurns((double)axisDiameter_mm_, cordDiameter_mm_, (double)cordLength_mm_);
  setResolution(state->getResolution());
  if(state->isCalibrated()) setMaximumPosition(state->getMaxPosition());

  pinMode(state->getMs1Pin(), OUTPUT);
  pinMode(state->getMs2Pin(), OUTPUT);
  pinMode(state->getMs3Pin(), OUTPUT);
  pinMode(state->getSleepPin(), OUTPUT);
  pinMode(state->getResetPin(), OUTPUT);
  pinMode(state->getEnablePin(), OUTPUT);

  // Not reset
  digitalWrite(state->getResetPin(), HIGH);

  // Not asleep
  isAsleep_ = false;
  digitalWrite(state->getSleepPin(), HIGH);

  // Using auto enable, initially disabled
  isEnabled_ = false;
  digitalWrite(state->getEnablePin(), HIGH);
}

bool MotorA4988::handleTick_(const WBlindsEvent& event) {
  if (!event.flags_.tick_) return false;
  if (!stepper_->isMotorRunning() && !justMoved_) return true;

  auto state = State::getInstance();
  // convert steps to pct
  auto cPos = state->getPosition();
  auto pct = this->getCurrentPercent();
  if (cPos != pct) {
    WLOG_D(TAG, "set current pos: %i", pct);
    state->setPosition(this, pct);
  }

  if(stepper_->isMotorRunning() && !justMoved_) {
    justMoved_ = true;
  } else {
    justMoved_ = false;
  }
  return true;
}

bool MotorA4988::handleMoveEvt_(const WBlindsEvent& event) {
  EventFlags interesting;
  interesting.moveStop_ = true;
  interesting.moveDown_ = true;
  interesting.moveUp_ = true;
  interesting.moveDown_ = true;
  interesting.moveBySteps_ = true;

  if (0 == (interesting.mask_ & event.flags_.mask_)) return false;
  WLOG_I(TAG, "handle move event...");

  if (event.flags_.moveStop_) {
    this->stop(true);
    return true;
  }
  if (event.flags_.moveDown_) {
    this->runDown();
    return true;
  }
  if (event.flags_.moveUp_) {
    this->runDown();
    return true;
  }
  if (event.flags_.moveUp_) {
    this->runDown();
    return true;
  }

  if (event.data_ == nullptr || event.data_->calibData == nullptr) return false;
  if (event.flags_.moveBySteps_) {
    int currPos = this->stepper_->getCurrentPosition();
    WLOG_D(TAG, "moveEvt calib data %i", event.data_->calibData->moveBySteps);

    int32_t newPos = currPos + event.data_->calibData->moveBySteps;
    WLOG_D(TAG, "moveEvt move from %i to: %i", currPos, newPos);
    this->moveTo(newPos);
    return true;
  }

  return false;
}

void MotorA4988::handleEvent(const WBlindsEvent& event) {
  if (handleTick_(event)) return;
  if (handleMoveEvt_(event)) return;

  WLOG_I(TAG, "event mask: %i", event.flags_.mask_);

  auto state = State::getInstance();
  if (event.flags_.atHome_) {
    WLOG_I(TAG, "handle at home event");
    return this->setCurrentPositionAsHome();
  }
  if (event.flags_.atFullyClosed_) {
    WLOG_I(TAG, "handle at closed event");
    int cPos = stepper_->getCurrentPosition();
    setMaximumPosition(cPos);
    state->setMaxPosition(cPos);
    state->setCalibrated(true);
    state->setTargetPosition(100);
    // return this->setCurrentPositionAsHome();
    return;
  }

  if (event.flags_.resolution_) {
    auto resolution = state->getResolution();
    if (this->stepper_->isMotorRunning()) {
      this->stepper_->stopMove();
    }

    WLOG_D(TAG, "new resolution: %i", resolution);
    this->setResolution(resolution);
  }

  bool stoppedMotor = false;
  if (event.flags_.speed_ || event.flags_.accel_) {
    auto speed = state->getSpeed();
    auto accel = state->getAccel();

    if (this->stepper_->isMotorRunning()) {
      stepper_->setDelayToDisable(UINT16_MAX);
      stoppedMotor = true; // restart after
      this->stepper_->stopMove();
    }
    WLOG_D(TAG, "new speed: %i", speed);
    this->setSpeed(speed);
    WLOG_D(TAG, "new accel: %i", accel);
    this->setAccel(accel);
  }
  if (event.flags_.targetPos_ || stoppedMotor) {
    auto tPos = state->getTargetPosition();

    WLOG_D(TAG, "move to target pos: %i", tPos);
    this->moveToPercent(tPos);
  }
}

// MotorA4988::~MotorA4988() {
//   State::getInstance()->Detach(this);
// }

/**
 * @brief Initialize the motor with an existing engine.
 *
 * @param engine
 */
void MotorA4988::init(FastAccelStepperEngine& engine) {
  auto state = State::getInstance();

  this->engine_ = engine;

  WLOG_D(TAG, "PIN step: %i", state->getStepPin());
  WLOG_D(TAG, "PIN dir: %i", state->getDirectionPin());
  WLOG_D(TAG, "PIN enable: %i", state->getEnablePin());
  WLOG_D(TAG, "PIN ms1: %i", state->getMs1Pin());
  WLOG_D(TAG, "PIN ms2: %i", state->getMs2Pin());
  WLOG_D(TAG, "PIN ms3: %i", state->getMs3Pin());
  WLOG_D(TAG, "PIN reset: %i", state->getResetPin());
  WLOG_D(TAG, "PIN sleep: %i", state->getSleepPin());

  stepper_ = this->engine_.stepperConnectToPin(state->getStepPin());

  stepper_->setDirectionPin(state->getDirectionPin());
  stepper_->setEnablePin(state->getEnablePin());
  // stepper_->disableOutputs();
  stepper_->enableOutputs();
  this->invertDirection();
  // stepper_->setAutoEnable(true);
  // stepper_->setDelayToDisable(5000);

  // restore state
  int steps = percentToSteps(state->getPosition(), stepsPerPct_, maxPosition_);
  stepper_->setCurrentPosition(steps);
  stepper_->setSpeedInHz(state->getSpeed());
  stepper_->setAcceleration(state->getAccel());

  EventFlags flags;
  flags.pos_ = true;
  flags.speed_ = true;
  flags.resolution_ = true;
  flags.accel_ = true;
  flags.targetPos_ = true;
  flags.moveDown_ = true;
  flags.moveUp_ = true;
  flags.moveStop_ = true;
  flags.tick_ = true;

  // calibration
  flags.atHome_ = true;
  flags.atFullyClosed_ = true;
  flags.moveBySteps_ = true;

  state->Attach(this, flags);

  isInit_ = true;
}

/**
 * @brief Initialize the motor.
 */
void MotorA4988::init() {
  WLOG_I(TAG);

  this->engine_ = FastAccelStepperEngine();
  engine_.init();
  init(engine_);
}

/**
 * @brief Whether the motor/engine is initialized already.
 */
bool MotorA4988::isInit() {
  return isInit_;
}

/**
 * @brief Whether the motor is asleep.
 */
bool MotorA4988::isAsleep() {
  return isAsleep_;
}

/**
 * @brief Whether the motor is enabled.
 */
bool MotorA4988::isEnabled() {
  return isEnabled_;
}

/**
 * @brief Set the motor microstep resolution.
 *
 * @param resolution
 */
void MotorA4988::setResolution(const stdBlinds::resolution_t resolution) {
  auto state = State::getInstance();
  WLOG_I(TAG, "setResolution %i %i", resolution, state->isCalibrated());
  
  int ms1 = state->getMs1Pin();
  int ms2 = state->getMs2Pin();
  int ms3 = state->getMs3Pin();

  digitalWrite(ms1, LOW);
  digitalWrite(ms2, LOW);
  digitalWrite(ms3, LOW);
  if (resolution > stdBlinds::resolution_t::kFull && resolution != stdBlinds::resolution_t::kQuarter) {
    WLOG_D(TAG, "setResolution 1");
    digitalWrite(ms1, HIGH);
  }
  if (resolution > stdBlinds::resolution_t::kHalf) {
    WLOG_D(TAG, "setResolution 2");
    digitalWrite(ms2, HIGH);
  }
  if (resolution == stdBlinds::resolution_t::kSixteenth) {
    WLOG_D(TAG, "setResolution 3");
    digitalWrite(ms3, HIGH);
  }
  if (!state->isCalibrated()) setMaximumPosition_(resolution);

  if (stepper_ == nullptr) return; // on init

  // stop motor if moving
  bool wasMoving = stepper_->isMotorRunning();
  if (wasMoving) {
    stepper_->stopMove();
  }

  // adjust current position to the new resolution
  auto pct = getCurrentPercent();
  auto steps = percentToSteps(pct, stepsPerRev_, maxPosition_);
  this->stepper_->setPositionAfterCommandsCompleted(steps);

  // TODO?: change speed according to resolution

  // restart motor if needed
  if (wasMoving) {
    this->moveToPercent(state->getTargetPosition());
  }
}

/**
 * @brief Set speed in Hz
 *
 * @param speed
 */
void MotorA4988::setSpeed(const uint32_t speed) {
  this->stepper_->setSpeedInHz(speed);
}

/**
 * @brief Set acceleration in steps/s/s
 *
 * @param accel
 */
void MotorA4988::setAccel(const int32_t accel) {
  this->stepper_->setAcceleration(accel);
}

/**
 * @brief Set whether the motor is asleep.
 *
 * @param shouldSleep true to go to sleep, false to wake
 */
void MotorA4988::setSleep(const bool shouldSleep) {
  this->isAsleep_ = shouldSleep;
  auto state = State::getInstance();
  int slp = state->getSleepPin();

  if (shouldSleep) {
    if (this->stepper_) {
      this->stepper_->stopMove();
    }
    WLOG_D(TAG, "SLEEPING");
    digitalWrite(slp, LOW);
  }
  else {
    WLOG_D(TAG, "WAKING");
    digitalWrite(slp, HIGH);
    int steps = percentToSteps(state->getPosition(), stepsPerPct_, maxPosition_);
    stepper_->setCurrentPosition(steps);
  }
}

/**
 * @brief Set whether motor is enabled.
 *
 * @param isEnabled
 */
void MotorA4988::setEnabled(const bool v) {
  int en = State::getInstance()->getEnablePin();
  this->isEnabled_ = v;
  digitalWrite(en, v ? LOW : HIGH);
}

/**
 * @brief Whether the motor is moving.
 */
bool MotorA4988::isRunning() {
  return stepper_->isRunning();
}

/**
 * @brief Run the motor up until stopped or marked as home.
 *
 * @return int8_t
 */
int8_t MotorA4988::runUp() {
  WLOG_I(TAG);
  return stepper_->runForward();
}

/**
 * @brief Run the motor down until stopped or marked as home.
 *
 * @return int8_t
 */
int8_t MotorA4988::runDown() {
  WLOG_I(TAG);
  return stepper_->runBackward();
}

void MotorA4988::invertDirection() {
  // TODO: save pin inversion to state
  stepper_->setDirectionPin(stepper_->getDirectionPin(), !stepper_->directionPinHighCountsUp());
}

/**
 * @brief Stop the motor
 */
void MotorA4988::stop(bool immediate = true) {
  WLOG_I(TAG);
  if (!immediate) {
    return stepper_->stopMove();
  }

  WLOG_D(TAG, "immediate");
  stepper_->forceStopAndNewPosition(stepper_->getCurrentPosition());
}

/**
 * @brief Set the current position of the motor as 0.
 * Stops the motor if currently moving.
 */
void MotorA4988::setCurrentPositionAsHome() {
  stepper_->forceStopAndNewPosition(0);
  auto state = State::getInstance();
  state->setPosition(this, 0);
  state->setTargetPosition(0);
}

int8_t MotorA4988::moveToPercent(uint8_t pct) {
  if (!isInit()) {
    return -1;
  }

  int32_t pos = percentToSteps(pct, stepsPerPct_, maxPosition_);

  WLOG_D(TAG, "steps: %i", pos);
  return moveTo(pos);
}

int8_t MotorA4988::moveTo(int32_t pos) {
  if (!isInit()) {
    return -1;
  }

  if (this->isAsleep()) {
    // TODO: wake before move?
    return -1;
  }

  WLOG_D(TAG, "moveTo: %i", pos);
  // move, event handler will update actual position on tick
  return stepper_->moveTo(pos);
}

/**
 * @brief Get the current position in percent.
 *
 * @return uint8_t
 */
uint8_t MotorA4988::getCurrentPercent() {
  int pct = stepsToPercent(stepper_->getCurrentPosition(), stepsPerPct_);
  return pct;
}

/**
 * @brief Get maximum position.
 */
uint32_t MotorA4988::getMaximumPosition() {
  return this->maxPosition_;
}

/**
 * @brief Set maximum position in steps.
 */
void MotorA4988::setMaximumPosition(uint32_t pos) {
  this->maxPosition_ = pos;
  this->stepsPerPct_ = max(pos / 100, (uint32_t)1);
}

/**
 * @brief Calculate maximum position based on height,
 *        axis radius, and resolution.
 */
void MotorA4988::setMaximumPosition_(stdBlinds::resolution_t res) {
  uint32_t nSteps = maxTurns_ * stepsPerRev_ * (uint8_t)res;
  WLOG_D(TAG, "new max pos: %i", nSteps);
  setMaximumPosition(nSteps);
}
