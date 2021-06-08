#ifndef DEFINES_H_
#define DEFINES_H_

#include <map>
#include "Arduino.h"
#include "html_ui.h"
// #include "html_fixtures.h"

namespace WBlinds {

    enum class resolution_t {
        kFull = 1,
        kHalf = 2,
        kQuarter = 4,
        kEighth = 8,
        kSixteenth = 16
    };

    enum class error_code_t {
        NoError = 0,
        InvalidJson = -1,
        MissingOp = -2,
        UnknownOp = -3,
        MissingPos = -4
    };

    extern std::map<error_code_t, const char*> ErrorMessage;

    extern const char* MT_JSON;
    extern const char* MT_TEXT;
}

extern const char* VERSION;
extern String messageHead;
extern String messageSub;
extern bool forceReconnect;
extern bool wifiLock;
extern bool otaLock;
extern bool doReboot;
extern byte optionType;

#endif // DEFINES_H_