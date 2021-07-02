#ifndef API_HTTP_WEBSOCKET_H_
#define API_HTTP_WEBSOCKET_H_

#include "defines.h"
#include "state.h"
#include <ESPAsyncWebServer.h>

#define DELIMITER '/'


static String packWSMessage(const StateEvent& event) {
    auto state = State::getInstance();
    String s = "";
    s += macAddress;

    s += DELIMITER;
    s += event.flags_.mask_;
    s += DELIMITER;

    if (event.flags_.pos_) {
        s += state->getPosition();
        s += DELIMITER;
    }
    if (event.flags_.targetPos_) {
        s += state->getTargetPosition();
        s += DELIMITER;
    }
    if (event.flags_.speed_) {
        s += state->getSpeed();
        s += DELIMITER;
    }
    if (event.flags_.accel_) {
        s += state->getAccel();
        s += DELIMITER;
    }
    WLOG_I(TAG, "DG string: %s", s);
    return s;
}

static void unpackWSMessage(WSMessage& msg, char* message, size_t len) {
    WLOG_I(TAG, "message: %s (len %i)", message, len);
    char d[24];
    bool gotPreData = false;
    for (int i = 0, j = 0, k = 0;i < len;i++) {
        if (message[i] == DELIMITER) {
            d[j] = '\0';
            WLOG_D(TAG, "Hit delimiter: %s %i %i", d, k, i);
            j = 0;
            if (!gotPreData) {
                if (k == 0) {
                    strcpy(msg.macAddress, d);
                    // if it's bound for another device, stop early
                    if (0 != strncmp(msg.macAddress, macAddress.c_str(), 12)) return;
                    memset(d, 0, sizeof(d));
                    k++;
                    continue;
                }
                else if (k == 1) {
                    k = (msg.flags.mask_ = atoi(d));
                    gotPreData = true;
                    continue;
                }
            }
            int lastSetBit = k ^ (k & (k - 1));
            switch (lastSetBit) {
            case 0:
                break;
            case 1:
                msg.pos = atoi(d);
                break;
            case 2:
                msg.targetPos = atoi(d);
                break;
            case 4:
                msg.speed = atoi(d);
                break;
            case 8:
                msg.accel = atoi(d);
                break;
            }
            k -= lastSetBit;
            continue;
        }
        d[j] = message[i];
        j++;
    }
}

static void handleWebSocketMessage(void* arg, uint8_t* data, size_t len) {
    AwsFrameInfo* info = (AwsFrameInfo*)arg;
    if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
        data[len] = '\0';
        WSMessage msg;
        unpackWSMessage(msg, (char*)data, len);
        if (msg.flags.mask_ == 0) return;
        // if it's bound for a different device, 
        // only the mac, flags, and type will have been parsed
        // TODO: forward to the other device via UDP
        if (0 != strncmp(msg.macAddress, macAddress.c_str(), 12)) return;
        // otherwise, handle the event on current device
        auto state = State::getInstance();
        state->loadFromMessage(nullptr, msg);
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