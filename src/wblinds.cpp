#include "wblinds.h"
#include "state.h"
#include <WiFi.h>
#include "api_http.h"
#include <DNSServer.h>
#include <esp_wifi.h>

#ifndef DISABLE_OTA
#include "ota_update.h"
#endif

WBlinds* WBlinds::instance = 0;

DNSServer dnsServer;

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

// ====== Configurable =======
// ===========================
// Only A4988 stepper driver supported right now
#ifdef STEPPER_A4988
MotorA4988* motor;
#endif


// ====== Required =======
// =======================

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

// State save interval, only occurs if state is dirty
const uint16_t STATE_SAVE_INTERVAL = 30000; // ms
const uint16_t TICK_INTERVAL = 1000; // ms
const uint16_t HEAP_INTERVAL = 10000; // ms
// OTA Update config
#ifndef DISABLE_OTA
const uint16_t OTA_CHECK_INTERVAL = 10000; // ms
#endif // DISABLE_OTA

#if defined(ARDUINO_ARCH_ESP32)
void StateSaveTask(void* parameter) {
  State* state_ = (State*)parameter;
  const TickType_t delay = STATE_SAVE_INTERVAL / portTICK_PERIOD_MS;
  while (true) {
    if (state_->isDirty()) {
      ESP_LOGI(TAG, "state save task");
      state_->save();
    }
    if (state_->isSettingsDirty()) {
      ESP_LOGI(TAG, "settings save task");
      state_->saveSettings();
    }
    if (state_->isConfigDirty()) {
      ESP_LOGI(TAG, "config save task");
      state_->saveConfig();
    }
    vTaskDelay(delay);
  }
}
void TickTask(void* parameter) {
  State* state_ = (State*)parameter;
  const TickType_t delay = TICK_INTERVAL / portTICK_PERIOD_MS;
  while (true) {
    state_->Notify(nullptr, tickEv);
    vTaskDelay(delay);
  }
}
void HeapTask(void* parameter) {
  // State* state = (State*)parameter;
  const TickType_t delay = HEAP_INTERVAL / portTICK_PERIOD_MS;
  while (true) {
    uint32_t heap = ESP.getFreeHeap();
    if (heap < 9000 && lastHeap < 9000) {
      lowHeap = true;
    }
    lastHeap = heap;
    vTaskDelay(delay);
  }
}
#ifndef DISABLE_OTA
void OTATask(void* parameter) {
  // State* state = (State*)parameter;
  const TickType_t delay = OTA_CHECK_INTERVAL / portTICK_PERIOD_MS;
  while (true) {
    OTAloopHandler();
    vTaskDelay(delay);
  }
}
#endif // DISABLE_OTA
#else // ARDUINO_ARCH_ESP32
uint32_t _lastStateSave = 0;
uint32_t _lastTick = 0;
uint32_t _lastHeapCheck = 0;
#ifndef DISABLE_OTA
uint32_t _lastOTACheck = millis();
#endif // DISABLE_OTA
#endif // ESP8266

WBlinds* WBlinds::getInstance() {
  if (!instance)
    instance = new WBlinds;
  return instance;
}

void WBlinds::setup() {
  Serial.begin(115200);
  Serial.setTimeout(50);
  delay(10000);

  // These are defaults, but may be overwritten 
  // from State/config once it's loaded.
  uniqueTag(deviceName, MAX_DEVICE_NAME_LENGTH, "WBlinds");
  strcpy(mDnsName, deviceName);
  strcpy(apSSID, deviceName);
  strcpy(mqttTopic, deviceName);

  // Read config/state from FS
  // If not setup, will go to AP from initWiFi()
  state = State::getInstance();
  tickEv.tick_ = true;

  handleWiFi_();

#ifndef DISABLE_HOME_SWITCH
  int hp = state->getHomeSwitchPin();
  pinMode(hp, INPUT_PULLDOWN);
  attachInterrupt(digitalPinToInterrupt(hp), onHomePinChange, CHANGE);
#endif

#ifdef STEPPER_A4988
  motor = new MotorA4988();
  motor->init();
#endif

#ifndef DISABLE_UDP_SYNC
  udpNotifier = new UDPNotifier(*state);
#endif 

#ifndef DISABLE_HOMEKIT
  homekit = new Homekit(*state);
#endif

  lastHeap = ESP.getFreeHeap();

#if defined(ARDUINO_ARCH_ESP32)
#define STACK_SIZE 1000
#define PRIORITY configMAX_PRIORITIES
  xTaskCreate(StateSaveTask, "StateSaveTask", 2500, state, configMAX_PRIORITIES, NULL);
  xTaskCreate(TickTask, "TickTask", 2000, state, 1, NULL);
  xTaskCreate(HeapTask, "HeapTask", 1000, NULL, 1, NULL);
#ifndef DISABLE_OTA
  xTaskCreate(OTATask, "OTATask", 2000, NULL, 1, NULL);
#endif // DISABLE_OTA
#endif // ARDUINO_ARCH_ESP32
}

void WBlinds::handleWiFi_() {
  if(peersInit_){
    // already done the setup
    // but if wifi is disconnected after a while,
    // try to recover by starting AP
    return;
  }

  if (!WIFI_CONFIGURED || connFailing_) {
    // Wifi still set to default SSID
    // or connection is taking a long time
    if (!apActive_)
      initAP_();
    else
      dnsServer.processNextRequest();
    return;
  }
  else if (apActive_) {
    // disable AP
    WLOG_D(TAG, "Disable AP");
    WiFi.softAPdisconnect(true);
    WiFi.mode(WIFI_STA);
    dnsServer.stop();
    apActive_ = false;
  }
  else if (!wifiInit_) {
    // already configured wifi, waiting for connection
    WLOG_D(TAG, "Connecting to WiFi %s - %s", wifiSSID, wifiPass);
    WiFi.begin(wifiSSID, wifiPass);
    WiFi.setSleep(true);
    WiFi.setHostname(mDnsName);
    if (!httpAPI.isInit()) httpAPI.init();
    wifiInit_ = true;
  }

  // Breaks early until connected, but only init peers once
  if (peersInit_ || WiFi.status() != WL_CONNECTED) return;
  peersInit_ = true;

  ipAddress = WiFi.localIP().toString();
  macAddress = WiFi.macAddress();
  macAddress.replace(":", "");
  macAddress.toLowerCase();
  WLOG_D(TAG, "Connected to the WiFi network, IP: %s", ipAddress.c_str());

#ifndef DISABLE_OTA
  OTAinit();
#endif

#ifndef DISABLE_MQTT
  mqttAPI.init();
#endif

#ifndef DISABLE_HOMEKIT
  homekit->init();
#endif
}

void WBlinds::loop() {
  if (doRestore) {
    restore();
  }
  if (doReboot) {
    reset();
  }
  handleWiFi_();

#ifndef ARDUINO_ARCH_ESP32
  if ((millis() - TICK_INTERVAL) > _lastTick) {
    // WLOG_I(TAG, "hall read: %i", hallRead());
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

  if ((millis() - HEAP_INTERVAL) > _lastHeapCheck) {
    uint32_t heap = ESP.getFreeHeap();
    if (heap < 9000 && lastHeap < 9000) {
      lowHeap = true;
    }
    lastHeap = heap;
    _lastHeapCheck = millis();
}
#endif
}

void WBlinds::initAP_(bool resetAP) {
  WLOG_D(TAG, "Initialize AP: %s %s", apSSID, apPass);

  WiFi.softAPConfig(IPAddress(4, 3, 2, 1), IPAddress(4, 3, 2, 1), IPAddress(255, 255, 255, 0));
  WiFi.softAP(apSSID, apPass, apChannel, apHide);

  if (!apActive_) {
    if (!httpAPI.isInit())
      httpAPI.init();
    dnsServer.setErrorReplyCode(DNSReplyCode::NoError);
    dnsServer.start(53, "*", WiFi.softAPIP());
  }

  apActive_ = true;
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
  state->restore();

#ifdef ENABLE_HOMEKIT
  if (homekit != nullptr)
    homekit->resetToFactory();
#endif

  // state->save();
  ESP.restart();
}