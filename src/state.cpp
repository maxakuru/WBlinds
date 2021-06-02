#include "state.h"
#include <FS.h>
#include <ArduinoJson.h>

State* State::instance = 0;
DynamicJsonDocument stateDoc(1024);
DynamicJsonDocument settingsDoc(1024);

char deviceName[256] = "blinds";
char mDnsName[256] = "WBlinds";

State* State::getInstance() {
    if (!instance)
        instance = new State;
    return instance;
}

bool State::isDirty() {
    return _isDirty;
}

String State::serialize() {
    stateDoc["pos"] = data.pos;
    stateDoc["speed"] = data.speed;
    stateDoc["accel"] = data.accel;

    String output;
    serializeJson(stateDoc, output);
    return output;
}

String State::serializeSettings() {
    settingsDoc["deviceName"] = settings.deviceName;
    settingsDoc["mdnsName"] = settings.mDnsName;
    settingsDoc["pDir"] = settings.pinDir;
    settingsDoc["pEn"] = settings.pinEn;
    settingsDoc["pSleep"] = settings.pinSleep;
    settingsDoc["pReset"] = settings.pinReset;
    settingsDoc["pMs1"] = settings.pinMs1;
    settingsDoc["pMs2"] = settings.pinMs2;
    settingsDoc["pMs3"] = settings.pinMs3;
    settingsDoc["pHome"] = settings.pinHomeSw;
    settingsDoc["cLen"] = settings.cordLength;
    settingsDoc["cDia"] = settings.cordDiameter;
    settingsDoc["axDia"] = settings.axisDiameter;
    settingsDoc["stepsPerRev"] = settings.stepsPerRev;
    String output;
    serializeJson(settingsDoc, output);
    return output;
}

void State::load() {
    Serial.println("[State] load()");

    init();

    File stateFile = SPIFFS.open("/state.json", "r");
    if (!stateFile) {
        return save();
    }

    File settingsFile = SPIFFS.open("/settings.json", "r");
    if (!settingsFile) {
        return saveSettings();
    }

    DeserializationError stateError = deserializeJson(stateDoc, stateFile.readString());
    if (stateError) {
        // TODO: fix broken save state

    }
    else {
        JsonObject obj = stateDoc.as<JsonObject>();
        setFieldsFromJSON(obj, false);
    }

    DeserializationError settingsError = deserializeJson(stateDoc, stateFile.readString());
    if (settingsError) {
        // TODO: fix broken save state

    }
    else {
        JsonObject obj = stateDoc.as<JsonObject>();
        setSettingsFromJSON(obj, false);
    }
}

WBlinds::error_code_t State::setSettingsFromJSON(JsonObject& obj, bool shouldSave) {
    WBlinds::error_code_t err = WBlinds::error_code_t::NoError;

    if (obj.containsKey("deviceName")) {
        const char* v = obj["deviceName"];
        Serial.print("loaded deviceName: ");
        Serial.println(v);
        int nameLen = strlen(v) + 1;
        Serial.print("length deviceName: ");
        Serial.println(nameLen);
        if (nameLen > 256) {
            err = WBlinds::error_code_t::InvalidJson;
        }
        else {
            if (!shouldSave && strcmp(settings.deviceName, v) != 0) {
                shouldSave = true;
            }
            strlcpy(settings.deviceName, v, nameLen + 1);
            settings.deviceName[nameLen + 1] = 0;
        }
    }

    if (shouldSave) {
        saveSettings();
    }

    return err;
}

WBlinds::error_code_t State::setFieldsFromJSON(JsonObject& obj, bool makesDirty) {
    WBlinds::error_code_t err = WBlinds::error_code_t::NoError;

    if (obj.containsKey("accel")) {
        uint32_t v = obj["accel"];
        Serial.print("loaded accel: ");
        Serial.println(v);
        if (makesDirty && data.accel != v && !_isDirty) {
            _isDirty = true;
        }
        data.accel = v;
    }
    if (obj.containsKey("speed")) {
        int32_t v = obj["speed"];
        Serial.print("loaded speed: ");
        Serial.println(v);
        if (makesDirty && data.speed != v && !_isDirty) {
            _isDirty = true;
        }
        data.speed = v;
    }
    if (obj.containsKey("pos")) {
        int32_t v = obj["pos"];
        Serial.print("loaded pos: ");
        Serial.println(v);
        if (makesDirty && data.pos != v && !_isDirty) {
            _isDirty = true;
        }
        data.pos = v;
    }

    return err;
}

WBlinds::error_code_t State::loadFromObject(JsonObject& jsonObj) {
    Serial.println("[State] loadFromObject()");
    return setFieldsFromJSON(jsonObj, true);
}

WBlinds::error_code_t State::loadFromJSONString(String jsonStr) {
    DeserializationError error = deserializeJson(stateDoc, jsonStr);
    if (error) {
        return WBlinds::error_code_t::InvalidJson;
    }

    JsonObject obj = stateDoc.as<JsonObject>();
    return setFieldsFromJSON(obj, true);
}

void State::save() {
    Serial.println("[State] save()");
    // TODO: sanitize
    stateDoc["accel"] = data.accel;
    stateDoc["pos"] = data.pos;
    stateDoc["speed"] = data.speed;

    File stateFile = SPIFFS.open("/state.json", "w");
    serializeJson(stateDoc, stateFile);
    _isDirty = false;
}

void State::saveSettings() {
    settingsDoc["deviceName"] = settings.deviceName;
    File settingsFile = SPIFFS.open("/settings.json", "w");
    serializeJson(settingsDoc, settingsFile);
}

void State::init() {
    Serial.println("[State] init()");
    if (_isInit) return;
    Serial.println("[State] init() cont");
    if (!SPIFFS.begin(true)) {
        Serial.println("[State] Failed to mount file system");
        return;
    }
    _isInit = true;
}

// Getters
int32_t State::getPosition() {
    return data.pos;
}
uint32_t State::getSpeed() {
    return data.speed;
}
uint32_t State::getAccel() {
    return data.accel;
}
char* State::getDeviceName() {
    return settings.deviceName;
}
char* State::getmDnsName() {
    return settings.mDnsName;
}
uint8_t State::getDirectionPin() {
    return settings.pinDir;
}
uint8_t State::getEnablePin() {
    return settings.pinEn;
}
uint8_t State::getSleepPin() {
    return settings.pinSleep;
}
uint8_t State::getResetPin() {
    return settings.pinReset;
}
uint8_t State::getMs1Pin() {
    return settings.pinMs1;
}
uint8_t State::getMs2Pin() {
    return settings.pinMs2;
}
uint8_t State::getMs3Pin() {
    return settings.pinMs3;
}
uint8_t State::getHomeSwitchPin() {
    return settings.pinHomeSw;
}
uint32_t State::getCordLength() {
    return settings.cordLength;
}
uint32_t State::getCordDiameter() {
    return settings.cordDiameter;
}
uint32_t State::getAxisDiameter() {
    return settings.axisDiameter;
}
uint16_t State::getStepsPerRev() {
    return settings.stepsPerRev;
}

// Setters
void State::setPosition(int32_t v) {
    Serial.println("Set position");
    if (data.pos != v) {
        _isDirty = true;
    }
    data.pos = v;
}
void State::setSpeed(uint32_t v) {
    Serial.println("Set speed");
    if (data.speed != v) {
        _isDirty = true;
    }
    data.speed = v;
}
void State::setAccel(uint32_t v) {
    Serial.println("Set accel");
    if (data.accel != v) {
        _isDirty = true;
    }
    data.accel = v;
}
void State::setDeviceName(char* v) {
    Serial.println("Set devicename");
    if (strcmp(settings.deviceName, v) != 0) {
        _isDirty = true;
    }
    settings.deviceName = v;
}
void State::setmDnsName(char* v) {
    Serial.println("Set devicename");
    if (strcmp(settings.mDnsName, v) != 0) {
        _settingsDirty = true;
    }
    settings.deviceName = v;
}
void State::setDirectionPin(uint8_t v) {
    Serial.println("Set dir pin");
    if (settings.pinDir != v) {
        _settingsDirty = true;
    }
    settings.pinDir = v;
}
void State::setEnablePin(uint8_t v) {
    Serial.println("Set enable pin");
    if (settings.pinEn != v) {
        _settingsDirty = true;
    }
    settings.pinEn = v;
}
void State::setSleepPin(uint8_t v) {
    Serial.println("Set sleep pin");
    if (settings.pinSleep != v) {
        _settingsDirty = true;
    }
    settings.pinSleep = v;
}
void State::setResetPin(uint8_t v) {
    Serial.println("Set reset pin");
    if (settings.pinReset != v) {
        _settingsDirty = true;
    }
    settings.pinReset = v;
}
void State::setMs1Pin(uint8_t v) {
    Serial.println("Set ms1 pin");
    if (settings.pinMs1 != v) {
        _settingsDirty = true;
    }
    settings.pinMs1 = v;
}
void State::setMs2Pin(uint8_t v) {
    Serial.println("Set ms2 pin");
    if (settings.pinMs2 != v) {
        _settingsDirty = true;
    }
    settings.pinMs2 = v;
}
void State::setMs3Pin(uint8_t v) {
    Serial.println("Set ms3 pin");
    if (settings.pinMs3 != v) {
        _settingsDirty = true;
    }
    settings.pinMs3 = v;
}
void State::setHomeSwitchPin(uint8_t v) {
    Serial.println("Set home pin");
    if (settings.pinHomeSw != v) {
        _settingsDirty = true;
    }
    settings.pinHomeSw = v;
}
void State::setCordLength(uint32_t v) {
    Serial.println("Set cord length");
    if (settings.cordLength != v) {
        _settingsDirty = true;
    }
    settings.cordLength = v;
}
void State::setCordDiameter(uint32_t v) {
    Serial.println("Set cord diameter");
    if (settings.cordDiameter != v) {
        _settingsDirty = true;
    }
    settings.cordDiameter = v;
}
void State::setAxisDiameter(uint32_t v) {
    Serial.println("Set axis diameter");
    if (settings.cordDiameter != v) {
        _settingsDirty = true;
    }
    settings.cordDiameter = v;
}
void State::setStepsPerRev(uint16_t v) {
    Serial.println("Set steps per rev");
    if (settings.stepsPerRev != v) {
        _settingsDirty = true;
    }
    settings.stepsPerRev = v;
}