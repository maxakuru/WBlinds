#ifndef EVENT_H_
#define EVENT_H_

#include "defines.h"

class EventFlags {
public:
    EventFlags()
        : mask_(0) {
    }
    union {
        struct {
            unsigned int pos_ : 1; // pct
            unsigned int targetPos_ : 1; // pct
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
            unsigned int mqttUser_ : 1;
            unsigned int mqttPass_ : 1;

            unsigned int moveUp_ : 1;
            unsigned int moveDown_ : 1;
            unsigned int moveStop_ : 1;
            unsigned int moveBySteps_ : 1;

            unsigned int tick_ : 1;
        };
        unsigned long mask_;
    };
};

/**
 * WS message type
 */
enum class wsmessage_t {
    kState = 0,
    kSetting = 1,
    kCalibration = 2
};

/**
 * Event data structs
 */
struct CalibrationData {
    int32_t moveBySteps; // steps
};

struct WSMessage {
    char macAddress[13];
    EventFlags flags;
    wsmessage_t type;

    // state
    int32_t pos; // pct
    int32_t targetPos; // pct
    uint32_t speed;
    uint32_t accel;

    // no settings for now

    CalibrationData* calibration; 
};

struct StateData {
    int32_t pos;
    int32_t targetPos;
    uint32_t speed;
    uint32_t accel;
};

/**
 * Setting type
 */
enum class setting_t {
    kAll = 0,
    kGeneral = 1,
    kHardware = 2,
    kMqtt = 3,
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

struct EventData {
    CalibrationData* calibData;
    StateData* stateData;
    SettingsDataGeneral* genData;
    SettingsDataHardware* hwData;
    SettingsDataMQTT* mqttData;
};

class WBlindsEvent {
public:
    WBlindsEvent(EventFlags const& flags, EventData* data) :
        flags_(flags), data_(data) {
    }
    WBlindsEvent(EventFlags const& flags) :
        flags_(flags), data_(nullptr) {
    }
    EventFlags flags_;
    // This ends up being passed as a reference to a local variable
    // but everything is handled by the time the calling function's
    // scope ends, so it's fine.
    // If Notify changes in the future to be asynchronous 
    // or batching etc., that won't work.
    EventData* data_;
};

class WBlindsObserver {
public:
    virtual ~WBlindsObserver() {};
    virtual void handleEvent(const WBlindsEvent& event) = 0;
};

class ObserverItem {
public:
    ObserverItem()
        : observer_(0) {
    }
    ObserverItem(WBlindsObserver* observer, EventFlags const& flags)
        : observer_(observer)
        , flags_(flags) {
    }

    WBlindsObserver* observer_;
    EventFlags flags_;
};

class WBlindsMediator {
public:
    virtual ~WBlindsMediator() {};
    virtual void Attach(WBlindsObserver* observer, EventFlags const& flags) = 0;
    virtual void Detach(WBlindsObserver* observer) = 0;
    virtual void Notify(WBlindsObserver* that, WBlindsEvent const& evt) = 0;
};

#endif // EVENT_H_