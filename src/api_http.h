#ifndef API_HTTP_H_
#define API_HTTP_H_

#include "api.h"
// #include <WebServer.h>
// #include "api_http_websocket.h"

class BlindsHTTPAPI : BlindsAPI {
public:
   explicit BlindsHTTPAPI();
   ~BlindsHTTPAPI() override;
   void init() override;
   void handleEvent(const StateEvent& event) override;
private:
   // void handlePOST();
   // void serveIndex(AsyncWebServerRequest* request);
   // void serveBackground(AsyncWebServerRequest* request);

   // void setStaticContentCacheHeaders(AsyncWebServerResponse* response);
   // bool handleIfNoneMatchCacheHeader(AsyncWebServerRequest* request);
   // void handleNotFound(AsyncWebServerRequest* request);

   // bool handleFileRead(AsyncWebServerRequest* request, String path);

   // void getState(AsyncWebServerRequest* request, bool fromFile);
   // void updateState(AsyncWebServerRequest* request, JsonVariant& json);

   // void serveOps(AsyncWebServerRequest* request, bool post);

   // void getSettings(AsyncWebServerRequest* request);
   // void updateSettings(AsyncWebServerRequest* request);
};

#endif  // API_HTTP_H_