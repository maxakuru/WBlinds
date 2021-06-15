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

void MotorA4988::handleEvent(const StateEvent& event) {
  auto state = State::getInstance();
  if (event.flags_.tick_) {
    // convert steps to pct
    auto cPos = state->getPosition();
    auto pct = this->getCurrentPercent();
    if (cPos != pct) {
      WLOG_I(TAG, "set current pos: %i", pct);
      state->setPosition(this, pct);
    }
    return;
  }
  if (event.flags_.targetPos_) {
    auto tPos = state->getTargetPosition();

    WLOG_I(TAG, "move to target pos: %i", tPos);
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

  stepper_ = this->engine_.stepperConnectToPin(state->getStepPin());

  stepper_->setDirectionPin(state->getDirectionPin());
  stepper_->setEnablePin(state->getEnablePin());
  stepper_->disableOutputs();
  stepper_->setAutoEnable(true);

  // restore state
  int steps = percentToSteps(state->getPosition(), stepsPerPct_, maxPosition_);
  stepper_->setCurrentPosition(steps);
  stepper_->setSpeedInHz(state->getSpeed());
  stepper_->setAcceleration(state->getAccel());

  EventFlags flags;
  flags.pos_ = true;
  flags.speed_ = true;
  flags.accel_ = true;
  flags.targetPos_ = true;
  flags.moveDown_ = true;
  flags.moveUp_ = true;
  flags.moveStop_ = true;
  flags.tick_ = true;
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

  int ms1 = state->getMs1Pin();
  int ms2 = state->getMs2Pin();
  int ms3 = state->getMs3Pin();

  digitalWrite(ms1, LOW);
  digitalWrite(ms2, LOW);
  digitalWrite(ms3, LOW);
  if (resolution > stdBlinds::resolution_t::kFull && resolution != stdBlinds::resolution_t::kQuarter) {
    digitalWrite(ms1, HIGH);
  }
  if (resolution > stdBlinds::resolution_t::kHalf) {
    digitalWrite(ms2, HIGH);
  }
  if (resolution == stdBlinds::resolution_t::kSixteenth) {
    digitalWrite(ms3, HIGH);
  }
  setMaximumPosition_(resolution);
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
    WLOG_I(TAG, "SLEEPING");
    digitalWrite(slp, LOW);
  }
  else {
    WLOG_I(TAG, "WAKING");
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

  WLOG_I(TAG, "immediate");
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
}

int8_t MotorA4988::moveToPercent(uint8_t pct) {
  if (!isInit()) {
    return -1;
  }

  int32_t pos = percentToSteps(pct, stepsPerPct_, maxPosition_);

  WLOG_I(TAG, "steps: %i", pos);
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

  WLOG_I(TAG, "moveTo: %i", pos);
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
  this->stepsPerPct_ = pos / 100;
}

/**
 * @brief Calculate maximum position based on height,
 *        axis radius, and resolution.
 */
void MotorA4988::setMaximumPosition_(stdBlinds::resolution_t res) {
  uint32_t nSteps = maxTurns_ * stepsPerRev_ * (uint8_t)res;
  setMaximumPosition(nSteps);
}
