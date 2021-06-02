#ifndef API_HTTP_H_
#define API_HTTP_H_

#include "api.h"
// #include <WebServer.h>
#include <ESPAsyncWebServer.h>
#include "AsyncJson.h"

class BlindsHTTPAPI : BlindsAPI {
public:
   explicit BlindsHTTPAPI(const uint16_t port);
   ~BlindsHTTPAPI() override {}
   void init(BlindsMotor* motor) override;
   // void loop() override;
private:
   // AsyncWebServer* server;
   uint16_t port;
   void handlePOST();
   void serveIndex(AsyncWebServerRequest* request);
   void setStaticContentCacheHeaders(AsyncWebServerResponse* response);
   bool handleIfNoneMatchCacheHeader(AsyncWebServerRequest* request);
   bool handleFileRead(AsyncWebServerRequest* request, String path);
   void getState(AsyncWebServerRequest* request, bool fromFile);
   void updateState(AsyncWebServerRequest* request, JsonVariant& json);
   void serveIndexOrWelcome(AsyncWebServerRequest* request);
   void serveSettings(AsyncWebServerRequest* request, bool post);
   void serveOps(AsyncWebServerRequest* request, bool post);
   void serveMessage(AsyncWebServerRequest* request, uint16_t code, const String& headl, const String& subl, byte optionT);
   void handleSettingsSet(AsyncWebServerRequest* request, byte subPage);
   // String msgProcessor(const String& var);
};

#endif  // API_HTTP_H_