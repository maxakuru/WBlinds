#include "state.h"

State* State::instance = 0;
DynamicJsonDocument stateDoc(512);
DynamicJsonDocument settingsDoc(512);

// TODO: define real sizes
char deviceName[64] = "WBlinds";
char mDnsName[64] = "WBlinds";
char mqttTopic[128] = "WBlinds";
#ifdef MQTT_HOST
char mqttHost[128] = MQTT_HOST;
#else
char mqttHost[128] = "1.2.3.4";
#endif
#ifdef MQTT_USER
char mqttUser[41] = MQTT_USER;
#else
char mqttUser[41] = "user";
#endif
#ifdef MQTT_PW
char mqttPass[41] = MQTT_PW;
#else
char mqttPass[41] = "pass";
#endif

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
            : observer_(observer) {
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
    for (Observers::iterator i = observers_.begin(); i != observers_.end(); ++i) {
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

String State::serializeSettings(setting_t settingType) {
    DynamicJsonDocument doc(512);
    String output;

    if (settingType == setting_t::kAll || settingType == setting_t::kGeneral) {
        doc["deviceName"] = settingsGeneral_.deviceName;
        doc["mdnsName"] = settingsGeneral_.mDnsName;
        doc["emitSync"] = settingsGeneral_.emitSyncData;
        if (settingType == setting_t::kGeneral) {
            serializeJson(doc, output);
            return output;
        }
    }

    auto hwObj = doc.createNestedObject("hw");
    if (settingType == setting_t::kAll || settingType == setting_t::kHardware) {
        hwObj["pStep"] = settingsHardware_.pinStep;
        hwObj["pDir"] = settingsHardware_.pinDir;
        hwObj["pEn"] = settingsHardware_.pinEn;
        hwObj["pSleep"] = settingsHardware_.pinSleep;
        hwObj["pReset"] = settingsHardware_.pinReset;
        hwObj["pMs1"] = settingsHardware_.pinMs1;
        hwObj["pMs2"] = settingsHardware_.pinMs2;
        hwObj["pMs3"] = settingsHardware_.pinMs3;
        hwObj["pHome"] = settingsHardware_.pinHomeSw;
        hwObj["cLen"] = settingsHardware_.cordLength;
        hwObj["cDia"] = settingsHardware_.cordDiameter;
        hwObj["axDia"] = settingsHardware_.axisDiameter;
        hwObj["stepsPerRev"] = settingsHardware_.stepsPerRev;
        hwObj["res"] = (int)settingsHardware_.resolution;
        if (settingType == setting_t::kHardware) {
            serializeJson(hwObj, output);
            return output;
        }
    }

    auto mqttObj = doc.createNestedObject("mqtt");
    if (settingType == setting_t::kAll || settingType == setting_t::kMqtt) {
        mqttObj["enabled"] = settingsMQTT_.enabled;
        mqttObj["host"] = settingsMQTT_.host;
        mqttObj["port"] = settingsMQTT_.port;
        mqttObj["topic"] = settingsMQTT_.topic;
        mqttObj["user"] = settingsMQTT_.user;
        if (settingType == setting_t::kMqtt) {
            serializeJson(mqttObj, output);
            return output;
        }
    }

    serializeJson(doc, output);
    return output;
}

void State::load_() {
    WLOG_I(TAG, "LOAD STATE/SETTINGS");

    init_();

    File stateFile = LITTLEFS.open("/state.json", "r");
    if (!stateFile) {
        return save();
    }

    File settingsFile = LITTLEFS.open("/settings.json", "r");
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
        WLOG_I(TAG, "loaded name: %s", v);
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
        WLOG_I(TAG, "loaded accel: %i", v);
        if (data_.accel != v) {
            flags.accel_ = true;
            data_.accel = v;
        }
    }
    if (obj.containsKey("speed")) {
        int32_t v = obj["speed"];
        WLOG_I(TAG, "loaded speed: %i", v);
        if (data_.speed != v) {
            flags.speed_ = true;
            data_.speed = v;
        }
    }
    if (obj.containsKey("pos")) {
        int32_t v = obj["pos"];
        WLOG_I(TAG, "loaded pos: %i", v);
        if (data_.pos != v) {
            flags.pos_ = true;
            data_.pos = v;
        }
    }
    if (obj.containsKey("tPos")) {
        int32_t v = obj["tPos"];
        WLOG_I(TAG, "loaded tPos: %i", v);
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

    WLOG_I(TAG, "Should notify? (flags.mask_ & toNotify.mask_): %i", (flags.mask_ & toNotify.mask_));

    if (makesDirty && 0 != (flags.mask_ & toNotify.mask_)) {
        updateDirty_(true);
        Notify(that, flags);
    }

    return err;
}

stdBlinds::error_code_t State::loadFromObject(StateObserver* that, JsonObject& jsonObj) {
    WLOG_I(TAG);
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
    WLOG_I(TAG, "SAVE STATE");
    // TODO: sanitize
    stateDoc["accel"] = data_.accel;
    stateDoc["pos"] = data_.pos;
    stateDoc["speed"] = data_.speed;
    // TODO:? save target pos

    File stateFile = LITTLEFS.open("/state.json", "w");
    serializeJson(stateDoc, stateFile);
    isDirty_ = false;
}

void State::saveSettings() {
    settingsDoc["deviceName"] = settingsGeneral_.deviceName;
    File settingsFile = LITTLEFS.open("/settings.json", "w");
    serializeJson(settingsDoc, settingsFile);
    isSettingsDirty_ = false;
}

void State::init_() {
    WLOG_I(TAG);
    if (isInit_) return;
    if (!LITTLEFS.begin(true)) {
        WLOG_E(TAG, "Failed to mount file system");
        return;
    }
    isInit_ = true;
}

void State::updateDirty_(bool isDirty) {
    if (isDirty) {
        isDirty_ = true;
    }
}

void State::updateGeneralDirty_(bool isDirty) {
    if (isDirty) {
        isSettingsDirty_ = true;
        settingsGeneral_.etag += 1;
    }
}

void State::updateMqttDirty_(bool isDirty) {
    if (isDirty) {
        isSettingsDirty_ = true;
        settingsMQTT_.etag += 1;
    }
}

void State::updateHardwareDirty_(bool isDirty) {
    if (isDirty) {
        isSettingsDirty_ = true;
        settingsHardware_.etag += 1;
    }
}

// Getters
String State::getHardwareEtag() {
    return String(settingsHardware_.etag);
}
String State::getGeneralEtag() {
    return String(settingsGeneral_.etag);
}
String State::getMqttEtag() {
    return String(settingsMQTT_.etag);
}
String State::getAllSettingsEtag() {
    return getHardwareEtag() + String("-") + getGeneralEtag() + String("-") + getMqttEtag();
}

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

bool State::getMqttEnabled() {
    return settingsMQTT_.enabled;
}
char* State::getMqttHost() {
    return settingsMQTT_.host;
}
uint16_t State::getMqttPort() {
    return settingsMQTT_.port;
}
char* State::getMqttTopic() {
    return settingsMQTT_.topic;
}
char* State::getMqttUser() {
    return settingsMQTT_.user;
}
char* State::getMqttPass() {
    return settingsMQTT_.password;
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
    updateDirty_(data_.pos != v);
    data_.pos = v;

    EventFlags flags;
    flags.pos_ = true;
    Notify(that, flags);
}
void State::setTargetPosition(int32_t v) {
    updateDirty_(data_.targetPos != v);
    data_.targetPos = v;
}
void State::setSpeed(uint32_t v) {
    updateDirty_(data_.speed != v);
    data_.speed = v;
}
void State::setAccel(uint32_t v) {
    updateDirty_(data_.accel != v);
    data_.accel = v;
}

void State::setDeviceName(char* v) {
    updateGeneralDirty_(strcmp(settingsGeneral_.deviceName, v) != 0);
    settingsGeneral_.deviceName = v;
}
void State::setmDnsName(char* v) {
    updateGeneralDirty_(strcmp(settingsGeneral_.mDnsName, v) != 0);
    settingsGeneral_.mDnsName = v;
}

void State::setMqttEnabled(bool v) {
    updateMqttDirty_(settingsMQTT_.enabled != v);
    settingsMQTT_.enabled = v;
}
void State::setMqttHost(char* v) {
    updateMqttDirty_(strcmp(settingsMQTT_.host, v) != 0);
    settingsMQTT_.host = v;
}
void State::setMqttPort(uint16_t v) {
    updateMqttDirty_(settingsMQTT_.port != v);
    settingsMQTT_.port = v;
}
void State::setMqttTopic(char* v) {
    updateMqttDirty_(strcmp(settingsMQTT_.topic, v) != 0);
    settingsMQTT_.topic = v;
}
void State::setMqttUser(char* v) {
    updateMqttDirty_(strcmp(settingsMQTT_.user, v) != 0);
    settingsMQTT_.user = v;
}
void State::setMqttPass(char* v) {
    updateMqttDirty_(strcmp(settingsMQTT_.password, v) != 0);
    settingsMQTT_.password = v;
}

void State::setStepPin(uint8_t v) {
    updateHardwareDirty_(settingsHardware_.pinStep != v);
    settingsHardware_.pinStep = v;
}
void State::setDirectionPin(uint8_t v) {
    updateHardwareDirty_(settingsHardware_.pinDir != v);
    settingsHardware_.pinDir = v;
}
void State::setEnablePin(uint8_t v) {
    updateHardwareDirty_(settingsHardware_.pinEn != v);
    settingsHardware_.pinEn = v;
}
void State::setSleepPin(uint8_t v) {
    updateHardwareDirty_(settingsHardware_.pinSleep != v);
    settingsHardware_.pinSleep = v;
}
void State::setResetPin(uint8_t v) {
    updateHardwareDirty_(settingsHardware_.pinReset != v);
    settingsHardware_.pinReset = v;
}
void State::setMs1Pin(uint8_t v) {
    updateHardwareDirty_(settingsHardware_.pinMs1 != v);
    settingsHardware_.pinMs1 = v;
}
void State::setMs2Pin(uint8_t v) {
    updateHardwareDirty_(settingsHardware_.pinMs2 != v);
    settingsHardware_.pinMs2 = v;
}
void State::setMs3Pin(uint8_t v) {
    updateHardwareDirty_(settingsHardware_.pinMs3 != v);
    settingsHardware_.pinMs3 = v;
}
void State::setHomeSwitchPin(uint8_t v) {
    updateHardwareDirty_(settingsHardware_.pinHomeSw != v);
    settingsHardware_.pinHomeSw = v;
}
void State::setCordLength(uint32_t v) {
    updateHardwareDirty_(settingsHardware_.cordLength != v);
    settingsHardware_.cordLength = v;
}
void State::setCordDiameter(double v) {
    updateHardwareDirty_(settingsHardware_.cordDiameter != v);
    settingsHardware_.cordDiameter = v;
}
void State::setAxisDiameter(uint32_t v) {
    updateHardwareDirty_(settingsHardware_.axisDiameter != v);
    settingsHardware_.axisDiameter = v;
}
void State::setStepsPerRev(uint16_t v) {
    updateHardwareDirty_(settingsHardware_.stepsPerRev != v);
    settingsHardware_.stepsPerRev = v;
}
void State::setResolution(stdBlinds::resolution_t v) {
    updateHardwareDirty_(settingsHardware_.resolution != v);
    settingsHardware_.resolution = v;
}