#ifndef DISABLE_MQTT

#include "api_mqtt.h"
#include <AsyncMqttClient.h>


const char* upTopicSuffix = "/up";
const char* downTopicSuffix = "/down";
const char* stopTopicSuffix = "/stop";
const char* sleepTopicSuffix = "/sleep";
const char* moveTopicSuffix = "/move";

AsyncMqttClient* mqttClient;

BlindsMQTTAPI::BlindsMQTTAPI() {
   WLOG_I(TAG, "constructor");
}

void BlindsMQTTAPI::handleEvent(const StateEvent& event) {
   // TODO:
   WLOG_I(TAG, "event mask: %i", event.flags_.mask_);
}

void BlindsMQTTAPI::initTopics(const char* name) {
   size_t nameLen = strlen(name);
   char* ut = new char[nameLen + strlen(upTopicSuffix) + 1]();
   strcpy(ut, name);
   strcat(ut, upTopicSuffix);
   this->upTopic = ut;

   char* dt = new char[nameLen + strlen(downTopicSuffix) + 1]();
   strcpy(dt, name);
   strcat(dt, downTopicSuffix);
   this->downTopic = dt;

   char* st = new char[nameLen + strlen(stopTopicSuffix) + 1]();
   strcpy(st, name);
   strcat(st, stopTopicSuffix);
   this->stopTopic = st;

   char* slt = new char[nameLen + strlen(sleepTopicSuffix) + 1]();
   strcpy(slt, name);
   strcat(slt, sleepTopicSuffix);
   this->sleepTopic = slt;

   char* mt = new char[nameLen + strlen(moveTopicSuffix) + 1]();
   strcpy(mt, name);
   strcat(mt, moveTopicSuffix);
   this->moveTopic = mt;

   // Subscribe to all topics under the device name
   char* ts = new char[nameLen + 3]();
   strcpy(ts, name);
   strcat(ts, "/#");
   this->toSubscribe = ts;
}

void handleMessage(const char* topic, char* payload, AsyncMqttClientMessageProperties properties, size_t len, size_t index, size_t total) {
   WLOG_I(TAG, "Handling message: %s", topic);
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

   BlindsAPI::doOperation(part, (byte*)payload, len);
}

void onConnect(bool sessionPresent, const char* toSubscribe) {
   WLOG_I(TAG, "MQTT Connected %i", sessionPresent);
   mqttClient->subscribe(toSubscribe, 0);
}

void BlindsMQTTAPI::reconnect() {
   auto state = State::getInstance();

   if (mqttClient == nullptr) {
      mqttClient = new AsyncMqttClient();
      mqttClient->onMessage(handleMessage);
      mqttClient->onConnect(
         [this](bool sessPres) {
            onConnect(sessPres, toSubscribe);
         }
      );
   }
   if (mqttClient->connected()) return;

   IPAddress mqttIP;
   if (mqttIP.fromString(state->getMqttHost())) //see if server is IP or domain
   {
      mqttClient->setServer(mqttIP, state->getMqttPort());
   }
   else {
      mqttClient->setServer(state->getMqttHost(), state->getMqttPort());
   }

   mqttClient->setClientId(clientId);

   auto user = state->getMqttUser();
   auto pass = state->getMqttPass();
   if (user[0] && pass[0]) mqttClient->setCredentials(user, pass);

   // mqtt->setWill(statusTopic, 0, true, "offline");
   mqttClient->connect();
}

/**
 * @brief Initialize MQTT API.
 *
 */
void BlindsMQTTAPI::init() {
   if (macAddress[0]) {
      char cid[41];
      strcpy_P(cid, const_cast<char*>("WBlinds-"));
      sprintf(cid + 8, "%*s", 6, macAddress.c_str() + 6);
      this->clientId = cid;
   }
   initTopics(clientId);
   reconnect();

   auto state = State::getInstance();
   EventFlags interestingFlags;
   interestingFlags.pos_ = true;
   interestingFlags.targetPos_ = true;
   interestingFlags.speed_ = true;
   interestingFlags.accel_ = true;

   state->Attach(this, interestingFlags);
}

bool BlindsMQTTAPI::isInit() {
   return isInit_;
}

#endif // DISABLE_MQTT