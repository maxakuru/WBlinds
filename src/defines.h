#ifndef DEFINES_H_
#define DEFINES_H_

#include <Arduino.h>
#include "ui_index.h"
#include <Credentials.h>
#include <LITTLEFS.h>

// #include "ui_fixtures.h"

#ifdef WBLINDS_DEBUG
#include "esp32-hal-log.h"
#define WLOG_I(x...) ESP_LOGI(x)
#define WLOG_D(x...) ESP_LOGD(x)
#define WLOG_E(x...) ESP_LOGE(x)
#else
#define WLOG_I(x...)
#define WLOG_D(x...)
#define WLOG_E(x...)
#endif

#ifndef WBLINDS_DEFINE_GLOBAL_VARS
# define WBLINDS_GLOBAL extern
# define _INIT(x)
# define _INIT_N(x)
#else
# define WBLINDS_GLOBAL
# define _INIT(x) = x

#define UNPACK( ... ) __VA_ARGS__
# define _INIT_N(x) UNPACK x
#endif

#define STRINGIFY(X) #X
#define TOSTRING(X) STRINGIFY(X)

#ifndef W_VERSION
#define W_VERSION "dev"
#endif

// Global Variable definitions
WBLINDS_GLOBAL char VERSION[] _INIT(TOSTRING(W_VERSION));

// #define ARDUINOJSON_DECODE_UNICODE 0
// #include "src/dependencies/json/AsyncJson-v6.h"
// #include "src/dependencies/json/ArduinoJson-v6.h"
#include <AsyncJson.h>
#include <ArduinoJson.h>


// ESP32-WROVER features SPI RAM (aka PSRAM) which can be allocated using ps_malloc()
// we can create custom PSRAMDynamicJsonDocument to use such feature (replacing DynamicJsonDocument)
// The following is a construct to enable code to compile without it.
// There is a code thet will still not use PSRAM though:
//    AsyncJsonResponse is a derived class that implements DynamicJsonDocument (AsyncJson-v6.h)
// #if defined(ARDUINO_ARCH_ESP32) && defined(WLED_USE_PSRAM)
// struct PSRAM_Allocator {
//     void* allocate(size_t size) {
//         if (psramFound()) return ps_malloc(size); // use PSRAM if it exists
//         else              return malloc(size);    // fallback
//     }
//     void deallocate(void* pointer) {
//         free(pointer);
//     }
// };
// using PSRAMDynamicJsonDocument = BasicJsonDocument<PSRAM_Allocator>;
// #else
// #define PSRAMDynamicJsonDocument DynamicJsonDocument
// #endif

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

    extern std::map<error_code_t, const char*> ErrorMessage;

    extern const char* MT_JSON;
    extern const char* MT_JPG;
    extern const char* MT_HTML;
}

extern const byte MAGIC_NUMBER[4];
extern bool forceReconnect;
// extern bool wifiLock;
// extern bool otaLock;
extern bool doReboot;
// extern byte optionType;
extern String macAddress;
extern String ipAddress;


void setDoReboot(bool v);
#define DO_REBOOT() setDoReboot(true);

#endif // DEFINES_H_