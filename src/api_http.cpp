#include "api_http.h"

// Media types
const char* MT_JSON = "application/json";
const char* MT_TEXT = "text/html";

// Errors
const char* errPrefix = "{\"error\":\"";
const char* errSuffix = "\"}";
char errStr[100] = "";

BlindsHTTPAPI::BlindsHTTPAPI(WebServer* server, const uint16_t port) {
   Serial.println("[BlindsHTTPAPI] constructor");
   this->server = server;
   this->port = port;
}

void BlindsHTTPAPI::init(BlindsMotor* motor) {
   Serial.println("[BlindsHTTPAPI] init");
   this->motor = motor;
   server->on("/", HTTP_POST,
      [this]() {
         this->handlePOST();
      }
   );
   server->begin(this->port);
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
   auto errCode = doOperation(server->arg("plain").c_str());
   if (errCode == stdBlinds::error_code_t::NoError) {
      return server->send(200, MT_TEXT, "Ok");
   }
   char* err = errorJson(stdBlinds::ErrorMessage[errCode]);
   server->send(400, MT_JSON, err);
}