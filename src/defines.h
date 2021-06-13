#ifndef DEFINES_H_
#define DEFINES_H_

#include <map>
#include "Arduino.h"
#include "ui_index.h"
// #include "ui_fixtures.h"
#include "esp32-hal-log.h"

// DEFAULTS
// Pin config defaults
#define DEFAULT_DIR_PIN 18
#define DEFAULT_STEP_PIN 19
#define DEFAULT_SLP_PIN 21
#define DEFAULT_EN_PIN 23
#define DEFAULT_RST_PIN 3
#define DEFAULT_MS1_PIN 1
#define DEFAULT_MS2_PIN 5
#define DEFAULT_MS3_PIN 17
#define DEFAULT_HOME_SWITCH_PIN 4 // microswitch pin for homing

// Dimensions
#define DEFAULT_STEPS_PER_REV 200
#define DEFAULT_CORD_LENGTH_MM 1650
#define DEFAULT_CORD_DIAMETER_MM 0.1
#define DEFAULT_AXIS_DIAMETER_MM 15

namespace stdBlinds {

    enum class resolution_t {
        kFull = 1,
        kHalf = 2,
        kQuarter = 4,
        kEighth = 8,
        kSixteenth = 16
    };

    enum class error_code_t {
        NoError = 0,
        InvalidJson = 1,
        MissingOp = 2,
        UnknownOp = 3,
        MissingPos = 4
    };

    enum class datagram_t {
        Hello = 0,
        Acknowledge = 1,
        JoinGroup = 2,
        LeaveGroup = 3,
        UpdateState = 4,
        Ping = 5,
        Pong = 6
    };

    extern std::map<error_code_t, const char*> ErrorMessage;

    extern const char* MT_JSON;
    extern const char* MT_JPG;
    extern const char* MT_HTML;
}

extern std::map<stdBlinds::datagram_t, const uint8_t> DatagramSize;
extern const byte MAGIC_NUMBER[4];
extern const char* VERSION;
extern String messageHead;
extern String messageSub;
extern bool forceReconnect;
extern bool wifiLock;
extern bool otaLock;
extern bool doReboot;
extern byte optionType;

void setDoReboot(bool v);
#define DO_REBOOT() setDoReboot(true);

#endif // DEFINES_H_