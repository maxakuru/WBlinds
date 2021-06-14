#ifndef WBLINDS_H_
#define WBLINDS_H_

#include "defines.h"

#ifndef DISABLE_MQTT
#include "api_mqtt.h"
#endif
#ifndef DISABLE_UDP_SYNC
#include "udp_notifier.h"
#endif
#ifndef DISABLE_HOMEKIT
#include "homekit.h"
#endif

// Only A4988 supported right now
#ifndef STEPPER_A4988
#define STEPPER_A4988
#endif

#ifdef STEPPER_A4988
#include "motor_a4988.h"
#endif

class WBlinds {
public:
    static WBlinds* instance;
    static WBlinds* getInstance();

    void setup();
    void loop();
    void reset();
    void restore();
    void initAP(bool resetAP = false);
private:
    WBlinds() {}
};

#endif // WBLINDS_H_