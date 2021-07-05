#ifndef API_MQTT_H_
#define API_MQTT_H_

#ifndef DISABLE_MQTT

#include "event.h"
#include "api.h"

class BlindsMQTTAPI : BlindsAPI {
public:
   explicit BlindsMQTTAPI();
   ~BlindsMQTTAPI() override {
      State::getInstance()->Detach(this);
   };
   void handleEvent(const WBlindsEvent& event) override;
   void init() override;
   bool isInit() override;
private:
   bool isInit_ = false;
   uint8_t connectRetryCount = 0;
   char* upTopic;
   char* downTopic;
   char* stopTopic;
   char* sleepTopic;
   char* moveTopic;
   char* toSubscribe;
   void reconnect();
   char* clientId;
   // void handleMessage(const char* topic, byte* payload, uint32_t length);
   // void reconnect();
   void initTopics(const char* name);
};

#endif // DISABLE_MQTT

#endif  // API_MQTT_H_