#define WBLINDS_DEFINE_GLOBAL_VARS
#include "defines.h"
#include <esp_wifi.h>

const byte MAGIC_NUMBER[4] = { 0xFE, 0xED, 0xDA, 0xBB };

namespace stdBlinds {
    const char* ERR_INVALID_JSON = "Invalid json";
    const char* ERR_NO_OP = "Expecting op";
    const char* ERR_UNKNOWN_OP = "Unknown op";
    const char* ERR_MISSING_POS = "Missing pos or pct";

    std::map<error_code_t, const char*> ErrorMessage = {
        {error_code_t::InvalidJson, ERR_INVALID_JSON},
        {error_code_t::MissingOp, ERR_NO_OP},
        {error_code_t::UnknownOp, ERR_UNKNOWN_OP},
        {error_code_t::MissingPos, ERR_MISSING_POS}
    };

    // Media types
    const char* MT_JSON = "application/json";
    const char* MT_HTML = "text/html";
    const char* MT_JPG = "image/jpeg";
}

bool forceReconnect = false;
bool needsConfig = true;
bool doReboot = false;
String macAddress = "";
String ipAddress = "";

bool apActive = false;
char apSSID[MAX_SSID_LENGTH] = "";
char apPass[MAX_PW_LENGTH] = "wblinds123";
int apChannel = 1;
bool apHide = 0;


char mDnsName[MAX_MDNS_NAME_LENGTH];
char deviceName[MAX_DEVICE_NAME_LENGTH];

bool wifiConfigured = false;
char wifiSSID[MAX_SSID_LENGTH] = DEFAULT_SSID;
char wifiPass[MAX_PW_LENGTH] = "";

void setDoReboot(bool v) {
    doReboot = v;
}

void uniqueTag(char* out, size_t maxLen, const char* tag) {
    uint8_t mac[6];
    WLOG_I(TAG, "max len: %i", maxLen);

    esp_efuse_mac_get_default(mac);
    WLOG_I(TAG, "%s-%02X%02X%02X", tag, mac[3], mac[4], mac[5]);
    snprintf(out, maxLen, "%s-%02X%02X%02X", tag, mac[3], mac[4], mac[5]);
}