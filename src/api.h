#ifndef API_H_
#define API_H_

#include "motor.h"

class BlindsAPI {

public:
    virtual ~BlindsAPI() {}
    virtual void init(BlindsMotor* motor) = 0;
    virtual void loop() = 0;
protected:
    BlindsMotor* motor;
};

#endif  // API_H_