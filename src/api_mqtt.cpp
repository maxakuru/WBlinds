#include "api_mqtt.h"
#include <ArduinoJson.h>

const char* forwardTopicSuffix = "/forward";
const char* backwardTopicSuffix = "/backward";
const char* stopTopicSuffix = "/stop";
const char* sleepTopicSuffix = "/sleep";


BlindsMQTTAPI::BlindsMQTTAPI(
   PubSubClient* client,
   const char* host,
   const uint16_t port,
   const char* user,
   const char* password,
   const char* name
) {
   Serial.println("[BlindsMQTTAPI] constructor");

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
   char* ft = new char[strlen(name) + strlen(forwardTopicSuffix) + 1]();
   strcpy(ft, name);
   strcat(ft, forwardTopicSuffix);
   this->forwardTopic = ft;

   char* bt = new char[strlen(name) + strlen(backwardTopicSuffix) + 1]();
   strcpy(bt, name);
   strcat(bt, backwardTopicSuffix);
   this->backwardTopic = bt;

   char* st = new char[strlen(name) + strlen(stopTopicSuffix) + 1]();
   strcpy(st, name);
   strcat(st, stopTopicSuffix);
   this->stopTopic = st;

   char* slt = new char[strlen(name) + strlen(sleepTopicSuffix) + 1]();
   strcpy(slt, name);
   strcat(slt, sleepTopicSuffix);
   this->sleepTopic = slt;

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
   Serial.println("[BlindsMQTTAPI] init");
   this->motor = motor;
}

/**
 * @brief Handle an MQTT message.
 *
 * @param topic
 * @param payload
 * @param length
 */
void BlindsMQTTAPI::handleMessage(const char* topic, byte* payload, unsigned int length) {
   Serial.print("[BlindsMQTTAPI] Handling message: '");
   Serial.print(topic);
   Serial.print("' with payload: ");
   for (int i = 0; i < length; i++) {
      Serial.print((char)payload[i]);
   }
   Serial.println();

   if (strcmp(topic, stopTopic) == 0) {
      this->motor->stop();
   }
   else if (strcmp(topic, forwardTopic) == 0) {
      this->motor->runForward();
   }
   else if (strcmp(topic, backwardTopic) == 0) {
      this->motor->runBackward();
   }
   else if (strcmp(topic, sleepTopic) == 0) {
      bool state = false;
      if (length > 0) {
         state = true;
      }
      this->motor->setSleep(state);
   }
}

void BlindsMQTTAPI::loop() {
   if (!client->connected()) {
      reconnect();
   }
   client->loop();
}

void BlindsMQTTAPI::reconnect() {
   while (!client->connected()) {
      Serial.print("[BlindsMQTTAPI] Connecting...");
      if (client->connect(name, user, password)) {
         connectRetryCount = 0;
         Serial.println(" Connected.");
         client->subscribe(toSubscribe);
      }
      else {
         connectRetryCount = std::min(connectRetryCount + 1, UINT8_MAX);
         auto d = std::max(5000 * connectRetryCount, 1000);
         Serial.print(" Failed. state=");
         Serial.print(client->state());
         Serial.print(" trying again in ");
         Serial.print(d / 1000);
         Serial.println(" seconds.");
         delay(d);
      }
   }
}