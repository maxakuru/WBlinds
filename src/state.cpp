#include "state.h"

State* State::instance = 0;

char mqttTopic[MAX_MQTT_TOPIC_LENGTH] = "";
#ifdef MQTT_HOST
char mqttHost[MAX_MQTT_HOST_LENGTH] = MQTT_HOST;
#else
char mqttHost[MAX_MQTT_HOST_LENGTH] = "1.2.3.4";
#endif
#ifdef MQTT_USER
char mqttUser[MAX_MQTT_USER_LENGTH] = MQTT_USER;
#else
char mqttUser[MAX_MQTT_USER_LENGTH] = "user";
#endif
#ifdef MQTT_PW
char mqttPass[MAX_MQTT_PASS_LENGTH] = MQTT_PW;
#else
char mqttPass[MAX_MQTT_PASS_LENGTH] = "pass";
#endif

String uint64ToString(uint64_t input) {
  String result = "";
  uint8_t base = 10;

  do {
    char c = input % base;
    input /= base;

    if (c < 10)
      c +='0';
    else
      c += 'A' - 10;
    result = c + result;
  } while (input);
  return result;
}

State* State::getInstance() {
    if (!instance)
        instance = new State;
    return instance;
}

bool State::isDirty() {
    return isDirty_;
}
bool State::isSettingsDirty() {
    return isSettingsDirty_;
}
bool State::isConfigDirty() {
    return isConfigDirty_;
}

void State::Attach(WBlindsObserver* observer, EventFlags const& flags) {
    observers_.push_back(ObserverItem(observer, flags));
}
void State::Detach(WBlindsObserver* observer) {
    struct ObserverEquals {
        WBlindsObserver* observer_;
        ObserverEquals(WBlindsObserver* observer)
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
void State::Notify(WBlindsObserver* that, WBlindsEvent const& evt) {
    // WLOG_D(TAG, "flags: %s", uint64ToString(evt.flags_.mask_).c_str());
    for (Observers::iterator i = observers_.begin(); i != observers_.end(); ++i) {
        if (0 != (i->flags_.mask_ & evt.flags_.mask_)) {
            i->observer_->handleEvent(evt);
        }
    }
}

String State::serialize() {
    DynamicJsonDocument doc(512);
    doc["pos"] = data_.pos;
    doc["speed"] = data_.speed;
    doc["accel"] = data_.accel;

    String output;
    serializeJson(doc, output);
    return output;
}

String State::serializeSettings(setting_t settingType) {
    DynamicJsonDocument doc(512);
    String output;
    WLOG_D(TAG, "setting type: %i", settingType);

    auto genObj = doc.createNestedObject("gen");
    if (settingType == setting_t::kAll || settingType == setting_t::kGeneral) {
        genObj["ssid"] = wifiSSID;
        genObj["mac"] = macAddress;
        genObj["deviceName"] = settingsGeneral_.deviceName;
        genObj["mdnsName"] = settingsGeneral_.mDnsName;
        genObj["emitSync"] = settingsGeneral_.emitSyncData;
        genObj["isCalibrated"] = settingsGeneral_.isCalibrated;
        genObj["maxPosition"] = settingsGeneral_.maxPosition;

        if (settingType == setting_t::kGeneral) {
            serializeJson(genObj, output);
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
    DynamicJsonDocument doc(1024);

    init_();

    DeserializationError err;
    // load config, password isn't stored in state
    File file = LITTLEFS.open("/config.json", "r");
    if (file) {
        err = deserializeJson(doc, file.readString());
        if (err) {
            WLOG_E(TAG, "error deserializing config file %s", err.c_str());
        }
        else {
            JsonVariant v = doc["ssid"];
            if (!v.isNull()) {
                strcpy_P(wifiSSID, v.as<const char*>());
            }
            v = doc["pass"];
            if (!v.isNull()) {
                strcpy_P(wifiPass, v.as<const char*>());
            }
        }
    }
    file.close();

    //  file = LITTLEFS.open("/devices.json", "r");
    // if (!file) {
    //     // create devices.json
    //     DynamicJsonDocument toSave(512);
    //     file = LITTLEFS.open("/devices.json", "w");
    //     auto thisObj = toSave.createNestedObject(macAddress);
    //     thisObj["name"] = getDeviceName();
    //     serializeJson(toSave, file);
    // }
    // file.close();

    file = LITTLEFS.open("/state.json", "r");
    if (!file) {
        save();
    }
    else {
        err = deserializeJson(doc, file.readString());
        if (err) {
            WLOG_E(TAG, "error deserializing state file %s", err.c_str());
            // TODO: fix broken save state
        }
        else {
            JsonObject obj = doc.as<JsonObject>();
            setFieldsFromJSON_(nullptr, obj, false);
            data_.targetPos = data_.pos;
        }
    }
    file.close();

    file = LITTLEFS.open("/settings.json", "r");
    if (!file) {
        return saveSettings();
    }
    else {
        err = deserializeJson(doc, file.readString());
        if (err) {
            WLOG_E(TAG, "error deserializing settings file %s", err.c_str());
            // TODO: fix broken save state
        }
        else {
            JsonObject obj = doc.as<JsonObject>();
            setSettingsFromJSON_(nullptr, obj, false);
        }
    }
    file.close();
}

void State::restore() {
    LITTLEFS.remove("/settings.json");
    LITTLEFS.remove("/config.json");
    LITTLEFS.remove("/state.json");
}

stdBlinds::error_code_t State::loadFromMessage(WBlindsObserver* that, WSMessage& msg, boolean isSettings) {
    stdBlinds::error_code_t err = stdBlinds::error_code_t::NoError;

    bool makesDirty = false;
    if (msg.flags.accel_) {
        uint32_t v = msg.accel;
        WLOG_I(TAG, "loaded accel: %i", v);
        if (msg.accel != v) {
            makesDirty = true;
            data_.accel = v;
        }
    }
    if (msg.flags.speed_) {
        int32_t v = msg.speed;
        WLOG_I(TAG, "loaded speed: %i", v);
        if (data_.speed != v) {
            makesDirty = true;
            data_.speed = v;
        }
    }
    if (msg.flags.targetPos_) {
        int32_t v = msg.targetPos;
        WLOG_I(TAG, "loaded tPos: %i", v);
        if (data_.targetPos != v) {
            makesDirty = true;
            data_.targetPos = v;
        }
    }
    if (msg.flags.pos_) {
        int32_t v = msg.pos;
        WLOG_I(TAG, "loaded pos: %i", v);
        if (data_.pos != v) {
            makesDirty = true;
            data_.pos = v;
        }
    }

    EventFlags toNotify;
    toNotify.pos_ = true;
    toNotify.targetPos_ = true;
    toNotify.speed_ = true;
    toNotify.accel_ = true;

    WLOG_I(TAG, "Should notify? (flags.mask_ & toNotify.mask_): %i", (msg.flags.mask_ & toNotify.mask_));

    if (makesDirty && 0 != (msg.flags.mask_ & toNotify.mask_)) {
        updateDirty_(true);
        Notify(that, msg.flags);
    }

    return err;
}

stdBlinds::error_code_t State::setGeneralSettingsFromJSON_(const JsonObject& obj, EventFlags& flags, bool& shouldSave) {
    WLOG_I(TAG);
    JsonVariant v = obj["ssid"];
    if (!v.isNull()) {
        const char* s = v.as<const char*>();
        int len = strlen(s) + 1;
        if (len > MAX_SSID_LENGTH) {
            return stdBlinds::error_code_t::InvalidJson;
        }
        else {
            if (0 != strcmp(wifiSSID, s)) {
                // TODO: add to event flags or set reset flag here
                if (!isConfigDirty_) {
                    isConfigDirty_ = true;
                }
                strlcpy(wifiSSID, s, len + 1);
                wifiSSID[len + 1] = 0;
            }
        }
    }
    v = obj["pass"];
    if (!v.isNull()) {
        const char* s = v.as<const char*>();
        int len = strlen(s) + 1;
        if (len > MAX_PW_LENGTH) {
            return stdBlinds::error_code_t::InvalidJson;
        }
        else {
            if (0 != strcmp(wifiPass, s)) {
                // TODO: add to event flags or set reset flag here
                if (!isConfigDirty_) {
                    isConfigDirty_ = true;
                }
                strlcpy(wifiPass, s, len + 1);
                wifiPass[len + 1] = 0;
            }
        }
    }

    int prevEtag = settingsGeneral_.etag;
    v = obj["deviceName"];
    if (!v.isNull()) {
        const char* s = v.as<const char*>();
        int len = strlen(s) + 1;
        if (len > MAX_DEVICE_NAME_LENGTH) {
            return stdBlinds::error_code_t::InvalidJson;
        }
        else {
            if (0 != strcmp(settingsGeneral_.deviceName, s)) {
                flags.deviceName_ = true;
                updateGeneralDirty_(settingsGeneral_.etag == prevEtag);
                strlcpy(settingsGeneral_.deviceName, s, len + 1);
                settingsGeneral_.deviceName[len + 1] = 0;
            }
        }
    }
    v = obj["mdnsName"];
    if (!v.isNull()) {
        const char* s = v.as<const char*>();
        int len = strlen(s) + 1;
        if (len > MAX_MDNS_NAME_LENGTH) {
            return stdBlinds::error_code_t::InvalidJson;
        }
        else {
            if (0 != strcmp(settingsGeneral_.mDnsName, s)) {
                flags.mDnsName_ = true;
                updateGeneralDirty_(settingsGeneral_.etag == prevEtag);
                strlcpy(settingsGeneral_.mDnsName, s, len + 1);
                settingsGeneral_.mDnsName[len + 1] = 0;
            }
        }
    }
    v = obj["emitSync"];
    if (!v.isNull()) {
        bool b = v.as<boolean>();
        if (settingsGeneral_.emitSyncData != b) {
            flags.emitSyncData_ = true;
            updateGeneralDirty_(settingsGeneral_.etag == prevEtag);
            settingsGeneral_.emitSyncData = b;
        }
    }
    v = obj["isCalibrated"];
    if (!v.isNull()) {
        bool b = v.as<boolean>();
        if (settingsGeneral_.isCalibrated != b) {
            flags.isCalibrated_ = true;
            updateGeneralDirty_(settingsGeneral_.etag == prevEtag);
            settingsGeneral_.isCalibrated = b;
        }
    }
    v = obj["maxPosition"];
    if (!v.isNull()) {
        int32_t vi = v.as<int>();
        if (settingsGeneral_.maxPosition != vi) {
            flags.maxPosition_ = true;
            updateGeneralDirty_(settingsGeneral_.etag == prevEtag);
            settingsGeneral_.maxPosition = vi;
        }
    }
    return stdBlinds::error_code_t::NoError;
}

stdBlinds::error_code_t State::setHardwareSettingsFromJSON_(const JsonObject& obj, EventFlags& flags, bool& shouldSave) {
    int prevEtag = settingsHardware_.etag;
    JsonVariant v = obj["pStep"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        if (settingsHardware_.pinStep != i) {
            flags.pinStep_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.pinStep = i;
        }
    }
    v = obj["pDir"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        if (settingsHardware_.pinDir != i) {
            flags.pinDir_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.pinDir = i;
        }
    }
    v = obj["pEn"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        if (settingsHardware_.pinEn != i) {
            flags.pinEn_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.pinEn = i;
        }
    }
    v = obj["pSleep"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        if (settingsHardware_.pinSleep != i) {
            flags.pinSleep_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.pinSleep = i;
        }
    }
    v = obj["pReset"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        if (settingsHardware_.pinReset != i) {
            flags.pinReset_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.pinReset = i;
        }
    }
    v = obj["pMs1"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        if (settingsHardware_.pinMs1 != i) {
            flags.pinMs1_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.pinMs1 = i;
        }
    }
    v = obj["pMs2"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        if (settingsHardware_.pinMs2 != i) {
            flags.pinMs2_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.pinMs2 = i;
        }
    }
    v = obj["pMs3"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        if (settingsHardware_.pinMs3 != i) {
            flags.pinMs3_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.pinMs3 = i;
        }
    }
    v = obj["pHome"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        if (settingsHardware_.pinHomeSw != i) {
            flags.pinHomeSw_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.pinHomeSw = i;
        }
    }
    v = obj["cLen"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        if (settingsHardware_.cordLength != i) {
            flags.cordLength_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.cordLength = i;
        }
    }
    v = obj["cDia"];
    if (!v.isNull()) {
        double d = v.as<double>();
        if (settingsHardware_.cordDiameter != d) {
            flags.cordDiameter_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.cordDiameter = d;
        }
    }
    v = obj["axDia"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        if (settingsHardware_.axisDiameter != i) {
            flags.axisDiameter_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.axisDiameter = i;
        }
    }
    v = obj["stepsPerRev"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        if (settingsHardware_.stepsPerRev != i) {
            flags.stepsPerRev_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.stepsPerRev = i;
        }
    }
    v = obj["res"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        if (i != (int)stdBlinds::resolution_t::kEighth &&
            i != (int)stdBlinds::resolution_t::kFull &&
            i != (int)stdBlinds::resolution_t::kHalf &&
            i != (int)stdBlinds::resolution_t::kQuarter &&
            i != (int)stdBlinds::resolution_t::kSixteenth) {
            return stdBlinds::error_code_t::InvalidJson;
        }
        if ((int)settingsHardware_.resolution != i) {
            WLOG_I(TAG, "new resolution: %i", i);
            flags.resolution_ = true;
            updateHardwareDirty_(settingsHardware_.etag == prevEtag);
            settingsHardware_.resolution = (stdBlinds::resolution_t)i;
        }
    }
    return stdBlinds::error_code_t::NoError;
}

stdBlinds::error_code_t State::setMQTTSettingsFromJSON_(const JsonObject& obj, EventFlags& flags, bool& shouldSave) {
    int prevEtag = settingsMQTT_.etag;
    JsonVariant v = obj["enabled"];
    if (!v.isNull()) {
        bool b = v.as<boolean>();
        if (settingsMQTT_.enabled != b) {
            flags.mqttEnabled_ = true;
            updateMqttDirty_(settingsMQTT_.etag == prevEtag);
            settingsMQTT_.enabled = b;
        }
    }
    v = obj["host"];
    if (!v.isNull()) {
        const char* s = v.as<const char*>();
        int len = strlen(s) + 1;
        if (len > MAX_MQTT_HOST_LENGTH) {
            return stdBlinds::error_code_t::InvalidJson;
        }
        else {
            if (0 != strcmp(settingsMQTT_.host, s)) {
                flags.mqttHost_ = true;
                updateMqttDirty_(settingsMQTT_.etag == prevEtag);
                strlcpy(settingsMQTT_.host, s, len + 1);
                settingsMQTT_.host[len + 1] = 0;
            }
        }
    }
    v = obj["port"];
    if (!v.isNull()) {
        u_int i = v.as<unsigned int>();
        // TODO: validate port is in range
        if (settingsMQTT_.port != i) {
            flags.mqttPort_ = true;
            updateMqttDirty_(settingsMQTT_.etag == prevEtag);
            settingsMQTT_.port = i;
        }
    }
    v = obj["topic"];
    if (!v.isNull()) {
        const char* s = v.as<const char*>();
        int len = strlen(s) + 1;
        if (len > MAX_MQTT_TOPIC_LENGTH) {
            return stdBlinds::error_code_t::InvalidJson;
        }
        else {
            if (0 != strcmp(settingsMQTT_.topic, s)) {
                flags.mqttTopic_ = true;
                updateMqttDirty_(settingsMQTT_.etag == prevEtag);
                strlcpy(settingsMQTT_.topic, s, len + 1);
                settingsMQTT_.topic[len + 1] = 0;
            }
        }
    }
    v = obj["user"];
    if (!v.isNull()) {
        const char* s = v.as<const char*>();
        int len = strlen(s) + 1;
        if (len > MAX_MQTT_USER_LENGTH) {
            return stdBlinds::error_code_t::InvalidJson;
        }
        else {
            if (0 != strcmp(settingsMQTT_.user, s)) {
                flags.mqttUser_ = true;
                updateMqttDirty_(settingsMQTT_.etag == prevEtag);
                strlcpy(settingsMQTT_.user, s, len + 1);
                settingsMQTT_.user[len + 1] = 0;
                WLOG_I(TAG, "set user: %s", settingsMQTT_.user);
            }
        }
    }
    v = obj["pass"];
    if (!v.isNull()) {
        const char* s = v.as<const char*>();
        int len = strlen(s) + 1;
        if (len > MAX_MQTT_PASS_LENGTH) {
            return stdBlinds::error_code_t::InvalidJson;
        }
        else {
            if (0 != strcmp(settingsMQTT_.password, s)) {
                flags.mqttPass_ = true;
                updateMqttDirty_(settingsMQTT_.etag == prevEtag);
                strlcpy(settingsMQTT_.password, s, len + 1);
                settingsMQTT_.password[len + 1] = 0;
                WLOG_I(TAG, "set password: %s", settingsMQTT_.password);
            }
        }
    }

    return stdBlinds::error_code_t::NoError;
}

stdBlinds::error_code_t State::setSettingsFromJSON_(WBlindsObserver* that, JsonObject& obj, bool shouldSave) {
    auto err = stdBlinds::error_code_t::NoError;

    EventFlags flags;

    JsonVariant v = obj["gen"];
    if (!v.isNull()) {
        auto prev = settingsGeneral_;
        err = setGeneralSettingsFromJSON_(v.as<JsonObject>(), flags, shouldSave);
        if (err != stdBlinds::error_code_t::NoError) {
            settingsGeneral_ = prev;
            return err;
        }
    }

    v = obj["hw"];
    if (!v.isNull()) {
        auto prev = settingsHardware_;
        err = setHardwareSettingsFromJSON_(v.as<JsonObject>(), flags, shouldSave);
        if (err != stdBlinds::error_code_t::NoError) {
            settingsHardware_ = prev;
            return err;
        }
    }

    v = obj["mqtt"];
    if (!v.isNull()) {
        auto prev = settingsMQTT_;
        err = setMQTTSettingsFromJSON_(v.as<JsonObject>(), flags, shouldSave);
        if (err != stdBlinds::error_code_t::NoError) {
            settingsMQTT_ = prev;
            return err;
        }
    }

    EventFlags toNotify;
    toNotify.resolution_ = true;

    WLOG_I(TAG, "toNotify: %i", toNotify.mask_);
    WLOG_I(TAG, "flags: %i", flags.mask_);
    WLOG_I(TAG, "(flags.mask_ & toNotify.mask_): %i", (flags.mask_ & toNotify.mask_));
    if (0 != (flags.mask_ & toNotify.mask_)) {
        WLOG_I(TAG, "notifying...");
        Notify(that, WBlindsEvent(flags));
    }

    WLOG_D(TAG, "AFTER SETTINGS LOAD");
    if (isSettingsDirty_ && shouldSave) {
        WLOG_D(TAG, "SAVE SETTINGS");
        saveSettings();
    }
    if (isConfigDirty_) {
        WLOG_D(TAG, "SAVE CONFIG");
        saveConfig();
    }

    return err;
}

stdBlinds::error_code_t State::setFieldsFromJSON_(WBlindsObserver* that, JsonObject& obj, bool makesDirty) {
    stdBlinds::error_code_t err = stdBlinds::error_code_t::NoError;
    WLOG_D(TAG, "obj in: %i", obj.containsKey("speed"));
    WLOG_D(TAG, "obj.speed: %i", obj["speed"]);

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

stdBlinds::error_code_t State::loadFromObject(WBlindsObserver* that, JsonObject& jsonObj, boolean isSettings /* =false */) {
    WLOG_I(TAG);
    if (isSettings) {
        return setSettingsFromJSON_(that, jsonObj, true);
    }
    else {
        return setFieldsFromJSON_(that, jsonObj, true);
    }
}

stdBlinds::error_code_t State::loadFromJSONString(WBlindsObserver* that, String jsonStr) {
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, jsonStr);
    if (error) {
        return stdBlinds::error_code_t::InvalidJson;
    }

    JsonObject obj = doc.as<JsonObject>();
    return setFieldsFromJSON_(that, obj, true);
}

void State::save() {
    WLOG_I(TAG, "SAVE STATE");

    // TODO: decrease this size
    DynamicJsonDocument doc(512);
    File stateFile = LITTLEFS.open("/state.json", "w");
    String data = serialize();
    stateFile.print(data);
    stateFile.close();
    isDirty_ = false;
}

void State::saveSettings() {
    WLOG_I(TAG, "SAVE SETTINGS");

    // TODO: tweak this size
    DynamicJsonDocument doc(512);
    File settingsFile = LITTLEFS.open("/settings.json", "w");
    String data = serializeSettings(setting_t::kAll);
    settingsFile.print(data);
    settingsFile.close();
    isSettingsDirty_ = false;
}

void State::saveConfig() {
    WLOG_I(TAG, "SAVE CONFIG");

    // TODO: tweak this size
    DynamicJsonDocument doc(512);
    File configFile = LITTLEFS.open("/config.json", "w");
    doc["ssid"] = wifiSSID;
    doc["pass"] = wifiPass;
    serializeJson(doc, configFile);
    configFile.close();
    isConfigDirty_ = false;
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
bool State::isCalibrated() {
    return settingsGeneral_.isCalibrated;
}
int32_t State::getMaxPosition() {
    return settingsGeneral_.maxPosition;
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
void State::setPosition(WBlindsObserver* that, int32_t v) {
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
void State::setCalibrated(bool v) {
    updateGeneralDirty_(settingsGeneral_.isCalibrated != v);
    settingsGeneral_.isCalibrated = v;
}
void State::setMaxPosition(int32_t v) {
    updateGeneralDirty_(settingsGeneral_.maxPosition != v);
    settingsGeneral_.maxPosition = v;
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