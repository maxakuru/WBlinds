#include <Arduino.h>
#include <WiFi.h>
#include "motor_a4988.h"
#include "OTAUpdate.h"
// #include <WebServer.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include "api_http.h"
#include "api_mqtt.h"
#include <Credentials.h>
#include "state.h"
#include "defines.h"
#include "udp_notifier.h"

// Pin config
#define DIR_PIN 18
#define STEP_PIN 19
#define SLP_PIN 21
#define EN_PIN 23
#define RST_PIN 3
#define MS1_PIN 1
#define MS2_PIN 5
#define MS3_PIN 17
#define HOME_SWITCH_PIN 4 // microswitch pin for homing

// Dimensions
#define CORD_LENGTH_MM 1651
#define CORD_DIAMETER_MM 0.1
#define AXIS_DIAMETER_MM 15
#define STEPS_PER_REV 200

// HTTP/MQTT config
const uint8_t httpPort = 80;
// WebServer server;
WiFiClient client;
PubSubClient mqttClient(client);

UDPNotifier* udpNotifier;

// OTA Update config
const uint16_t OTA_CHECK_INTERVAL = 3000; // ms
uint32_t _lastOTACheck = 0;

// State save interval, only occurs if state is dirty
const uint16_t STATE_SAVE_INTERVAL = 10000; // ms
uint32_t _lastStateSave = 0;

// Heap check
uint32_t _lastHeapCheck = 0;
uint32_t lastHeap = 0;

MotorA4988 motor(STEP_PIN, DIR_PIN, EN_PIN, SLP_PIN, RST_PIN, MS1_PIN, MS2_PIN, MS3_PIN, CORD_LENGTH_MM, CORD_DIAMETER_MM, AXIS_DIAMETER_MM, STEPS_PER_REV);

BlindsHTTPAPI httpAPI(httpPort);
// BlindsHTTPAPI httpAPI(&server, httpPort);

BlindsMQTTAPI mqttAPI(&mqttClient, MQTT_HOST, MQTT_PORT, MQTT_USER, MQTT_PW, MQTT_NAME);

State* state;

int homeSwitchState = LOW;
void IRAM_ATTR onHomePinChange() {
  int newState = digitalRead(HOME_SWITCH_PIN);
  if (newState != homeSwitchState) {
    homeSwitchState = newState;
    if (homeSwitchState == HIGH && motor.isInit()) {
      motor.setCurrentPositionAsHome();
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("Setup...");

  pinMode(HOME_SWITCH_PIN, INPUT_PULLDOWN);
  attachInterrupt(digitalPinToInterrupt(HOME_SWITCH_PIN), onHomePinChange, CHANGE);

  motor.init();
  motor.setResolution(WBlinds::resolution_t::kSixteenth);
  motor.stepper->setSpeedInHz(1000); // the parameter is us/step
  motor.stepper->setAcceleration(INT32_MAX);

  // setup wifi
  WiFi.begin(WIFI_SSID, WIFI_PW);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  Serial.print("Connected to the WiFi network, IP: ");
  Serial.println(WiFi.localIP());

  state = State::getInstance();
  udpNotifier = new UDPNotifier(*state);

  _lastOTACheck = millis();
  OTAinit();

  motor.setResolution(WBlinds::resolution_t::kSixteenth);

  httpAPI.init(&motor);
  mqttAPI.init(&motor);

  lastHeap = ESP.getFreeHeap();
}

void loop() {
  // httpAPI.loop();
  mqttAPI.loop();
  if ((millis() - STATE_SAVE_INTERVAL) > _lastStateSave) {
    _lastStateSave = millis();
    if (state != nullptr && state->isDirty()) {
      state->save();
    }
  }
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
  if (doReboot) {
    // reset();
  }
}