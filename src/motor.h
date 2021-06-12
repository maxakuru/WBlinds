#ifndef MOTOR_H_
#define MOTOR_H_

#include <Arduino.h>
#include "defines.h"
#include "state.h"

class BlindsMotor {
public:
    virtual ~BlindsMotor() {}
    virtual void setResolution(const stdBlinds::resolution_t resolution) = 0;
    virtual void setSleep(const bool shouldSleep) = 0;
    virtual void setEnabled(const bool isEnabled) = 0;
    virtual void init() = 0;
    virtual bool isRunning() = 0;
    virtual bool isInit() = 0;
    virtual bool isEnabled() = 0;
    virtual bool isAsleep() = 0;
    virtual void stop(bool immediate) = 0;
    virtual int8_t runUp() = 0;
    virtual int8_t runDown() = 0;
    virtual int8_t moveTo(int32_t pos) = 0;
    virtual int8_t moveTo(int32_t pos, uint32_t speed_hz) = 0;
    virtual int8_t moveTo(int32_t pos, uint32_t speed_hz, int32_t accel) = 0;
    virtual int8_t moveToPercent(uint8_t pos) = 0;
    virtual int8_t moveToPercent(uint8_t pct, uint32_t speed_hz) = 0;
    virtual int8_t moveToPercent(uint8_t pct, uint32_t speed_hz, int32_t accel) = 0;
    virtual int32_t getCurrentPosition() = 0;
    virtual void setMaximumPosition(uint32_t pos) = 0;
    virtual void setCurrentPositionAsHome() = 0;
    /**
     * @brief Calculate maximum number of turns to fully wrap cord around axis.
     *
     *          Dc - Da + sqrt((Da - Dc)^2 + (4 * Dc * Lc) / pi)
     * Nturns = ------------------------------------------------
     *                            2 * Dcord
     *
     * @param dAxis Diameter of the axis
     * @param dCord Diameter of the cord
     * @param lCord Length of cord
     * @return uint32_t
     */
    uint32_t calculateMaxTurns(double dAxis, double dCord, double lCord) {
        return (dCord - dAxis + sqrt(pow(dAxis - 1, 2) + ((4.0 * dCord * lCord) / PI))) / (2.0 * dCord);
    }
};

#endif  // MOTOR_H_
