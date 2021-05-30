#ifndef API_MQTT_H_
#define API_MQTT_H_

#include "api.h"
#include <PubSubClient.h>

class BlindsMQTTAPI : BlindsAPI {
public:
   explicit BlindsMQTTAPI(PubSubClient* client,
      const char* host, const uint16_t port, const char* user, const char* password, const char* name);
   ~BlindsMQTTAPI() override {}
   void init(BlindsMotor* motor) override;
   void loop() override;
private:
   uint8_t connectRetryCount = 0;
   PubSubClient* client;
   const char* user;
   const char* password;
   const char* name;
   char* forwardTopic;
   char* backwardTopic;
   char* stopTopic;
   char* sleepTopic;
   char* toSubscribe;
   void handleMessage(const char* topic, byte* payload, unsigned int length);
   void reconnect();
   void initTopics(const char* name);
};

#endif  // API_MQTT_H_