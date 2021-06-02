#include "api_http.h"

// Errors
const char* errPrefix = "{\"error\":\"";
const char* errSuffix = "\"}";
char errStr[100] = "";

AsyncWebServer server(80);

BlindsHTTPAPI::BlindsHTTPAPI(const uint16_t port) {
   Serial.println("[BlindsHTTPAPI] constructor");
   // this->server = server;
   this->port = port;
}

void BlindsHTTPAPI::init(BlindsMotor* motor) {
   Serial.println("[BlindsHTTPAPI] init");
   this->motor = motor;
   // server->on("/", HTTP_POST,
   //    [this]() {
   //       this->handlePOST();
   //    }
   // );
   server.on("/", HTTP_GET,
      [this](AsyncWebServerRequest* request) {
         this->serveIndex(request);
      }
   );

   server.on("/state.json", HTTP_GET,
      [this](AsyncWebServerRequest* request) {
         this->getState(request, true);
      }
   );
   server.on("/state", HTTP_GET,
      [this](AsyncWebServerRequest* request) {
         this->getState(request, false);
      }
   );
   AsyncCallbackJsonWebHandler* handler = new AsyncCallbackJsonWebHandler("/state", [this](AsyncWebServerRequest* request, JsonVariant& json) {
      this->updateState(request, json);
      }
   );
   server.addHandler(handler);

   // server.on("/state", HTTP_POST,
   //    [this](AsyncWebServerRequest* request) {
   //       this->updateState(request);
   //    }
   // );

   server.on("/settings", HTTP_GET, [this]
   (AsyncWebServerRequest* request) {
         this->serveSettings(request, false);
      }
   );
   server.on("/settings", HTTP_POST,
      [this](AsyncWebServerRequest* request) {
         this->serveSettings(request, true);
      }
   );

   server.on("/welcome", HTTP_GET,
      [this](AsyncWebServerRequest* request) {
         this->serveSettings(request, false);
      }
   );

   server.begin();
   // server.begin(this->port);
}

char* errorJson(const char* msg) {
   strcpy(errStr, errPrefix);
   strcat(errStr, msg);
   strcat(errStr, errSuffix);
   return errStr;
};

String msgProcessor(const String& var) {
   if (var == "MSG") {
      String messageBody = messageHead;
      messageBody += F("</h2>");
      messageBody += messageSub;
      uint32_t optt = optionType;

      if (optt < 60) //redirect to settings after optionType seconds
      {
         messageBody += F("<script>setTimeout(RS,");
         messageBody += String(optt * 1000);
         messageBody += F(")</script>");
      }
      else if (optt < 120) //redirect back after optionType-60 seconds, unused
      {
         //messageBody += "<script>setTimeout(B," + String((optt-60)*1000) + ")</script>";
      }
      else if (optt < 180) //reload parent after optionType-120 seconds
      {
         messageBody += F("<script>setTimeout(RP,");
         messageBody += String((optt - 120) * 1000);
         messageBody += F(")</script>");
      }
      else if (optt == 253) {
         messageBody += F("<br><br><form action=/settings><button class=\"bt\" type=submit>Back</button></form>"); //button to settings
      }
      else if (optt == 254) {
         messageBody += F("<br><br><button type=\"button\" class=\"bt\" onclick=\"B()\">Back</button>");
      }
      return messageBody;
   }
   return String();
}
void getSettingsJS(byte subPage, char* dest) {
   //0: menu 1: wifi 2: leds 3: ui 4: sync 5: time 6: sec
}

String settingsProcessor(const String& var) {
   if (var == "CSS") {
      char buf[2048];
      buf[0] = 0;
      getSettingsJS(optionType, buf);
      return String(buf);
   }

#ifdef WLED_ENABLE_DMX

   if (var == "DMXMENU") {
      return String(F("<form action=/settings/dmx><button type=submit>DMX Output</button></form>"));
   }

#endif
   if (var == "SCSS") return String(FPSTR(PAGE_settingsCss));
   return String();
}

void BlindsHTTPAPI::serveIndex(AsyncWebServerRequest* request) {
   if (handleFileRead(request, "/index.htm")) return;

   if (handleIfNoneMatchCacheHeader(request)) return;

   AsyncWebServerResponse* response = request->beginResponse_P(200, "text/html", PAGE_index, PAGE_index_L);

   response->addHeader(F("Content-Encoding"), "gzip");
   setStaticContentCacheHeaders(response);

   request->send(response);
}

void BlindsHTTPAPI::getState(AsyncWebServerRequest* request, bool fromFile) {
   if (fromFile) {
      if (!handleFileRead(request, "/state.json")) {
         return request->send(404, WBlinds::MT_TEXT, "Not found");
      }
      return request->send(500);
   };
   request->send(200, WBlinds::MT_JSON, State::getInstance()->serialize());
}

void BlindsHTTPAPI::updateState(AsyncWebServerRequest* request, JsonVariant& json) {
   Serial.println("[HTTP] updateState()");
   JsonObject obj = json.as<JsonObject>();
   auto errCode = State::getInstance()->loadFromObject(obj);
   if (errCode == WBlinds::error_code_t::NoError) {
      return request->send(200, WBlinds::MT_TEXT, "Ok");
   }
   char* err = errorJson(WBlinds::ErrorMessage[errCode]);
   return request->send(400, WBlinds::MT_JSON, err);
}


void BlindsHTTPAPI::serveIndexOrWelcome(AsyncWebServerRequest* request) {
   // TODO: get showWelcomePage from state
   bool showWelcomePage = false;
   if (!showWelcomePage) {
      serveIndex(request);
   }
   else {
      serveSettings(request, false);
   }
}

String getContentType(AsyncWebServerRequest* request, String filename) {
   if (request->hasArg("download")) return "application/octet-stream";
   else if (filename.endsWith(".htm")) return "text/html";
   else if (filename.endsWith(".html")) return "text/html";
   //  else if(filename.endsWith(".css")) return "text/css";
   //  else if(filename.endsWith(".js")) return "application/javascript";
   else if (filename.endsWith(".json")) return "application/json";
   else if (filename.endsWith(".png")) return "image/png";
   //  else if(filename.endsWith(".gif")) return "image/gif";
   else if (filename.endsWith(".jpg")) return "image/jpeg";
   else if (filename.endsWith(".ico")) return "image/x-icon";
   //  else if(filename.endsWith(".xml")) return "text/xml";
   //  else if(filename.endsWith(".pdf")) return "application/x-pdf";
   //  else if(filename.endsWith(".zip")) return "application/x-zip";
   //  else if(filename.endsWith(".gz")) return "application/x-gzip";
   return "text/plain";
}

bool BlindsHTTPAPI::handleFileRead(AsyncWebServerRequest* request, String path) {
   Serial.println("[HTTP] handleFileRead()");
   if (path.endsWith("/")) path += "index.htm";
   if (path.indexOf("sec") > -1) return false;
   String contentType = getContentType(request, path);
   if (SPIFFS.exists(path)) {
      Serial.println("[HTTP] handleFileRead(), exists");
      request->send(SPIFFS, path, contentType);
      return true;
   }
   return false;
}

bool BlindsHTTPAPI::handleIfNoneMatchCacheHeader(AsyncWebServerRequest* request) {
   AsyncWebHeader* header = request->getHeader("If-None-Match");
   if (header && header->value() == String(VERSION)) {
      request->send(304);
      return true;
   }
   return false;
}

void BlindsHTTPAPI::setStaticContentCacheHeaders(AsyncWebServerResponse* response) {
   response->addHeader(F("Cache-Control"), "no-cache");
   response->addHeader(F("ETag"), String(VERSION));
}

void BlindsHTTPAPI::serveOps(AsyncWebServerRequest* request, bool post) {
   Serial.println("[BlindsHTTPAPI] HTTP POST");
   if (post) {
      auto errCode = doOperation(request->arg("plain").c_str());
      if (errCode == WBlinds::error_code_t::NoError) {
         return request->send_P(200, WBlinds::MT_TEXT, "Ok");
      }
      char* err = errorJson(WBlinds::ErrorMessage[errCode]);
      return request->send(400, WBlinds::MT_JSON, err);
   }
   request->send_P(200, "text/html", PAGE_settings_wifi, settingsProcessor);
}

void BlindsHTTPAPI::serveMessage(AsyncWebServerRequest* request, uint16_t code, const String& headl, const String& subl, byte optionT) {
   messageHead = headl;
   messageSub = subl;
   optionType = optionT;

   request->send_P(code, "text/html", PAGE_msg, msgProcessor);
}

void BlindsHTTPAPI::serveSettings(AsyncWebServerRequest* request, bool post = false) {
   byte subPage = 0;
   const String& url = request->url();
   if (url.indexOf("sett") >= 0) {
      if (url.indexOf("wifi") > 0) subPage = 1;
      else if (url.indexOf("leds") > 0) subPage = 2;
      else if (url.indexOf("ui") > 0) subPage = 3;
      else if (url.indexOf("sync") > 0) subPage = 4;
      else if (url.indexOf("time") > 0) subPage = 5;
      else if (url.indexOf("sec") > 0) subPage = 6;
      else if (url.indexOf("um") > 0) subPage = 8;
   }
   else subPage = 255; //welcome page

   if (subPage == 1 && wifiLock && otaLock) {
      serveMessage(request, 500, "Access Denied", F("Please unlock OTA in security settings!"), 254); return;
   }

   if (post) { //settings/set POST request, saving
      if (subPage != 1 || !(wifiLock && otaLock)) handleSettingsSet(request, subPage);

      char s[32];
      char s2[45] = "";

      switch (subPage) {
      case 1: strcpy_P(s, PSTR("WiFi")); strcpy_P(s2, PSTR("Please connect to the new IP (if changed)")); forceReconnect = true; break;
      case 2: strcpy_P(s, PSTR("LED")); break;
      case 3: strcpy_P(s, PSTR("UI")); break;
      case 4: strcpy_P(s, PSTR("Sync")); break;
      case 5: strcpy_P(s, PSTR("Time")); break;
      case 6: strcpy_P(s, PSTR("Security")); strcpy_P(s2, PSTR("Rebooting, please wait ~10 seconds...")); break;
      case 7: strcpy_P(s, PSTR("DMX")); break;
      case 8: strcpy_P(s, PSTR("Usermods")); break;
      }

      strcat_P(s, PSTR(" settings saved."));
      if (!s2[0]) strcpy_P(s2, PSTR("Redirecting..."));

      if (!doReboot) serveMessage(request, 200, s, s2, (subPage == 1 || subPage == 6) ? 129 : 1);
      if (subPage == 6) doReboot = true;

      return;
   }

#ifdef WLED_DISABLE_MOBILE_UI //disable welcome page if not enough storage
   if (subPage == 255) { serveIndex(request); return; }
#endif

   optionType = subPage;

   switch (subPage) {
   case 1:   request->send_P(200, "text/html", PAGE_settings_wifi, settingsProcessor); break;
   case 2:   request->send_P(200, "text/html", PAGE_settings_leds, settingsProcessor); break;
   case 3:   request->send_P(200, "text/html", PAGE_settings_ui, settingsProcessor); break;
   case 5:   request->send_P(200, "text/html", PAGE_settings_time, settingsProcessor); break;
   case 6:   request->send_P(200, "text/html", PAGE_settings_sec, settingsProcessor); break;
   case 7:   request->send_P(200, "text/html", PAGE_settings_dmx, settingsProcessor); break;
   case 8:   request->send_P(200, "text/html", PAGE_settings_um, settingsProcessor); break;
   case 255: request->send_P(200, "text/html", PAGE_welcome); break;
   default:  request->send_P(200, "text/html", PAGE_settings, settingsProcessor);
   }
}


void BlindsHTTPAPI::handleSettingsSet(AsyncWebServerRequest* request, byte subPage) {
   Serial.println("[HTTP] handleSettingsSet()");
   //0: menu 1: wifi 2: leds 3: ui 4: sync 5: time 6: sec 7: DMX 8: usermods
   if (subPage < 1 || subPage >8) return;
}