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
private:
    bool wifiInit_ = false;
    bool peersInit_ = false;
    bool apActive_ = false;
    bool connFailing_ = false;
    void handleWiFi_();
    void initAP_(bool resetAP = false);

    WBlinds() {}
};

#endif // WBLINDS_H_