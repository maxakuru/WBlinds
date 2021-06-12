#include "state.h"
#include <FS.h>
#include <ArduinoJson.h>

State* State::instance = 0;
DynamicJsonDocument stateDoc(1024);
DynamicJsonDocument settingsDoc(1024);

char deviceName[256] = "blinds";
char mDnsName[256] = "WBlinds";
char mqttHost[256] = "1.2.3.4";
char mqttTopic[256] = "WBlinds";

State* State::getInstance() {
    if (!instance)
        instance = new State;
    return instance;
}

bool State::isDirty() {
    return _isDirty;
}

void State::Attach(Observer* observer) {
    _observers.push_back(observer);
}
void State::Detach(Observer* observer) {
    _observers.remove(observer);
}
void State::Notify() {
    ESP_LOGI(TAG);
    std::list<Observer*>::iterator iterator = _observers.begin();
    while (iterator != _observers.end()) {
        (*iterator)->handleStateChange(data);
        ++iterator;
    }
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
    settingsDoc["deviceName"] = settingsGeneral.deviceName;
    settingsDoc["mdnsName"] = settingsGeneral.mDnsName;

    settingsDoc["pDir"] = settingsHardware.pinDir;
    settingsDoc["pEn"] = settingsHardware.pinEn;
    settingsDoc["pSleep"] = settingsHardware.pinSleep;
    settingsDoc["pReset"] = settingsHardware.pinReset;
    settingsDoc["pMs1"] = settingsHardware.pinMs1;
    settingsDoc["pMs2"] = settingsHardware.pinMs2;
    settingsDoc["pMs3"] = settingsHardware.pinMs3;
    settingsDoc["pHome"] = settingsHardware.pinHomeSw;
    settingsDoc["cLen"] = settingsHardware.cordLength;
    settingsDoc["cDia"] = settingsHardware.cordDiameter;
    settingsDoc["axDia"] = settingsHardware.axisDiameter;
    settingsDoc["stepsPerRev"] = settingsHardware.stepsPerRev;

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

stdBlinds::error_code_t State::setSettingsFromJSON(JsonObject& obj, bool shouldSave) {
    stdBlinds::error_code_t err = stdBlinds::error_code_t::NoError;

    if (obj.containsKey("deviceName")) {
        const char* v = obj["deviceName"];
        ESP_LOGI(TAG, "loaded name: %s", v);
        int nameLen = strlen(v) + 1;
        if (nameLen > 256) {
            err = stdBlinds::error_code_t::InvalidJson;
        }
        else {
            if (!shouldSave && strcmp(settingsGeneral.deviceName, v) != 0) {
                shouldSave = true;
            }
            strlcpy(settingsGeneral.deviceName, v, nameLen + 1);
            settingsGeneral.deviceName[nameLen + 1] = 0;
        }
    }

    if (shouldSave) {
        saveSettings();
    }

    return err;
}

stdBlinds::error_code_t State::setFieldsFromJSON(JsonObject& obj, bool makesDirty) {
    stdBlinds::error_code_t err = stdBlinds::error_code_t::NoError;

    if (obj.containsKey("accel")) {
        uint32_t v = obj["accel"];
        ESP_LOGI(TAG, "loaded accel: %i", v);
        updateDirty(makesDirty && data.accel != v && !_isDirty);
        data.accel = v;
    }
    if (obj.containsKey("speed")) {
        int32_t v = obj["speed"];
        ESP_LOGI(TAG, "loaded speed: %i", v);
        updateDirty(makesDirty && data.speed != v && !_isDirty);
        data.speed = v;
    }
    if (obj.containsKey("pos")) {
        int32_t v = obj["pos"];
        ESP_LOGI(TAG, "loaded pos: %i", v);
        updateDirty(makesDirty && data.pos != v && !_isDirty);
        data.pos = v;
    }
    if (obj.containsKey("tPos")) {
        int32_t v = obj["tPos"];
        ESP_LOGI(TAG, "loaded tPos: %i", v);
        updateDirty(makesDirty && data.targetPos != v && !_isDirty);
        data.targetPos = v;
    }

    this->Notify();

    return err;
}

stdBlinds::error_code_t State::loadFromObject(JsonObject& jsonObj) {
    ESP_LOGI(TAG);
    return setFieldsFromJSON(jsonObj, true);
}

stdBlinds::error_code_t State::loadFromJSONString(String jsonStr) {
    DeserializationError error = deserializeJson(stateDoc, jsonStr);
    if (error) {
        return stdBlinds::error_code_t::InvalidJson;
    }

    JsonObject obj = stateDoc.as<JsonObject>();
    return setFieldsFromJSON(obj, true);
}

void State::save() {
    ESP_LOGI(TAG);
    // TODO: sanitize
    stateDoc["accel"] = data.accel;
    stateDoc["pos"] = data.pos;
    stateDoc["speed"] = data.speed;
    // TODO:? save target pos

    File stateFile = SPIFFS.open("/state.json", "w");
    serializeJson(stateDoc, stateFile);
    _isDirty = false;
}

void State::saveSettings() {
    settingsDoc["deviceName"] = settingsGeneral.deviceName;
    File settingsFile = SPIFFS.open("/settings.json", "w");
    serializeJson(settingsDoc, settingsFile);
}

void State::init() {
   ESP_LOGI(TAG);
    if (_isInit) return;
    if (!SPIFFS.begin(true)) {
        ESP_LOGE(TAG, "Failed to mount file system");
        return;
    }
    _isInit = true;
}

void State::updateDirty(bool isDirty) {
    if (!isDirty) {
        _isDirty = true;
    }
}

void State::setClean() {
    _isDirty = false;
}

// Getters
int32_t State::getPosition() {
    return data.pos;
}
int32_t State::getTargetPosition() {
    return data.targetPos;
}
uint32_t State::getSpeed() {
    return data.speed;
}
uint32_t State::getAccel() {
    return data.accel;
}
char* State::getDeviceName() {
    return settingsGeneral.deviceName;
}
char* State::getmDnsName() {
    return settingsGeneral.mDnsName;
}
uint8_t State::getDirectionPin() {
    return settingsHardware.pinDir;
}
uint8_t State::getEnablePin() {
    return settingsHardware.pinEn;
}
uint8_t State::getSleepPin() {
    return settingsHardware.pinSleep;
}
uint8_t State::getResetPin() {
    return settingsHardware.pinReset;
}
uint8_t State::getMs1Pin() {
    return settingsHardware.pinMs1;
}
uint8_t State::getMs2Pin() {
    return settingsHardware.pinMs2;
}
uint8_t State::getMs3Pin() {
    return settingsHardware.pinMs3;
}
uint8_t State::getHomeSwitchPin() {
    return settingsHardware.pinHomeSw;
}
uint32_t State::getCordLength() {
    return settingsHardware.cordLength;
}
uint32_t State::getCordDiameter() {
    return settingsHardware.cordDiameter;
}
uint32_t State::getAxisDiameter() {
    return settingsHardware.axisDiameter;
}
uint16_t State::getStepsPerRev() {
    return settingsHardware.stepsPerRev;
}

// Setters
void State::setPosition(int32_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(data.pos != v);
    data.pos = v;
}
void State::setTargetPosition(int32_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(data.targetPos != v);
    data.targetPos = v;
}
void State::setSpeed(uint32_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(data.speed != v);
    data.speed = v;
}
void State::setAccel(uint32_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(data.accel != v);
    data.accel = v;
}
void State::setDeviceName(char* v) {
    ESP_LOGI(TAG, "set: %s", v);
    updateDirty(strcmp(settingsGeneral.deviceName, v) != 0);
    settingsGeneral.deviceName = v;
}
void State::setmDnsName(char* v) {
    ESP_LOGI(TAG, "set: %s", v);
    updateDirty(strcmp(settingsGeneral.mDnsName, v) != 0);
    settingsGeneral.deviceName = v;
}
void State::setDirectionPin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(settingsHardware.pinDir != v);
    settingsHardware.pinDir = v;
}
void State::setEnablePin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(settingsHardware.pinEn != v);
    settingsHardware.pinEn = v;
}
void State::setSleepPin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(settingsHardware.pinSleep != v);
    settingsHardware.pinSleep = v;
}
void State::setResetPin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(settingsHardware.pinReset != v);
    settingsHardware.pinReset = v;
}
void State::setMs1Pin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(settingsHardware.pinMs1 != v);
    settingsHardware.pinMs1 = v;
}
void State::setMs2Pin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(settingsHardware.pinMs2 != v);
    settingsHardware.pinMs2 = v;
}
void State::setMs3Pin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(settingsHardware.pinMs3 != v);
    settingsHardware.pinMs3 = v;
}
void State::setHomeSwitchPin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(settingsHardware.pinHomeSw != v);
    settingsHardware.pinHomeSw = v;
}
void State::setCordLength(uint32_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(settingsHardware.cordLength != v);
    settingsHardware.cordLength = v;
}
void State::setCordDiameter(uint32_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(settingsHardware.cordDiameter != v);
    settingsHardware.cordDiameter = v;
}
void State::setAxisDiameter(uint32_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(settingsHardware.cordDiameter != v);
    settingsHardware.cordDiameter = v;
}
void State::setStepsPerRev(uint16_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty(settingsHardware.stepsPerRev != v);
    settingsHardware.stepsPerRev = v;
}