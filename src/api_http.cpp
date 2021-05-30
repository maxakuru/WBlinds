#include "api_http.h"
#include <ArduinoJson.h>

// Media types
const char* MT_JSON = "application/json";
const char* MT_TEXT = "text/html";

// Errors
const char* errPrefix = "{\"error\":\"";
const char* errSuffix = "\"}";
const char* ERR_INVALID_JSON = "Invalid json";
const char* ERR_NO_OP = "Expecting op";
const char* ERR_UNKNOWN_OP = "Unknown op";
char errStr[100] = "";

BlindsHTTPAPI::BlindsHTTPAPI(WebServer* server, const uint16_t port) {
   Serial.println("[BlindsHTTPAPI] constructor");
   this->server = server;
}

void BlindsHTTPAPI::init(BlindsMotor* motor) {
   Serial.println("[BlindsHTTPAPI] init");
   this->motor = motor;
   server->on("/", HTTP_POST,
      [this]() {
         this->handlePOST();
      }
   );
   server->begin(80);
}

void BlindsHTTPAPI::loop() {
   server->handleClient();
}

char* errorJson(const char* msg) {
   strcpy(errStr, errPrefix);
   strcat(errStr, msg);
   strcat(errStr, errSuffix);
   return errStr;
};

void BlindsHTTPAPI::handlePOST() {
   Serial.println("[BlindsHTTPAPI] HTTP POST");
   DynamicJsonDocument root(1024);
   DeserializationError error = deserializeJson(root, server->arg("plain"));
   if (error) {
      char* err = errorJson(ERR_INVALID_JSON);
      server->send(400, MT_JSON, err);
      return;
   }
   else {
      if (!root.containsKey("op")) {
         char* err = errorJson(ERR_NO_OP);
         server->send(400, MT_JSON, err);
         return;
      }
      const char* op = root["op"];
      if (strcmp(op, "run_forward") == 0) {
         this->motor->runForward();
      }
      else if (strcmp(op, "run_backward") == 0) {
         this->motor->runBackward();
      }
      else if (strcmp(op, "stop") == 0) {
         this->motor->stop();
      }
      else {
         char* err = errorJson(ERR_UNKNOWN_OP);
         server->send(400, MT_JSON, err);
         return;
      }
      server->send(200, MT_TEXT);
   }
}