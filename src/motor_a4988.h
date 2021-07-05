#ifndef MOTOR_A4988_H_
#define MOTOR_A4988_H_

#include <FastAccelStepper.h>
#include "motor.h"

typedef struct {
  uint8_t ms1pin;   // pin for microstep resolution 1
  uint8_t ms2pin;   // pin for microstep resolution 2
  uint8_t ms3pin;   // pin for microstep resolution 3
} params_a4988_t;

class MotorA4988 : virtual public BlindsMotor {
public:
  explicit MotorA4988();
  ~MotorA4988() override {
    if (isInit_) {
      stepper_->detachFromPin();
      stop(true);
    }
    State::getInstance()->Detach(this);
  };
  void handleEvent(const WBlindsEvent& event) override;
  void setResolution(const stdBlinds::resolution_t resolution) override;
  void setSleep(const bool shouldSleep) override;
  void setEnabled(const bool isEnabled) override;
  void setSpeed(const uint32_t speed) override;
  void setAccel(const int32_t accel) override;


  void init() override;
  void init(FastAccelStepperEngine& engine);
  int8_t runUp() override;
  int8_t runDown() override;
  void invertDirection() override;
  void stop(bool immediate) override;
  int8_t moveTo(int32_t pos) override;
  int8_t moveToPercent(uint8_t pct) override;
  bool isInit() override;
  bool isEnabled() override;
  bool isAsleep() override;
  void setCurrentPositionAsHome() override;
  bool isRunning() override;

  uint8_t getCurrentPercent() override;

  uint32_t getMaximumPosition() override;
  void setMaximumPosition(uint32_t pos) override;
private:
  FastAccelStepper* stepper_ = NULL;
  FastAccelStepperEngine engine_;
  bool isInit_;
  bool isAsleep_;
  bool isEnabled_;
  uint32_t cordLength_mm_;
  double cordDiameter_mm_;
  uint32_t axisDiameter_mm_;
  uint16_t stepsPerRev_;
  uint16_t stepsPerPct_;
  uint32_t maxTurns_;
  uint32_t maxPosition_;
  void setMaximumPosition_(stdBlinds::resolution_t res);
  bool handleTick_(const WBlindsEvent& event);
  bool handleMoveEvt_(const WBlindsEvent& event);
};

#endif  // MOTOR_A4988_H_