#define WBLINDS_DEFINE_GLOBAL_VARS
#include "defines.h"

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
char* apSSID = "WBlinds-";
char* apPass = "WBL1nds-123";
int apChannel = 1;
bool apHide = 0;


char mDnsName[MAX_MDNS_NAME_LENGTH] = "wblinds-";
char deviceName[MAX_DEVICE_NAME_LENGTH] = "wblinds-";

bool wifiConfigured = false;
char wifiSSID[64] = DEFAULT_SSID;
char wifiPass[64] = "";

void setDoReboot(bool v) {
    doReboot = v;
}