#include "wblinds.h"
#include "udp_notifier.h"
#include "homekit.h"
#include <Arduino.h>
#include <WiFi.h>
#include "motor_a4988.h"
#include <WiFiClient.h>
#include <PubSubClient.h>
#include "api_http.h"
#include "api_mqtt.h"
#include <Credentials.h>
#include "ota_update.h"

WBlinds* WBlinds::instance = 0;

State* state;

// HTTP/MQTT config
const uint8_t httpPort = 80;
WiFiClient client;
PubSubClient mqttClient(client);

UDPNotifier* udpNotifier;
Homekit* homekit;

// OTA Update config
const uint16_t OTA_CHECK_INTERVAL = 3000; // ms
uint32_t _lastOTACheck = 0;

// State save interval, only occurs if state is dirty
const uint16_t STATE_SAVE_INTERVAL = 10000; // ms
uint32_t _lastStateSave = 0;

// Tick event
const uint16_t TICK_INTERVAL = 1000; // ms
uint32_t _lastTick = 0;

// Heap check
uint32_t _lastHeapCheck = 0;
uint32_t lastHeap = 0;

MotorA4988* motor;

BlindsHTTPAPI httpAPI(httpPort);
BlindsMQTTAPI mqttAPI(&mqttClient, MQTT_HOST, MQTT_PORT, MQTT_USER, MQTT_PW, MQTT_NAME);

int homeSwitchState = LOW;
void IRAM_ATTR onHomePinChange() {
  int sw = DEFAULT_HOME_SWITCH_PIN;
  if (state != nullptr) {
    sw = state->getHomeSwitchPin();
  }
  int newState = digitalRead(sw);
  if (newState != homeSwitchState) {
    homeSwitchState = newState;
    if (homeSwitchState == HIGH && motor != nullptr && motor->isInit()) {
      motor->setCurrentPositionAsHome();
    }
  }
}

WBlinds* WBlinds::getInstance() {
  if (!instance)
    instance = new WBlinds;
  return instance;
}

void WBlinds::setup() {
  ESP_LOGI(TAG, "Setup0");

  Serial.begin(115200);
  delay(10000);

  ESP_LOGI(TAG, "Setup1");

  state = State::getInstance();
  delay(100);
  ESP_LOGI(TAG, "Setup3");

  int hp = state->getHomeSwitchPin();
  pinMode(hp, INPUT_PULLDOWN);
  attachInterrupt(digitalPinToInterrupt(hp), onHomePinChange, CHANGE);
  ESP_LOGI(TAG, "Setup5");

  // setup wifi
  // TODO: AP setup on first launch
  WiFi.begin(WIFI_SSID, WIFI_PW);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    ESP_LOGI(TAG, "Connecting to WiFi..");
  }
  auto ip = WiFi.localIP();
  ESP_LOGI(TAG, "Connected to the WiFi network, IP: %d.%d.%d.%d", ip[0], ip[1], ip[2], ip[3]);
  ESP_LOGI(TAG, "Setup6");

  motor = new MotorA4988();
  motor->init();
  ESP_LOGI(TAG, "Setup4");

  udpNotifier = new UDPNotifier(*state);
  homekit = new Homekit(*state);
  homekit->init();

  _lastOTACheck = millis();
  OTAinit();

  // motor->setResolution(stdBlinds::resolution_t::kSixteenth);

  httpAPI.init();
  mqttAPI.init();

  lastHeap = ESP.getFreeHeap();
}

void WBlinds::loop() {
  if (doReboot) {
    reset();
  }

  mqttAPI.loop();

  if ((millis() - TICK_INTERVAL) > _lastTick) {
    _lastTick = millis();
    EventFlags tickEv;
    tickEv.tick_ = true;
    state->Notify(nullptr, tickEv);
  }
  // yield();
  if ((millis() - STATE_SAVE_INTERVAL) > _lastStateSave) {
    _lastStateSave = millis();
    if (state != nullptr && state->isDirty()) {
      state->save();
    }
  }
  // yield();
  if ((millis() - OTA_CHECK_INTERVAL) > _lastOTACheck) {
    _lastOTACheck = millis();
    OTAloopHandler();
  }
  if (millis() - _lastHeapCheck > 5000) {
    uint32_t heap = ESP.getFreeHeap();
    if (heap < 9000 && lastHeap < 9000) {
      forceReconnect = true;
    }
    lastHeap = heap;
    _lastHeapCheck = millis();
  }
}

void WBlinds::reset() {
  ESP_LOGI(TAG, "reset...");
  // TODO: close server, websockets, mqtt, disable motors
  if (state != nullptr)
    state->save();
  homekit->~Homekit();
  ESP.restart();
}

void WBlinds::restore() {
  // TODO: close server, websockets, mqtt, disable motors
  homekit->resetToFactory();
  state->save();
  ESP.restart();
}