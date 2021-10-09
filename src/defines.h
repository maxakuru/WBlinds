#ifndef DEFINES_H_
#define DEFINES_H_

#include <Arduino.h>
#include "ui_index.h"
#include <LITTLEFS.h>
#include "ui_fixtures.h"

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
#define W_VERSION "0.0.1"
#endif

// Global Variable definitions
WBLINDS_GLOBAL char VERSION[] _INIT(TOSTRING(W_VERSION));

#include <AsyncJson.h>
#include <ArduinoJson.h>


#define WIFI_CONNECTED (WiFi.status() == WL_CONNECTED)
#define WIFI_CONFIGURED (strlen(wifiSSID) >= 1 && strcmp(wifiSSID, DEFAULT_SSID) != 0)

// DEFAULTS

// Wifi
#define DEFAULT_SSID "WBlinds"

// Pin config defaults
#define DEFAULT_DIR_PIN 17
#define DEFAULT_STEP_PIN 5
#define DEFAULT_SLP_PIN 18
#define DEFAULT_EN_PIN 23
#define DEFAULT_RST_PIN 19
#define DEFAULT_MS1_PIN 1
#define DEFAULT_MS2_PIN 3
#define DEFAULT_MS3_PIN 21
#define DEFAULT_HOME_SWITCH_PIN 4 // microswitch pin for homing

// Dimensions
#define DEFAULT_STEPS_PER_REV 200
#define DEFAULT_CORD_LENGTH_MM 1650
#define DEFAULT_CORD_DIAMETER_MM 0.1
#define DEFAULT_AXIS_DIAMETER_MM 15

// Limits
#define MAX_SSID_LENGTH 32
#define MAX_PW_LENGTH 64
#define MAX_DEVICE_NAME_LENGTH 64
#define MAX_MDNS_NAME_LENGTH 64
#define MAX_MQTT_HOST_LENGTH 128
#define MAX_MQTT_TOPIC_LENGTH 128
#define MAX_MQTT_USER_LENGTH 41
#define MAX_MQTT_PASS_LENGTH 41

// Potentially useful publics
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

// ESP
extern uint32_t lastHeap;

// UDP
extern const byte MAGIC_NUMBER[4];

// Access point
extern char apSSID[MAX_SSID_LENGTH];
extern char apPass[MAX_PW_LENGTH];
extern int apChannel;
extern bool apHide;

// Device
extern char deviceName[MAX_DEVICE_NAME_LENGTH];
extern char mDnsName[MAX_MDNS_NAME_LENGTH];

// Wifi
extern bool wifiConfigured;
extern char wifiSSID[MAX_SSID_LENGTH];
extern char wifiPass[MAX_PW_LENGTH];
extern String macAddress;
extern String ipAddress;

// Controls
extern bool lowHeap;
extern bool doReboot;
extern bool doRestore;
extern void DO_REBOOT();
extern void DO_RESTORE();


void uniqueTag(char* out, size_t maxLen, const char* tag);

#endif // DEFINES_H_