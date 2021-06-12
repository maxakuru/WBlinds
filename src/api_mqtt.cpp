#include "api_mqtt.h"
#include <ArduinoJson.h>

const char* upTopicSuffix = "/up";
const char* downTopicSuffix = "/down";
const char* stopTopicSuffix = "/stop";
const char* sleepTopicSuffix = "/sleep";
const char* moveTopicSuffix = "/move";

BlindsMQTTAPI::BlindsMQTTAPI(
   PubSubClient* client,
   const char* host,
   const uint16_t port,
   const char* user,
   const char* password,
   const char* name
) {
   ESP_LOGI(TAG, "constructor");

   this->client = client;
   this->name = name;

   initTopics(name);

   client->setServer(host, 1883);
   client->setCallback(
      [this](const char* topic, byte* payload, unsigned int length) {
         this->handleMessage(topic, payload, length);
      }
   );

   this->user = user;
   this->password = password;
}

void BlindsMQTTAPI::initTopics(const char* name) {
   char* ut = new char[strlen(name) + strlen(upTopicSuffix) + 1]();
   strcpy(ut, name);
   strcat(ut, upTopicSuffix);
   this->upTopic = ut;

   char* dt = new char[strlen(name) + strlen(downTopicSuffix) + 1]();
   strcpy(dt, name);
   strcat(dt, downTopicSuffix);
   this->downTopic = dt;

   char* st = new char[strlen(name) + strlen(stopTopicSuffix) + 1]();
   strcpy(st, name);
   strcat(st, stopTopicSuffix);
   this->stopTopic = st;

   char* slt = new char[strlen(name) + strlen(sleepTopicSuffix) + 1]();
   strcpy(slt, name);
   strcat(slt, sleepTopicSuffix);
   this->sleepTopic = slt;

   char* mt = new char[strlen(name) + strlen(moveTopicSuffix) + 1]();
   strcpy(mt, name);
   strcat(mt, moveTopicSuffix);
   this->moveTopic = mt;

   // Subscribe to all topics under the device name
   char* ts = new char[strlen(name) + 3]();
   strcpy(ts, name);
   strcat(ts, "/#");
   this->toSubscribe = ts;
}

/**
 * @brief Initialize MQTT API.
 *
 * @param motor
 */
void BlindsMQTTAPI::init(BlindsMotor* motor) {
   ESP_LOGI(TAG, "init");
   this->motor = motor;
}

/**
 * @brief Handle an MQTT message.
 *
 * @param topic
 * @param payload
 * @param length
 */
void BlindsMQTTAPI::handleMessage(const char* topic, byte* payload, uint32_t length) {
   ESP_LOGI(TAG, "Handling message: %s", topic);
   int tLen = strlen(topic);
   int afterSlash = 0;
   for (int i = tLen; i >= 0; i--) {
      if (topic[i] == '/') {
         afterSlash = i + 1;
         break;
      }
   }

   int partLen = tLen - afterSlash;
   char part[partLen];
   memcpy(part, topic + afterSlash, partLen);
   part[partLen] = 0;

   doOperation(part, payload, length);
}

void BlindsMQTTAPI::loop() {
   if (!client->connected()) {
      reconnect();
   }
   client->loop();
}

void BlindsMQTTAPI::reconnect() {
   while (!client->connected()) {
      ESP_LOGI(TAG, "Connecting...");
      if (client->connect(name, user, password)) {
         connectRetryCount = 0;
         ESP_LOGI(" Connected.");
         client->subscribe(toSubscribe);
      }
      else {
         connectRetryCount = std::min(connectRetryCount + 1, UINT8_MAX);
         auto d = std::max(5000 * connectRetryCount, 1000);
         ESP_LOGE(TAG, " Failed. state=%i trying again in %i seconds.", client->state(), d / 1000);
         delay(d);
      }
   }
}