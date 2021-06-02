#ifndef MOTOR_A4988_H_
#define MOTOR_A4988_H_

#include "FastAccelStepper.h"
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
    uint8_t pinMs3,
    uint32_t cordLength_mm,
    uint32_t cordDiameter_mm,
    uint32_t axisDiameter_mm,
    uint16_t stepsPerRev
  );
  ~MotorA4988() override {}
  void setResolution(const WBlinds::resolution_t resolution) override;
  void setSleep(const bool shouldSleep) override;
  void setEnabled(const bool isEnabled) override;
  void init() override;
  void init(FastAccelStepperEngine& engine);
  int8_t runUp() override;
  int8_t runDown() override;
  void stop(bool immediate) override;
  int8_t moveTo(int32_t pos) override;
  int8_t moveTo(int32_t pos, uint32_t speed_hz) override;
  int8_t moveTo(int32_t pos, uint32_t speed_hz, int32_t accel) override;
  int8_t moveToPercent(uint8_t pct) override;
  int8_t moveToPercent(uint8_t pct, uint32_t speed_hz) override;
  int8_t moveToPercent(uint8_t pct, uint32_t speed_hz, int32_t accel) override;
  bool isInit() override;
  bool isEnabled() override;
  bool isAsleep() override;
  void setCurrentPositionAsHome() override;
  bool isRunning() override;
  int32_t getCurrentPosition() override;
  void setMaximumPosition(uint32_t pos) override;
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
  uint32_t cordLength_mm;
  uint32_t cordDiameter_mm;
  uint32_t axisDiameter_mm;
  uint16_t stepsPerRev;
  uint32_t maxPosition;
  uint32_t maxTurns;
  FastAccelStepperEngine engine;
  bool _isInit;
  bool _isAsleep;
  bool _isEnabled;
  WBlinds::resolution_t _resolution;
  void _setMaximumPosition();
};

#endif  // MOTOR_A4988_H_