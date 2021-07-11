#ifndef STATE_H_
#define STATE_H_

#include "defines.h"
#include "event.h"

extern char mqttHost[MAX_MQTT_HOST_LENGTH];
extern char mqttTopic[MAX_MQTT_TOPIC_LENGTH];
extern char mqttUser[MAX_MQTT_USER_LENGTH];
extern char mqttPass[MAX_MQTT_PASS_LENGTH];

String uint64ToString(uint64_t input);

// TODO: move mediator off of state
class State : WBlindsMediator {
public:
    static State* instance;
    static State* getInstance();
    bool isDirty();
    bool isSettingsDirty();
    bool isConfigDirty();
    bool isCalibrated();
    void setCalibrated(bool);
    void save();
    void saveSettings();
    void saveConfig();
    void restore();

    String serialize();
    String serializeSettings(setting_t settingType);
    stdBlinds::error_code_t loadFromJSONString(WBlindsObserver* that, String jsonStr);
    stdBlinds::error_code_t loadFromObject(WBlindsObserver* that, JsonObject& jsonObj, boolean isSettings = false);
    stdBlinds::error_code_t loadFromMessage(WBlindsObserver* that, WSMessage& msg, boolean isSettings = false);


    // Observer
    void Attach(WBlindsObserver* observer, EventFlags const& flags) override;
    void Detach(WBlindsObserver* observer) override;
    void Notify(WBlindsObserver* that, WBlindsEvent const& evt) override;

    // Getters
    String getHardwareEtag();
    String getGeneralEtag();
    String getMqttEtag();
    String getAllSettingsEtag();

    int32_t getPosition();
    int32_t getTargetPosition();
    uint32_t getSpeed();
    uint32_t getAccel();
    char* getDeviceName();
    char* getmDnsName();
    int32_t getMaxPosition();


    bool getMqttEnabled();
    char* getMqttHost();
    uint16_t getMqttPort();
    char* getMqttTopic();
    char* getMqttUser();
    char* getMqttPass();

    uint8_t getStepPin();
    uint8_t getDirectionPin();
    uint8_t getEnablePin();
    uint8_t getSleepPin();
    uint8_t getResetPin();
    uint8_t getMs1Pin();
    uint8_t getMs2Pin();
    uint8_t getMs3Pin();
    uint8_t getHomeSwitchPin();
    uint32_t getCordLength();
    double getCordDiameter();
    uint32_t getAxisDiameter();
    uint16_t getStepsPerRev();
    stdBlinds::resolution_t getResolution();


    // Setters
    void setPosition(WBlindsObserver* that, int32_t v);
    void setTargetPosition(int32_t v);
    void setSpeed(uint32_t v);
    void setAccel(uint32_t v);
    void setDeviceName(char* v);
    void setmDnsName(char* v);
    void setMaxPosition(int32_t);


    // mqtt
    void setMqttEnabled(bool v);
    void setMqttHost(char* val);
    void setMqttPort(uint16_t v);
    void setMqttTopic(char* v);
    void setMqttUser(char* v);
    void setMqttPass(char* v);

    void setStepPin(uint8_t v);
    void setDirectionPin(uint8_t v);
    void setEnablePin(uint8_t v);
    void setSleepPin(uint8_t v);
    void setResetPin(uint8_t v);
    void setMs1Pin(uint8_t v);
    void setMs2Pin(uint8_t v);
    void setMs3Pin(uint8_t v);
    void setHomeSwitchPin(uint8_t v);
    void setCordLength(uint32_t v);
    void setCordDiameter(double v);
    void setAxisDiameter(uint32_t v);
    void setStepsPerRev(uint16_t v);
    void setResolution(stdBlinds::resolution_t v);

private:
    StateData data_;
    SettingsDataGeneral settingsGeneral_;
    SettingsDataHardware settingsHardware_;
    SettingsDataMQTT settingsMQTT_;
    bool isInit_;
    bool isDirty_; // state
    bool isSettingsDirty_; // settings
    bool isConfigDirty_; // config

    void load_();
    void init_();
    void updateDirty_(bool);
    // void updateSettingsDirty_(bool);
    void updateMqttDirty_(bool);
    void updateHardwareDirty_(bool);
    void updateGeneralDirty_(bool);
    // void updateSettingsEtag_();

    stdBlinds::error_code_t setFieldsFromJSON_(WBlindsObserver* that, JsonObject& obj, bool makesDirty);
    stdBlinds::error_code_t setSettingsFromJSON_(WBlindsObserver* that, JsonObject& obj, bool shouldSave);
    stdBlinds::error_code_t setGeneralSettingsFromJSON_(const JsonObject& obj, EventFlags& flags, bool& shouldSave);
    stdBlinds::error_code_t setHardwareSettingsFromJSON_(const JsonObject& obj, EventFlags& flags, bool& shouldSave);
    stdBlinds::error_code_t setMQTTSettingsFromJSON_(const JsonObject& obj, EventFlags& flags, bool& shouldSave);

    // observers
    typedef std::vector<ObserverItem> Observers;
    Observers observers_;

    State() {
        isDirty_ = false;
        isSettingsDirty_ = false;
        isInit_ = false;
        data_ = {
            pos: 0,
            targetPos : 0,
            speed : 1000,
            accel : INT32_MAX,
        };
        settingsGeneral_ = {
            deviceName: deviceName,
            mDnsName : mDnsName,
            emitSyncData : true,
            isCalibrated: false,
            maxPosition: 0
        };
        settingsHardware_ = {
            pinStep: DEFAULT_STEP_PIN,
            pinDir : DEFAULT_DIR_PIN,
            pinEn : DEFAULT_EN_PIN,
            pinSleep : DEFAULT_SLP_PIN,
            pinReset : DEFAULT_RST_PIN,
            pinMs1 : DEFAULT_MS1_PIN,
            pinMs2 : DEFAULT_MS2_PIN,
            pinMs3 : DEFAULT_MS3_PIN,
            pinHomeSw : DEFAULT_HOME_SWITCH_PIN,
            cordLength : DEFAULT_CORD_LENGTH_MM,
            cordDiameter : DEFAULT_CORD_DIAMETER_MM,
            axisDiameter : DEFAULT_AXIS_DIAMETER_MM,
            stepsPerRev : DEFAULT_STEPS_PER_REV,
            resolution : stdBlinds::resolution_t::kSixteenth
        };
        settingsMQTT_ = {
            enabled: true,
            host : mqttHost,
            port : 1883,
            topic : mqttTopic,
            user : mqttUser,
            password : mqttPass
        };
        load_();
    };
};

#endif // STATE_H_