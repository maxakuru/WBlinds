#ifndef MOTOR_A4988_H_
#define MOTOR_A4988_H_

#include "FastAccelStepper.h"
#include <Arduino.h>
#include "motor.h"

typedef struct {
  uint8_t ms1pin;   // pin for microstep resolution 1
  uint8_t ms2pin;   // pin for microstep resolution 2
  uint8_t ms3pin;   // pin for microstep resolution 3
} params_a4988_t;

class MotorA4988 : virtual public BlindsMotor {
public:
  explicit MotorA4988(
    uint8_t pinStep,
    uint8_t pinDir,
    uint8_t pinEnable,
    uint8_t pinSleep,
    uint8_t pinReset,
    uint8_t pinMs1,
    uint8_t pinMs2,
    uint8_t pinMs3
  );
  ~MotorA4988() override {}
  void setResolution(const stdBlinds::resolution_t resolution) override;
  void setSleep(const bool shouldSleep) override;
  void setEnabled(const bool isEnabled) override;
  void init() override;
  void init(FastAccelStepperEngine& engine);
  int8_t runForward() override;
  int8_t runBackward() override;
  void stop() override;
  bool isInit() override;
  bool isEnabled() override;
  bool isAsleep() override;
  void setCurrentPositionAsHome() override;
  bool isRunning();
  int32_t getCurrentPosition();
  FastAccelStepper* stepper = NULL;
private:
  uint8_t pinms1;
  uint8_t pinms2;
  uint8_t pinms3;
  uint8_t pinSleep;
  uint8_t pinReset;
  uint8_t pinEnable;
  uint8_t pinStep;
  uint8_t pinDir;
  FastAccelStepperEngine engine;
  bool _isInit;
  bool _isAsleep;
  bool _isEnabled;
};

#endif  // MOTOR_A4988_H_