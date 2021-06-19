#ifndef STATE_H_
#define STATE_H_

#include "defines.h"

extern char mqttHost[MAX_MQTT_HOST_LENGTH];
extern char mqttTopic[MAX_MQTT_TOPIC_LENGTH];
extern char mqttUser[MAX_MQTT_USER_LENGTH];
extern char mqttPass[MAX_MQTT_PASS_LENGTH];


class EventFlags {
public:
    EventFlags()
        : mask_(0) {
    }
    union {
        struct {
            unsigned int pos_ : 1;
            unsigned int targetPos_ : 1;
            unsigned int speed_ : 1;
            unsigned int accel_ : 1;

            unsigned int deviceName_ : 1;
            unsigned int mDnsName_ : 1;
            unsigned int emitSyncData_ : 1;

            unsigned int pinStep_ : 1;
            unsigned int pinDir_ : 1;
            unsigned int pinEn_ : 1;
            unsigned int pinSleep_ : 1;
            unsigned int pinReset_ : 1;
            unsigned int pinMs1_ : 1;
            unsigned int pinMs2_ : 1;
            unsigned int pinMs3_ : 1;
            unsigned int pinHomeSw_ : 1;
            unsigned int cordLength_ : 1;
            unsigned int cordDiameter_ : 1;
            unsigned int axisDiameter_ : 1;
            unsigned int stepsPerRev_ : 1;
            unsigned int resolution_ : 1;

            unsigned int mqttEnabled_ : 1;
            unsigned int mqttHost_ : 1;
            unsigned int mqttPort_ : 1;
            unsigned int mqttTopic_ : 1;

            unsigned int moveUp_ : 1;
            unsigned int moveDown_ : 1;
            unsigned int moveStop_ : 1;

            unsigned int tick_ : 1;
        };
        unsigned int mask_;
    };
};

enum class setting_t {
    kAll = 0,
    kGeneral = 1,
    kHardware = 2,
    kMqtt = 3,
};

struct StateData {
    int32_t pos;
    int32_t targetPos;
    uint32_t speed;
    uint32_t accel;
};

struct SettingsDataGeneral {
    char* deviceName;
    char* mDnsName;
    bool emitSyncData;
    int etag;
};

struct SettingsDataHardware {
    uint8_t pinStep;
    uint8_t pinDir;
    uint8_t pinEn;
    uint8_t pinSleep;
    uint8_t pinReset;
    uint8_t pinMs1;
    uint8_t pinMs2;
    uint8_t pinMs3;
    uint8_t pinHomeSw;
    uint32_t cordLength;
    double cordDiameter;
    uint32_t axisDiameter;
    uint16_t stepsPerRev;
    stdBlinds::resolution_t resolution;
    int etag;
};

struct SettingsDataMQTT {
    bool enabled;
    char* host;
    uint16_t port;
    char* topic;
    char* user;
    char* password;
    int etag;
};

class StateEvent {
public:
    StateEvent(EventFlags const& flags) :
        flags_(flags) {
    }
    EventFlags flags_;
};

class StateObserver {
public:
    virtual ~StateObserver() {};
    virtual void handleEvent(const StateEvent& event) = 0;
};

class ObserverItem {
public:
    ObserverItem()
        : observer_(0) {
    }
    ObserverItem(StateObserver* observer, EventFlags const& flags)
        : observer_(observer)
        , flags_(flags) {
    }

    StateObserver* observer_;
    EventFlags flags_;
};

class Mediator {
public:
    virtual ~Mediator() {};
    virtual void Attach(StateObserver* observer, EventFlags const& flags) = 0;
    virtual void Detach(StateObserver* observer) = 0;
    virtual void Notify(StateObserver* that, EventFlags const& flags) = 0;
};

class State : Mediator {
public:
    static State* instance;
    static State* getInstance();
    bool isDirty();
    void save();
    void saveSettings();
    String serialize();
    String serializeSettings(setting_t settingType);
    stdBlinds::error_code_t loadFromJSONString(StateObserver* that, String jsonStr);
    stdBlinds::error_code_t loadFromObject(StateObserver* that, JsonObject& jsonObj, boolean isSettings = false);

    // Observer
    void Attach(StateObserver* observer, EventFlags const& flags) override;
    void Detach(StateObserver* observer) override;
    void Notify(StateObserver* that, EventFlags const& flags) override;

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
    void setPosition(StateObserver* that, int32_t v);
    void setTargetPosition(int32_t v);
    void setSpeed(uint32_t v);
    void setAccel(uint32_t v);
    void setDeviceName(char* v);
    void setmDnsName(char* v);

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

    void load_();
    void init_();
    void updateDirty_(bool);
    // void updateSettingsDirty_(bool);
    void updateMqttDirty_(bool);
    void updateHardwareDirty_(bool);
    void updateGeneralDirty_(bool);
    // void updateSettingsEtag_();

    stdBlinds::error_code_t setFieldsFromJSON_(StateObserver* that, JsonObject& obj, bool makesDirty);
    stdBlinds::error_code_t setSettingsFromJSON_(StateObserver* that, JsonObject& obj, bool shouldSave);
    stdBlinds::error_code_t setGeneralSettingsFromJSON_(const JsonObject& obj, bool& shouldSave);
    stdBlinds::error_code_t setHardwareSettingsFromJSON_(const JsonObject& obj, bool& shouldSave);
    stdBlinds::error_code_t setMQTTSettingsFromJSON_(const JsonObject& obj, bool& shouldSave);

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
            emitSyncData : true
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