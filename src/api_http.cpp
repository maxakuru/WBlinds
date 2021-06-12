#include "api_http.h"

// Errors
const char* errPrefix = "{\"error\":\"";
const char* errSuffix = "\"}";
char errStr[100] = "";

AsyncWebServer server(80);

BlindsHTTPAPI::BlindsHTTPAPI(const uint16_t port) {
   ESP_LOGI(TAG, "constructor");
   // this->server = server;
   this->port = port;
}

void BlindsHTTPAPI::init(BlindsMotor* motor) {
   ESP_LOGI(TAG);
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

   // server.on("/bg.jpg", HTTP_GET,
   //    [this](AsyncWebServerRequest* request) {
   //       this->serveBackground(request);
   //    }
   // );

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

   // server.on("/settings", HTTP_GET, [this]
   // (AsyncWebServerRequest* request) {
   //       this->serveSettings(request, false);
   //    }
   // );
   // server.on("/settings", HTTP_POST,
   //    [this](AsyncWebServerRequest* request) {
   //       this->serveSettings(request, true);
   //    }
   // );

   server.onNotFound(
      [this](AsyncWebServerRequest* request) {
         this->handleNotFound(request);
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

void getSettingsJS(byte subPage, char* dest) {
   //0: menu 1: wifi 2: leds 3: ui 4: sync 5: time 6: sec
}

void BlindsHTTPAPI::serveIndex(AsyncWebServerRequest* request) {
   if (handleFileRead(request, "/index.html")) return;

   if (handleIfNoneMatchCacheHeader(request)) return;

   AsyncWebServerResponse* response = request->beginResponse_P(200, stdBlinds::MT_HTML, PAGE_index, PAGE_index_L);

   response->addHeader(F("Content-Encoding"), "gzip");
   setStaticContentCacheHeaders(response);

   request->send(response);
}

void BlindsHTTPAPI::handleNotFound(AsyncWebServerRequest* request) {
   request->send(404, stdBlinds::MT_HTML);
}

// void BlindsHTTPAPI::serveBackground(AsyncWebServerRequest* request) {
//    if (handleFileRead(request, "/bg.jpg")) return;

//    if (handleIfNoneMatchCacheHeader(request)) return;

//    AsyncWebServerResponse* response = request->beginResponse_P(200, stdBlinds::MT_JPG, IMG_background, IMG_background_L);

//    response->addHeader(F("Content-Encoding"), "gzip");
//    setStaticContentCacheHeaders(response);

//    request->send(response);
// }

void BlindsHTTPAPI::getState(AsyncWebServerRequest* request, bool fromFile) {
   if (fromFile) {
      if (!handleFileRead(request, "/state.json")) {
         return request->send(404, stdBlinds::MT_HTML, "Not found");
      }
      return request->send(500);
   };
   request->send(200, stdBlinds::MT_JSON, State::getInstance()->serialize());
}

void BlindsHTTPAPI::updateState(AsyncWebServerRequest* request, JsonVariant& json) {
   ESP_LOGI(TAG);
   JsonObject obj = json.as<JsonObject>();
   auto errCode = State::getInstance()->loadFromObject(obj);
   if (errCode == stdBlinds::error_code_t::NoError) {
      return request->send(200, stdBlinds::MT_HTML, "Ok");
   }
   char* err = errorJson(stdBlinds::ErrorMessage[errCode]);
   return request->send(400, stdBlinds::MT_JSON, err);
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
   ESP_LOGI(TAG);
   if (path.endsWith("/")) path += "index.html";
   String contentType = getContentType(request, path);
   if (SPIFFS.exists(path)) {
      ESP_LOGI(TAG, "exists");
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
   ESP_LOGI(TAG, "HTTP POST");
   if (post) {
      auto errCode = doOperation(request->arg("plain").c_str());
      if (errCode == stdBlinds::error_code_t::NoError) {
         return request->send_P(200, stdBlinds::MT_HTML, "Ok");
      }
      char* err = errorJson(stdBlinds::ErrorMessage[errCode]);
      return request->send(400, stdBlinds::MT_JSON, err);
   }
   request->beginResponse_P(200, "text/html", PAGE_index, PAGE_index_L);
}

void BlindsHTTPAPI::updateSettings(AsyncWebServerRequest* request) {
   ESP_LOGI(TAG);
   // TODO:
}

void BlindsHTTPAPI::getSettings(AsyncWebServerRequest* request) {
   ESP_LOGI(TAG);
   // TODO:
}