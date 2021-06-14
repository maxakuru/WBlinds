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
    virtual void init() = 0;
    virtual bool isRunning() = 0;
    virtual bool isEnabled() = 0;
    virtual bool isAsleep() = 0;
    virtual void invertDirection() = 0;
    virtual void stop(bool immediate) = 0;
    virtual int8_t runUp() = 0;
    virtual int8_t runDown() = 0;
    virtual int8_t moveTo(int32_t pos) = 0;
    virtual int8_t moveToPercent(uint8_t pos) = 0;

    virtual uint32_t getMaximumPosition() = 0;
    virtual void setMaximumPosition(uint32_t pos) = 0;

    virtual int32_t getCurrentPosition() = 0;
    virtual void setCurrentPositionAsHome() = 0;

    virtual bool isInit() = 0;

    static uint8_t stepsToPercent(double steps, double maxPosition) {
        steps = max((double)0, steps);
        if (steps == 0 || maxPosition == 0) {
            return steps;
        }
        return round((steps / maxPosition) * 100.0);
    }
    static int32_t percentToSteps(double pct, double maxPosition) {
        pct = max((double)0, min(pct, 100.0));
        return round((pct * maxPosition) / 100.0);
    }

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
    static uint32_t calculateMaxTurns(double dAxis, double dCord, double lCord) {
        ESP_LOGI(TAG, "dAxis, dCord, lCord: %f %f %f", dAxis, dCord, lCord);
        uint32_t v = (dCord - dAxis + sqrt(pow(dAxis - 1, 2) + ((4.0 * dCord * lCord) / PI))) / (2.0 * dCord);
        ESP_LOGI(TAG, "max turns: %i", v);
        return v;
    }    
};

#endif  // MOTOR_H_
