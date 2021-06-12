#include "wblinds.h"

void setup() {
  WBlinds::getInstance()->setup();
}

void loop() {
  WBlinds::getInstance()->loop();
}