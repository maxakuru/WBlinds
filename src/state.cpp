#include "state.h"
#include <FS.h>
#include <ArduinoJson.h>
#include "SPIFFS.h"

State* State::instance = 0;


State* State::getInstance() {
    if (!instance)
        instance = new State;
    return instance;
}

// bool State::thresholdElapsed() {

// }

// bool State::shouldSave() {
//     return isDirty() && thresholdElapsed();
// }

bool State::isDirty() {
    return _isDirty;
}

void State::load() {
    Serial.println("[State] load()");

    init();

    File stateFile = SPIFFS.open("/state.json", "r");
    if (!stateFile) {
        return save();
    }

    DynamicJsonDocument json(1024);
    DeserializationError error = deserializeJson(json, stateFile.readString());
    if (error) {
        return;
    }

    if (json.containsKey("accel")) {
        uint32_t v = json["accel"];
        Serial.print("loaded accel: ");
        Serial.println(v);
        data.accel = v;
    }
    if (json.containsKey("speed")) {
        int32_t v = json["speed"];
        Serial.print("loaded speed: ");
        Serial.println(v);
        data.speed = v;
    }
    if (json.containsKey("pos")) {
        int32_t v = json["pos"];
        Serial.print("loaded pos: ");
        Serial.println(v);
        data.pos = v;
    }
}

void State::save() {
    Serial.println("[State] save()");
    DynamicJsonDocument json(1024);
    // TODO: sanitize
    Serial.println("[State] new state: ");
    Serial.print("accel: ");
    Serial.print(data.accel);

    Serial.print(", pos: ");
    Serial.print(data.pos);

    Serial.print(", speed: ");
    Serial.print(data.speed);

    json["accel"] = data.accel;
    json["pos"] = data.pos;
    json["speed"] = data.speed;
    File stateFile = SPIFFS.open("/state.json", "w");
    serializeJson(json, stateFile);
    _isDirty = false;
}

void State::init() {
    Serial.println("[State] init()");
    if (_isInit) return;
    Serial.println("[State] init() cont");
    if (!SPIFFS.begin()) {
        Serial.println("[State] Failed to mount file system");
        return;
    }
    _isInit = true;
}