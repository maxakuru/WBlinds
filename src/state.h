#ifndef STATE_H_
#define STATE_H_

#include <Arduino.h>
#include <type_traits>
#include "SPIFFS.h"
#include <ArduinoJson.h>
#include "defines.h"
#include <list>

extern DynamicJsonDocument stateDoc;
extern DynamicJsonDocument settingsDoc;
extern char deviceName[256];
extern char mDnsName[256];
extern char mqttHost[256];
extern char mqttTopic[256];

struct StateData {
    int32_t pos;
    int32_t targetPos;
    uint32_t speed;
    uint32_t accel;
};

struct SettingsDataGeneral {
    char* deviceName;
    char* mDnsName;
    uint8_t pinDir;
    bool emitSyncData;
};

struct SettingsDataHardware {
    uint8_t pinDir;
    uint8_t pinEn;
    uint8_t pinSleep;
    uint8_t pinReset;
    uint8_t pinMs1;
    uint8_t pinMs2;
    uint8_t pinMs3;
    uint8_t pinHomeSw;
    uint32_t cordLength;
    uint32_t cordDiameter;
    uint32_t axisDiameter;
    uint16_t stepsPerRev;
};

struct SettingsDataMQTT {
    bool enabled;
    char* host;
    uint16_t port;
    char* topic;
};

class Observer {
 public:
  virtual ~Observer(){};
  virtual void handleStateChange(const StateData &newState) = 0;
};

class Subject {
 public:
  virtual ~Subject(){};
  virtual void Attach(Observer *observer) = 0;
  virtual void Detach(Observer *observer) = 0;
  virtual void Notify() = 0;
};

class State : Subject {
public:
    static State* instance;
    static State* getInstance();
    bool isDirty();
    void load();
    void save();
    void saveSettings();
    String serialize();
    String serializeSettings();
    stdBlinds::error_code_t loadFromJSONString(String jsonStr);
    stdBlinds::error_code_t loadFromObject(JsonObject& jsonObj);

    // Observer
    void Attach(Observer* observer) override;
    void Detach(Observer* observer) override;
    void Notify() override;

    // Getters
    int32_t getPosition();
    int32_t getTargetPosition();
    uint32_t getSpeed();
    uint32_t getAccel();
    char* getDeviceName();
    char* getmDnsName();
    uint8_t getDirectionPin();
    uint8_t getEnablePin();
    uint8_t getSleepPin();
    uint8_t getResetPin();
    uint8_t getMs1Pin();
    uint8_t getMs2Pin();
    uint8_t getMs3Pin();
    uint8_t getHomeSwitchPin();
    uint32_t getCordLength();
    uint32_t getCordDiameter();
    uint32_t getAxisDiameter();
    uint16_t getStepsPerRev();

    // Setters
    void setPosition(int32_t v);
    void setTargetPosition(int32_t v);
    void setSpeed(uint32_t v);
    void setAccel(uint32_t v);
    void setDeviceName(char* v);
    void setmDnsName(char* v);
    void setDirectionPin(uint8_t v);
    void setEnablePin(uint8_t v);
    void setSleepPin(uint8_t v);
    void setResetPin(uint8_t v);
    void setMs1Pin(uint8_t v);
    void setMs2Pin(uint8_t v);
    void setMs3Pin(uint8_t v);
    void setHomeSwitchPin(uint8_t v);
    void setCordLength(uint32_t v);
    void setCordDiameter(uint32_t v);
    void setAxisDiameter(uint32_t v);
    void setStepsPerRev(uint16_t v);
private:
    StateData data;
    SettingsDataGeneral settingsGeneral;
    SettingsDataHardware settingsHardware;
    SettingsDataMQTT settingsMQTT;

    void init();
    void updateDirty(bool);
    void setClean();
    bool _isInit;
    bool _isDirty;
    bool _settingsDirty;
    stdBlinds::error_code_t setFieldsFromJSON(JsonObject& obj, bool makesDirty);
    stdBlinds::error_code_t setSettingsFromJSON(JsonObject& obj, bool shouldSave);

    // observers
    std::list<Observer*> _observers;

    State() {
        _isDirty = false;
        _settingsDirty = false;
        _isInit = false;
        data = {
            pos: 0,
            targetPos: 0,
            speed : 1000,
            accel : INT32_MAX,
        };
        settingsGeneral = {
            deviceName: deviceName,
            mDnsName : mDnsName,
        };
        settingsHardware = {
            pinDir: 0,
            pinEn : 1,
            pinSleep : 0,
            pinReset : 0,
            pinMs1 : 0,
            pinMs2 : 0,
            pinMs3 : 0,
            pinHomeSw : 0,
            cordLength : 0,
            cordDiameter : 0,
            axisDiameter : 0,
            stepsPerRev : 0
        };
        settingsMQTT = {
            enabled: true,
            host : mqttHost,
            port : 1883,
            topic : mqttTopic
        };
        load();
    };
};

#endif // STATE_H_