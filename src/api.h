#ifndef API_H_
#define API_H_

#include "motor.h"
#include <ArduinoJson.h>
#include "defines.h"
#include "state.h"

class BlindsAPI {

public:
    virtual ~BlindsAPI() {}
    virtual void init(BlindsMotor* motor) = 0;
    // virtual void loop() = 0;
protected:
    BlindsMotor* motor;
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
        if (strcmp(op, "up") == 0) {
            this->motor->runUp();
        }
        else if (strcmp(op, "down") == 0) {
            this->motor->runDown();
        }
        else if (strcmp(op, "stop") == 0) {
            bool immediate = false;
            if (jsonDoc != nullptr && jsonDoc->containsKey("immediate")) {
                immediate = (*jsonDoc)["immediate"];
            }
            this->motor->stop(immediate);
        }
        else if (strcmp(op, "sleep") == 0) {
            this->motor->setSleep(true);
        }
        else if (strcmp(op, "disable") == 0) {
            this->motor->setEnabled(false);
        }
        else if (strcmp(op, "move") == 0) {
            if (jsonDoc == nullptr) {
                return stdBlinds::error_code_t::InvalidJson;
            }
            if (jsonDoc->containsKey("pos")) {
                int32_t pct = (*jsonDoc)["pos"];
                bool hasSpeed = jsonDoc->containsKey("speed");
                bool hasAccel = jsonDoc->containsKey("accel");

                if (hasSpeed && hasAccel) {
                    int32_t speed = (*jsonDoc)["speed"];
                    int32_t accel = (*jsonDoc)["accel"];
                    this->motor->moveToPercent(pct, speed, accel);

                }
                else if (hasSpeed) {
                    int32_t speed = (*jsonDoc)["speed"];
                    this->motor->moveToPercent(pct, speed);
                }
                else {
                    this->motor->moveToPercent(pct);
                }
            }
            else if (jsonDoc->containsKey("step")) {
                uint8_t pos = (*jsonDoc)["step"];
                bool hasSpeed = jsonDoc->containsKey("speed");
                bool hasAccel = jsonDoc->containsKey("accel");

                if (hasSpeed && hasAccel) {
                    int32_t speed = (*jsonDoc)["speed"];
                    int32_t accel = (*jsonDoc)["accel"];
                    this->motor->moveTo(pos, speed, accel);
                }
                else if (hasSpeed) {
                    int32_t speed = (*jsonDoc)["speed"];
                    this->motor->moveTo(pos, speed);
                }
                else {
                    this->motor->moveTo(pos);
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