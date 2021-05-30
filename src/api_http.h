#ifndef API_HTTP_H_
#define API_HTTP_H_

#include "api.h"
#include <WebServer.h>

class BlindsHTTPAPI : BlindsAPI {
public:
   explicit BlindsHTTPAPI(WebServer* server, const uint16_t port);
   ~BlindsHTTPAPI() override {}
   void init(BlindsMotor* motor) override;
   void loop() override;
private:
   WebServer* server;
   void handlePOST();
};

#endif  // API_HTTP_H_