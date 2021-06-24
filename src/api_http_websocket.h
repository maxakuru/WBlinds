#ifndef API_HTTP_WEBSOCKET_H_
#define API_HTTP_WEBSOCKET_H_

#include "defines.h"
#include "state.h"
#include <ESPAsyncWebServer.h>

const char delimiter = '/';

struct WSMessage {
    char* macAddress;
    EventFlags flags;
    int32_t pos;
    int32_t targetPos;
    uint32_t speed;
    uint32_t accel;
};

static String packWSMessage(const StateEvent& event) {
    auto state = State::getInstance();
    String s = "";
    s += macAddress;

    s += delimiter;
    s += event.flags_.mask_;
    s += delimiter;

    if (event.flags_.pos_) {
        s += state->getPosition();
        s += delimiter;
    }
    if (event.flags_.targetPos_) {
        s += state->getTargetPosition();
        s += delimiter;
    }
    if (event.flags_.speed_) {
        s += state->getSpeed();
        s += delimiter;
    }
    if (event.flags_.accel_) {
        s += state->getAccel();
        s += delimiter;
    }
    WLOG_I(TAG, "DG string: %s", s);
    return s;
}

static void unpackWSMessage(WSMessage& msg, char* message, size_t len) {
    WLOG_I(TAG, "(char*)message: %s (%i)", (char*)message, len);
    char d[24];
    for (int i = 0, j = 0, k = 0;i < len;i++) {
        WLOG_I(TAG, "i: %i, j: %i, k: %i", i, j, k);
        if (message[i] == delimiter) {
            d[j + 1] = 0;
            switch (k) {
            case 0: // mac address
                msg.macAddress = d;
                break;
            case 1: // flags
                msg.flags.mask_ = atoi(d);
                WLOG_I(TAG, "flags.mask %i", msg.flags.mask_);
                WLOG_I(TAG, "flags.pos %i", msg.flags.pos_);
                WLOG_I(TAG, "flags.targetPos %i", msg.flags.targetPos_);
                WLOG_I(TAG, "flags.speed %i", msg.flags.speed_);
                WLOG_I(TAG, "flags.accel %i", msg.flags.accel_);
                break;
            case 2: // pos, if exists
                msg.pos = atoi(d);
                break;
            }
            j = 0;
            k++;
            continue;
        }
        d[j] = message[i];
    }
}


static void handleWebSocketMessage(void* arg, uint8_t* data, size_t len) {
    AwsFrameInfo* info = (AwsFrameInfo*)arg;
    if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
        data[len] = 0;
        WSMessage msg;
        unpackWSMessage(msg, (char*)data, len);

    }
}

static void onEvent(AsyncWebSocket* server, AsyncWebSocketClient* client, AwsEventType type,
    void* arg, uint8_t* data, size_t len) {
    switch (type) {
    case WS_EVT_CONNECT:
        WLOG_I(TAG, "WebSocket client #%u connected from %s", client->id(), client->remoteIP().toString().c_str());
        break;
    case WS_EVT_DISCONNECT:
        WLOG_I(TAG, "WebSocket client #%u disconnected", client->id());
        break;
    case WS_EVT_DATA:
        handleWebSocketMessage(arg, data, len);
        break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
        WLOG_I(TAG, "Error: %s", (char*)data);
        break;
    }
}

// AsyncWebSocketMultiMessage datagramToWSMessage(byte* b, size_t len) {
//     auto buf = new AsyncWebSocketMessageBuffer(b, len);
//     auto m = new AsyncWebSocketMultiMessage(buf);
//     return buf;
// }

#endif // API_HTTP_WEBSOCKET_H_