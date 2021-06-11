#include "defines.h"

const char* VERSION = "0.0.1";
const byte MAGIC_NUMBER[4] = { 0xFE, 0xED, 0xDA, 0xBB };


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
    const char* MT_HTML = "text/html";
    const char* MT_JPG = "image/jpeg";
}

std::map<WBlinds::datagram_t, const uint8_t> DatagramSize = {
    {WBlinds::datagram_t::Hello, 128},
    {WBlinds::datagram_t::Acknowledge, 128},
    {WBlinds::datagram_t::JoinGroup, 128},
    {WBlinds::datagram_t::LeaveGroup, 128},
    {WBlinds::datagram_t::Ping, 128},
    {WBlinds::datagram_t::Pong, 128},
    {WBlinds::datagram_t::UpdateState, 128}
};

bool forceReconnect = false;
bool wifiLock = false;
bool otaLock = false;
bool doReboot = false;
// char* deviceName[1024] = "wblinds";
String messageHead = "";
String messageSub = "";
byte optionType;
