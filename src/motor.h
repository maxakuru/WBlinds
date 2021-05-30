#ifndef MOTOR_H_
#define MOTOR_H_

#include <Arduino.h>

namespace stdBlinds {
    enum class resolution_t {
        kFull = 0,
        kHalf = 1,
        kQuarter = 2,
        kEighth = 3,
        kSixteenth = 4
    };
}

class BlindsMotor {
public:
    virtual ~BlindsMotor() {}
    virtual void setResolution(const stdBlinds::resolution_t resolution) = 0;
    virtual void setSleep(const bool shouldSleep) = 0;
    virtual void setEnabled(const bool isEnabled) = 0;
    virtual void init() = 0;
    virtual int8_t runForward() = 0;
    virtual int8_t runBackward() = 0;
    virtual void stop() = 0;
    virtual void setCurrentPositionAsHome() = 0;
    virtual bool isInit() = 0;
    virtual bool isEnabled() = 0;
    virtual bool isAsleep() = 0;
};

#endif  // MOTOR_H_
