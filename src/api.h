#ifndef API_H_
#define API_H_

#include "motor.h"
#include <ArduinoJson.h>
#include "defines.h"
#include "state.h"

class BlindsAPI: virtual protected StateObserver {

public:
    virtual ~BlindsAPI() {};
    virtual void init() = 0;
protected:
    stdBlinds::error_code_t doOperation(const char* op, byte* jsonData, uint32_t length) {
        if (length < 2) {
            return doOperation(op, nullptr);
        }

        const char* jsonStr = reinterpret_cast<const char*>(jsonData);
        DynamicJsonDocument jsonDoc(length * 2);
        DeserializationError error = deserializeJson(jsonDoc, jsonStr, length);
        if (error) {
            return stdBlinds::error_code_t::InvalidJson;
        }
        return doOperation(op, &jsonDoc);
    }
    stdBlinds::error_code_t doOperation(const char* jsonStr) {
        DynamicJsonDocument jsonDoc(1024);
        DeserializationError error = deserializeJson(jsonDoc, jsonStr);
        if (error) {
            return stdBlinds::error_code_t::InvalidJson;
        }
        if (!jsonDoc.containsKey("op")) {
            return stdBlinds::error_code_t::MissingOp;
        }
        const char* op = jsonDoc["op"];
        return doOperation(op, &jsonDoc);
    }
    stdBlinds::error_code_t doOperation(const char* op, DynamicJsonDocument* jsonDoc) {
        EventFlags flags;
        if (strcmp(op, "up") == 0) {
            flags.moveUp_ = true;
        }
        else if (strcmp(op, "down") == 0) {
            flags.moveDown_ = true;
        }
        else if (strcmp(op, "stop") == 0) {
            bool immediate = false;
            if (jsonDoc != nullptr && jsonDoc->containsKey("immediate")) {
                immediate = (*jsonDoc)["immediate"];
            }
            if(immediate){
                flags.moveStop_ = true;
                // TODO:
                // flags.moveStopImmediate_ = true;
            } else{
                flags.moveStop_ = true;
            }
        }
        else if (strcmp(op, "sleep") == 0) {
            // TODO:
            // flags.opSleep_ = true;
        }
        else if (strcmp(op, "disable") == 0) {
            // TODO:
            // flags.opDisable_ = true;
        }
        else if (strcmp(op, "move") == 0) {
            if (jsonDoc == nullptr) {
                return stdBlinds::error_code_t::InvalidJson;
            }
            auto state = State::getInstance();
            if (jsonDoc->containsKey("pos")) {
                int32_t pct = (*jsonDoc)["pos"];
                state->setTargetPosition(pct);
                flags.targetPos_ = true;

                if (jsonDoc->containsKey("speed")) {
                    int32_t speed = (*jsonDoc)["speed"];
                    state->setSpeed(speed);
                    flags.speed_ = true;
                }
                if (jsonDoc->containsKey("accel")) {
                    int32_t accel = (*jsonDoc)["accel"];
                    state->setAccel(accel);
                    flags.accel_ = true;
                }
            }
            else {
                return stdBlinds::error_code_t::MissingPos;
            }
        }
        else {
            return stdBlinds::error_code_t::UnknownOp;
        }
        return stdBlinds::error_code_t::NoError;
    }
};

#endif  // API_H_