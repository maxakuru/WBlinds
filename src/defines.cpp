#include "defines.h"

const char* VERSION = "0.0.1";

namespace WBlinds {
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
    const char* MT_TEXT = "text/html";
}

bool forceReconnect = false;
bool wifiLock = false;
bool otaLock = false;
bool doReboot = false;
// char* deviceName[1024] = "wblinds";
String messageHead = "";
String messageSub = "";
byte optionType;
