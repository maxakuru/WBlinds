#include "state.h"
#include <FS.h>
#include <ArduinoJson.h>

State* State::instance = 0;
DynamicJsonDocument stateDoc(1024);
DynamicJsonDocument settingsDoc(1024);

// TODO: define real sizes
char deviceName[256] = "WBlinds";
char mDnsName[256] = "WBlinds";
char mqttHost[256] = "1.2.3.4";
char mqttTopic[256] = "WBlinds";

State* State::getInstance() {
    if (!instance)
        instance = new State;
    return instance;
}

bool State::isDirty() {
    return isDirty_;
}

void State::Attach(StateObserver* observer, EventFlags const& flags) {
    // observers_.push_back(observer);
    observers_.push_back(ObserverItem(observer, flags));
}
void State::Detach(StateObserver* observer) {
    // observers_.remove(observer);
    struct ObserverEquals {
        StateObserver* observer_;
        ObserverEquals(StateObserver* observer)
            : observer_(observer)         {        
}
        bool operator()(ObserverItem const& e) const {
            return (e.observer_ == observer_);
        }
    };
    observers_.erase(
        std::remove_if(observers_.begin(), observers_.end(), ObserverEquals(observer)),
        observers_.end());
}
void State::Notify(StateObserver* that, EventFlags const& flags) {
    StateEvent evt(flags);
    for (Observers::iterator i = observers_.begin(); i != observers_.end(); ++i)     {
        if (0 != (i->flags_.mask_ & flags.mask_)) {
            i->observer_->handleEvent(evt);
        }
    }
}

String State::serialize() {
    stateDoc["pos"] = data_.pos;
    stateDoc["speed"] = data_.speed;
    stateDoc["accel"] = data_.accel;

    String output;
    serializeJson(stateDoc, output);
    return output;
}

String State::serializeSettings() {
    settingsDoc["deviceName"] = settingsGeneral_.deviceName;
    settingsDoc["mdnsName"] = settingsGeneral_.mDnsName;

    settingsDoc["pStep"] = settingsHardware_.pinStep;
    settingsDoc["pDir"] = settingsHardware_.pinDir;
    settingsDoc["pEn"] = settingsHardware_.pinEn;
    settingsDoc["pSleep"] = settingsHardware_.pinSleep;
    settingsDoc["pReset"] = settingsHardware_.pinReset;
    settingsDoc["pMs1"] = settingsHardware_.pinMs1;
    settingsDoc["pMs2"] = settingsHardware_.pinMs2;
    settingsDoc["pMs3"] = settingsHardware_.pinMs3;
    settingsDoc["pHome"] = settingsHardware_.pinHomeSw;
    settingsDoc["cLen"] = settingsHardware_.cordLength;
    settingsDoc["cDia"] = settingsHardware_.cordDiameter;
    settingsDoc["axDia"] = settingsHardware_.axisDiameter;
    settingsDoc["stepsPerRev"] = settingsHardware_.stepsPerRev;

    String output;
    serializeJson(settingsDoc, output);
    return output;
}

void State::load() {
    ESP_LOGI(TAG, "LOAD STATE/SETTINGS");

    init_();

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
        setFieldsFromJSON_(nullptr, obj, false);
        data_.targetPos = data_.pos;
    }

    DeserializationError settingsError = deserializeJson(stateDoc, settingsFile.readString());
    if (settingsError) {
        // TODO: fix broken save state
    }
    else {
        JsonObject obj = stateDoc.as<JsonObject>();
        setSettingsFromJSON_(nullptr, obj, false);
    }
}

stdBlinds::error_code_t State::setSettingsFromJSON_(StateObserver* that, JsonObject& obj, bool shouldSave) {
    stdBlinds::error_code_t err = stdBlinds::error_code_t::NoError;

    if (obj.containsKey("deviceName")) {
        const char* v = obj["deviceName"];
        ESP_LOGI(TAG, "loaded name: %s", v);
        int nameLen = strlen(v) + 1;
        if (nameLen > 256) {
            err = stdBlinds::error_code_t::InvalidJson;
        }
        else {
            if (!shouldSave && 0 != strcmp(settingsGeneral_.deviceName, v)) {
                shouldSave = true;
            }
            strlcpy(settingsGeneral_.deviceName, v, nameLen + 1);
            settingsGeneral_.deviceName[nameLen + 1] = 0;
        }
    }

    if (shouldSave) {
        saveSettings();
    }

    return err;
}

stdBlinds::error_code_t State::setFieldsFromJSON_(StateObserver* that, JsonObject& obj, bool makesDirty) {
    stdBlinds::error_code_t err = stdBlinds::error_code_t::NoError;

    EventFlags flags;
    if (obj.containsKey("accel")) {
        uint32_t v = obj["accel"];
        ESP_LOGI(TAG, "loaded accel: %i", v);
        if (data_.accel != v) {
            flags.accel_ = true;
            data_.accel = v;
        }
    }
    if (obj.containsKey("speed")) {
        int32_t v = obj["speed"];
        ESP_LOGI(TAG, "loaded speed: %i", v);
        if (data_.speed != v) {
            flags.speed_ = true;
            data_.speed = v;
        }
    }
    if (obj.containsKey("pos")) {
        int32_t v = obj["pos"];
        ESP_LOGI(TAG, "loaded pos: %i", v);
        if (data_.pos != v) {
            flags.pos_ = true;
            data_.pos = v;
        }
    }
    if (obj.containsKey("tPos")) {
        int32_t v = obj["tPos"];
        ESP_LOGI(TAG, "loaded tPos: %i", v);
        if (data_.targetPos != v) {
            flags.targetPos_ = true;
            data_.targetPos = v;
        }
    }

    EventFlags toNotify;
    toNotify.pos_ = true;
    toNotify.targetPos_ = true;
    toNotify.speed_ = true;
    toNotify.accel_ = true;

    ESP_LOGI(TAG, "Should notify? (flags.mask_ & toNotify.mask_): %i", (flags.mask_ & toNotify.mask_));

    if (makesDirty && 0 != (flags.mask_ & toNotify.mask_)) {
        updateDirty_(true);
        Notify(that, flags);
    }

    return err;
}

stdBlinds::error_code_t State::loadFromObject(StateObserver* that, JsonObject& jsonObj) {
    ESP_LOGI(TAG);
    return setFieldsFromJSON_(that, jsonObj, true);
}

stdBlinds::error_code_t State::loadFromJSONString(StateObserver* that, String jsonStr) {
    DeserializationError error = deserializeJson(stateDoc, jsonStr);
    if (error) {
        return stdBlinds::error_code_t::InvalidJson;
    }

    JsonObject obj = stateDoc.as<JsonObject>();
    return setFieldsFromJSON_(that, obj, true);
}

void State::save() {
    ESP_LOGI(TAG, "SAVE STATE");
    // TODO: sanitize
    stateDoc["accel"] = data_.accel;
    stateDoc["pos"] = data_.pos;
    stateDoc["speed"] = data_.speed;
    // TODO:? save target pos

    File stateFile = SPIFFS.open("/state.json", "w");
    serializeJson(stateDoc, stateFile);
    isDirty_ = false;
}

void State::saveSettings() {
    settingsDoc["deviceName"] = settingsGeneral_.deviceName;
    File settingsFile = SPIFFS.open("/settings.json", "w");
    serializeJson(settingsDoc, settingsFile);
}

void State::init_() {
    ESP_LOGI(TAG);
    if (isInit_) return;
    if (!SPIFFS.begin(true)) {
        ESP_LOGE(TAG, "Failed to mount file system");
        return;
    }
    isInit_ = true;
}

void State::updateDirty_(bool isDirty) {
    if (!isDirty_) {
        isDirty_ = true;
    }
}

void State::setClean_() {
    isDirty_ = false;
}

// Getters
int32_t State::getPosition() {
    return data_.pos;
}
int32_t State::getTargetPosition() {
    return data_.targetPos;
}
uint32_t State::getSpeed() {
    return data_.speed;
}
uint32_t State::getAccel() {
    return data_.accel;
}
char* State::getDeviceName() {
    return settingsGeneral_.deviceName;
}
char* State::getmDnsName() {
    return settingsGeneral_.mDnsName;
}
uint8_t State::getStepPin() {
    return settingsHardware_.pinStep;
}
uint8_t State::getDirectionPin() {
    return settingsHardware_.pinDir;
}
uint8_t State::getEnablePin() {
    return settingsHardware_.pinEn;
}
uint8_t State::getSleepPin() {
    return settingsHardware_.pinSleep;
}
uint8_t State::getResetPin() {
    return settingsHardware_.pinReset;
}
uint8_t State::getMs1Pin() {
    return settingsHardware_.pinMs1;
}
uint8_t State::getMs2Pin() {
    return settingsHardware_.pinMs2;
}
uint8_t State::getMs3Pin() {
    return settingsHardware_.pinMs3;
}
uint8_t State::getHomeSwitchPin() {
    return settingsHardware_.pinHomeSw;
}
uint32_t State::getCordLength() {
    return settingsHardware_.cordLength;
}
double State::getCordDiameter() {
    return settingsHardware_.cordDiameter;
}
uint32_t State::getAxisDiameter() {
    return settingsHardware_.axisDiameter;
}
uint16_t State::getStepsPerRev() {
    return settingsHardware_.stepsPerRev;
}
stdBlinds::resolution_t State::getResolution() {
    return settingsHardware_.resolution;
}

// Setters
void State::setPosition(StateObserver* that, int32_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(data_.pos != v);
    data_.pos = v;

    EventFlags flags;
    flags.pos_ = true;
    Notify(that, flags);
}
void State::setTargetPosition(int32_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(data_.targetPos != v);
    data_.targetPos = v;
}
void State::setSpeed(uint32_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(data_.speed != v);
    data_.speed = v;
}
void State::setAccel(uint32_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(data_.accel != v);
    data_.accel = v;
}
void State::setDeviceName(char* v) {
    ESP_LOGI(TAG, "set: %s", v);
    updateDirty_(strcmp(settingsGeneral_.deviceName, v) != 0);
    settingsGeneral_.deviceName = v;
}
void State::setmDnsName(char* v) {
    ESP_LOGI(TAG, "set: %s", v);
    updateDirty_(strcmp(settingsGeneral_.mDnsName, v) != 0);
    settingsGeneral_.mDnsName = v;
}
void State::setStepPin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.pinStep != v);
    settingsHardware_.pinStep = v;
}
void State::setDirectionPin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.pinDir != v);
    settingsHardware_.pinDir = v;
}
void State::setEnablePin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.pinEn != v);
    settingsHardware_.pinEn = v;
}
void State::setSleepPin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.pinSleep != v);
    settingsHardware_.pinSleep = v;
}
void State::setResetPin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.pinReset != v);
    settingsHardware_.pinReset = v;
}
void State::setMs1Pin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.pinMs1 != v);
    settingsHardware_.pinMs1 = v;
}
void State::setMs2Pin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.pinMs2 != v);
    settingsHardware_.pinMs2 = v;
}
void State::setMs3Pin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.pinMs3 != v);
    settingsHardware_.pinMs3 = v;
}
void State::setHomeSwitchPin(uint8_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.pinHomeSw != v);
    settingsHardware_.pinHomeSw = v;
}
void State::setCordLength(uint32_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.cordLength != v);
    settingsHardware_.cordLength = v;
}
void State::setCordDiameter(double v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.cordDiameter != v);
    settingsHardware_.cordDiameter = v;
}
void State::setAxisDiameter(uint32_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.axisDiameter != v);
    settingsHardware_.axisDiameter = v;
}
void State::setStepsPerRev(uint16_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.stepsPerRev != v);
    settingsHardware_.stepsPerRev = v;
}
void State::setResolution(stdBlinds::resolution_t v) {
    ESP_LOGI(TAG, "set: %i", v);
    updateDirty_(settingsHardware_.resolution != v);
    settingsHardware_.resolution = v;
}