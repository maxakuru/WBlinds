#ifndef API_HTTP_H_
#define API_HTTP_H_

#include "api.h"
// #include <WebServer.h>
#include <ESPAsyncWebServer.h>
#include "AsyncJson.h"

class BlindsHTTPAPI : BlindsAPI {
public:
   explicit BlindsHTTPAPI(uint16_t port);
   ~BlindsHTTPAPI() override {
      State::getInstance()->Detach(this);
   };
   void init() override;
   void handleEvent(const StateEvent& event) override;
private:
   // AsyncWebServer* server;
   uint16_t port_;
   // State& state_;

   void handlePOST();
   void serveIndex(AsyncWebServerRequest* request);
   void serveBackground(AsyncWebServerRequest* request);

   void setStaticContentCacheHeaders(AsyncWebServerResponse* response);
   bool handleIfNoneMatchCacheHeader(AsyncWebServerRequest* request);
   void handleNotFound(AsyncWebServerRequest* request);

   bool handleFileRead(AsyncWebServerRequest* request, String path);

   void getState(AsyncWebServerRequest* request, bool fromFile);
   void updateState(AsyncWebServerRequest* request, JsonVariant& json);

   void serveOps(AsyncWebServerRequest* request, bool post);

   void getSettings(AsyncWebServerRequest* request);
   void updateSettings(AsyncWebServerRequest* request);
};

#endif  // API_HTTP_H_