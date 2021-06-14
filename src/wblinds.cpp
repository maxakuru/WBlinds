#include "wblinds.h"
#include "state.h"
#include <WiFi.h>
#include "api_http.h"

#ifndef DISABLE_OTA
#include "ota_update.h"
#endif

WBlinds* WBlinds::instance = 0;

// ====== Optional =======
// =======================
// MQTT
#ifndef DISABLE_MQTT
BlindsMQTTAPI mqttAPI;
#endif

// UDP
#ifndef DISABLE_UDP_SYNC
UDPNotifier* udpNotifier;
#endif

// Native HomeKit
#ifndef DISABLE_HOMEKIT
Homekit* homekit;
#endif

// OTA Update config
#ifndef DISABLE_OTA
const uint16_t OTA_CHECK_INTERVAL = 3000; // ms
uint32_t _lastOTACheck = 0;
#endif

// ====== Configurable =======
// ===========================
// Only A4988 stepper driver supported right now
#ifdef STEPPER_A4988
MotorA4988* motor;
#endif


// ====== Required =======
// =======================
// State save interval, only occurs if state is dirty
const uint16_t STATE_SAVE_INTERVAL = 10000; // ms
uint32_t _lastStateSave = 0;

// Tick event
const uint16_t TICK_INTERVAL = 1000; // ms
uint32_t _lastTick = 0;

// Heap check
uint32_t _lastHeapCheck = 0;
uint32_t lastHeap = 0;

// State
State* state;
EventFlags tickEv;

// HTTP
BlindsHTTPAPI httpAPI;

#ifndef DISABLE_HOME_SWITCH
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
#endif

WBlinds* WBlinds::getInstance() {
  if (!instance)
    instance = new WBlinds;
  return instance;
}

void WBlinds::setup() {
  Serial.begin(115200);

  state = State::getInstance();
  tickEv.tick_ = true;

#ifndef DISABLE_HOME_SWITCH
  int hp = state->getHomeSwitchPin();
  pinMode(hp, INPUT_PULLDOWN);
  attachInterrupt(digitalPinToInterrupt(hp), onHomePinChange, CHANGE);
#endif

  // setup wifi
  // TODO: AP setup on first launch
  WiFi.begin(WIFI_SSID, WIFI_PW);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    WLOG_I(TAG, "Connecting to WiFi..");
  }
  ipAddress = WiFi.localIP().toString();
  macAddress = WiFi.macAddress();
  WLOG_I(TAG, "Connected to the WiFi network, IP: %s", ipAddress);

#ifdef STEPPER_A4988
  motor = new MotorA4988();
  motor->init();
#endif

#ifndef DISABLE_UDP_SYNC
  udpNotifier = new UDPNotifier(*state);
#endif 

#ifndef DISABLE_HOMEKIT
  homekit = new Homekit(*state);
  homekit->init();
#endif

#ifndef DISABLE_OTA
  _lastOTACheck = millis();
  OTAinit();
#endif

#ifndef DISABLE_MQTT
  mqttAPI.init();
#endif

  httpAPI.init();
  lastHeap = ESP.getFreeHeap();
}

void WBlinds::loop() {
  if (doReboot) {
    reset();
  }

  if ((millis() - TICK_INTERVAL) > _lastTick) {
    _lastTick = millis();
    state->Notify(nullptr, tickEv);
  }

  if ((millis() - STATE_SAVE_INTERVAL) > _lastStateSave) {
    _lastStateSave = millis();
    if (state != nullptr && state->isDirty()) {
      state->save();
    }
  }

#ifndef DISABLE_OTA
  if ((millis() - OTA_CHECK_INTERVAL) > _lastOTACheck) {
    _lastOTACheck = millis();
    OTAloopHandler();
  }
#endif

  if ((millis() - 5000) > _lastHeapCheck) {
    uint32_t heap = ESP.getFreeHeap();
    if (heap < 9000 && lastHeap < 9000) {
      forceReconnect = true;
    }
    lastHeap = heap;
    _lastHeapCheck = millis();
  }
}

void WBlinds::reset() {
  WLOG_I(TAG, "reset...");
  // TODO: close server, websockets, mqtt, disable motors
  if (state != nullptr)
    state->save();

#ifdef ENABLE_HOMEKIT
  homekit->~Homekit();
#endif

  ESP.restart();
}

void WBlinds::restore() {
  // TODO: close server, websockets, mqtt, disable motors
#ifdef ENABLE_HOMEKIT
  homekit->resetToFactory();
#endif

  state->save();
  ESP.restart();
}