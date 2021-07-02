#ifndef MOTOR_H_
#define MOTOR_H_

#include "defines.h"
#include "state.h"

class BlindsMotor : virtual protected StateObserver {
public:
    virtual ~BlindsMotor() {};
    virtual void handleEvent(const StateEvent& event) = 0;
    virtual void setResolution(const stdBlinds::resolution_t resolution) = 0;
    virtual void setSleep(const bool shouldSleep) = 0;
    virtual void setEnabled(const bool isEnabled) = 0;
    virtual void setSpeed(const uint32_t speed) = 0;
    virtual void setAccel(const int32_t accel) = 0;

    virtual void init() = 0;
    virtual bool isRunning() = 0;
    virtual bool isEnabled() = 0;
    virtual bool isAsleep() = 0;
    virtual bool isInit() = 0;
    virtual void invertDirection() = 0;
    virtual void stop(bool immediate) = 0;
    virtual int8_t runUp() = 0;
    virtual int8_t runDown() = 0;
    virtual void setCurrentPositionAsHome() = 0;

    // as steps
    virtual int8_t moveTo(int32_t pos) = 0;
    virtual uint32_t getMaximumPosition() = 0;
    virtual void setMaximumPosition(uint32_t pos) = 0;

    // as percent
    virtual int8_t moveToPercent(uint8_t pos) = 0;
    virtual uint8_t getCurrentPercent() = 0;

    static uint8_t stepsToPercent(uint32_t steps, uint32_t stepsPerPct) {
        steps = max((uint32_t)0, steps);
        return min(steps / stepsPerPct, (uint32_t)100);
    }
    static int32_t percentToSteps(uint8_t pct, int stepsPerPct, uint32_t maxPosition) {
        pct = max(0, min((int)pct, 100));
        return min((pct * stepsPerPct), (int)maxPosition);
    }

    /**
     * @brief Calculate number of turns to fully wrap cord around axle.
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
    static uint32_t calculateMaxTurns(double dAxis, double dCord, double lCord) {
        uint32_t v = (dCord - dAxis + sqrt((dAxis - 1) * (dAxis - 1) + ((4.0 * dCord * lCord) / PI))) / (2.0 * dCord);
        return v;
    }
};

#endif  // MOTOR_H_
