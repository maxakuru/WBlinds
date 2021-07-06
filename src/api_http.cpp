#include "api_http.h"
#include "defines.h"
#include "datagram.h"
#include "api_http_websocket.h"
#define ASYNCWEBSERVER_REGEX 1
#include <ESPAsyncWebServer.h>

// Errors
const char* errPrefix = "{\"error\":\"";
const char* valPrefix = "{\"val\":\"";
const char* jsonSuffix = "\"}";
char errStr[50] = "";
char valStr[50] = "";

enum class CacheMode {
   // No caching at all
   // Cache-Control: no-store
   // Use for: always changing responses
   kNone = 0,

   // Revalidate with etag on each request
   // Cache-Control: no-cache
   // Used for: index.html, since it embeds device info into window.
   kRevalidate = 1,

   // Short term cache, 1 day, revalidate afterwards
   // Cache-Control: max-age=86400, must-revalidate
   kShortTerm = 2,

   // Long term cache, 1 year
   // Cache-Control: public, max-age=31536000, immutable
   // Used for: Assets & static js (gzipped) with version in path.
   //           Favicon with no version. This will be served from
   //           cache with no conditional request. 
   kLongTerm = 3,

   // Throttle requests by setting a cache time for that action and no revalidate.
   // Cache-Control: private, max-age=X, immutable
   // Used for: Actions that cause some expensive action on the ESP,
   //           or data that will likely be the same because it's 
   //           updated on an interval AND that isn't important enough
   //           to store and update Etags.
   //           
   //           Rather than storing data and taking up heap, assume clients will be well behaved 
   //           and that usually a single web client is served at a time.
   kSoftThrottle = 4,
};

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

BlindsHTTPAPI::BlindsHTTPAPI() {
   WLOG_I(TAG);
}

BlindsHTTPAPI::~BlindsHTTPAPI() {
   State::getInstance()->Detach(this);
   ws.cleanupClients();
};


bool isIp(String str) {
   for (size_t i = 0; i < str.length(); i++) {
      int c = str.charAt(i);
      if (c != '.' && (c < '0' || c > '9')) {
         return false;
      }
   }
   return true;
}

bool captivePortal(AsyncWebServerRequest* request) {
   if (ON_STA_FILTER(request)) return false; // only serve captive in AP mode
   if (!request->hasHeader("Host")) return false;
   String host = request->getHeader("Host")->value();

   if (!isIp(host) && host.indexOf(mDnsName) < 0) {
      AsyncWebServerResponse* response = request->beginResponse(302);
      response->addHeader(F("Location"), F("http://4.3.2.1/settings?tab=general"));
      request->send(response);
      return true;
   }
   return false;
}

bool configRedirect(AsyncWebServerRequest* request) {
   WLOG_D(TAG, "ON_STA_FILTER(request): %i", ON_STA_FILTER(request));

   if (ON_STA_FILTER(request)) return false; // only redirect in AP mode
   const String& url = request->url();
   if (!WIFI_CONFIGURED && url.indexOf("/settings") < 0 && url.indexOf("tab=gen") < 0) {
      request->redirect("/settings?tab=gen");
      request->send(302);
      return true;
   }
   return false;
}

void BlindsHTTPAPI::handleEvent(const WBlindsEvent& event) {
   String m = packWSMessage(event, wsmessage_t::kState);
   WLOG_I(TAG, "DG message: %s", m.c_str());

   ws.textAll(m);
}

static char* errorJson(const char* msg) {
   strcpy(errStr, errPrefix);
   strcat(errStr, msg);
   strcat(errStr, jsonSuffix);
   return errStr;
};

static char* valJson(char* msg) {
   WLOG_I(TAG, "msg: %s", msg);
   strcpy(valStr, valPrefix);
   strcat(valStr, msg);
   strcat(valStr, jsonSuffix);
   return valStr;
};

static char* valJson(int num) {
   WLOG_I(TAG, "msg2: %i", num);
   char str[12];
   sprintf(str, "%u", num);
   return valJson(str);
};

static String getContentType(AsyncWebServerRequest* request, String filename) {
   if (request->hasArg("download")) return "application/octet-stream";
   // else if (filename.endsWith(".htm")) return "text/html";
   // else if (filename.endsWith(".html")) return "text/html";
   //  else if(filename.endsWith(".css")) return "text/css";
   //  else if(filename.endsWith(".js")) return "application/javascript";
   else if (filename.endsWith(".json")) return "application/json";
   // else if (filename.endsWith(".png")) return "image/png";
   //  else if(filename.endsWith(".gif")) return "image/gif";
   // else if (filename.endsWith(".jpg")) return "image/jpeg";
   // else if (filename.endsWith(".ico")) return "image/x-icon";
   //  else if(filename.endsWith(".xml")) return "text/xml";
   //  else if(filename.endsWith(".pdf")) return "application/x-pdf";
   //  else if(filename.endsWith(".zip")) return "application/x-zip";
   //  else if(filename.endsWith(".gz")) return "application/x-gzip";
   return "text/plain";
}

static bool handleFileRead(AsyncWebServerRequest* request, String path) {
   WLOG_I(TAG, "%s (%d args)", request->url().c_str(), request->params());

   String contentType = getContentType(request, path);
   if (LITTLEFS.exists(path)) {
      WLOG_I(TAG, "exists");
      request->send(LITTLEFS, path, contentType);
      return true;
   }
   return false;
}


static bool handleIfNoneMatchCacheHeader(AsyncWebServerRequest* request, String etag) {
   WLOG_D(TAG, "%s (%d args), etag %s", request->url().c_str(), request->params(), etag);

   AsyncWebHeader* maxAgeHeader = request->getHeader("Max-Age");
   if (maxAgeHeader && maxAgeHeader->value() == String("0")) {
      return false;
   }

   AsyncWebHeader* etagHeader = request->getHeader("If-None-Match");
   if (etagHeader && etagHeader->value() == "W/\"" + etag + "\"") {
      WLOG_D(TAG, "matched etag, 304 %i", millis());
      request->send(304);
      return true;
   }
   return false;
}

static void setCacheControlHeaders(AsyncWebServerResponse* response, CacheMode mode, String etag, int duration) {
   if (response == nullptr) {
      return;
   }

   String controlHeader = "";
   switch (mode) {
   case CacheMode::kNone:
      controlHeader = "no-store";
      break;
   case CacheMode::kRevalidate:
      controlHeader = "no-cache";
      break;
   case CacheMode::kShortTerm:
      controlHeader = "max-age=86400, must-revalidate";
      break;
   case CacheMode::kLongTerm:
      controlHeader = "public, max-age=31536000, immutable";
      break;
   case CacheMode::kSoftThrottle:
      controlHeader = "private, max-age=";
      controlHeader += duration;
      controlHeader += ", immutable";
      break;
   }
   response->addHeader(F("Cache-Control"), controlHeader);
   // if (mode != CacheMode::kLongTerm)
   response->addHeader(F("ETag"), "W/\"" + etag + "\"");
}

static void serveFavicon(AsyncWebServerRequest* request) {
   WLOG_D(TAG, "fetch favicon");
   if (handleIfNoneMatchCacheHeader(request, String(VERSION))) return;
   WLOG_D(TAG, "fetch favicon not from cache");

   // AsyncWebServerResponse* response = request->beginResponse_P(200, "image/png", IMG_favicon, IMG_favicon_L);
   AsyncWebServerResponse* response = request->beginResponse_P(200, "image/x-icon", IMG_favicon, IMG_favicon_L);
   response->addHeader(F("Content-Encoding"), "gzip");
   setCacheControlHeaders(response, CacheMode::kLongTerm, String(VERSION), 0 /*ignored*/);

   request->send(response);
}

static void serveApp(AsyncWebServerRequest* request) {
   WLOG_D(TAG, "serving app: %i", millis());
   if (handleIfNoneMatchCacheHeader(request, String(VERSION))) return;

   AsyncWebServerResponse* response = request->beginResponse_P(200, "text/javascript", JS_app, JS_app_L);

   response->addHeader(F("Content-Encoding"), "gzip");
   setCacheControlHeaders(response, CacheMode::kLongTerm, String(VERSION), 0 /*ignored*/);

   request->send(response);
   WLOG_D(TAG, "serving app sent: %i", millis());
}

String indexProcessor(const String& var) {
   WLOG_D(TAG, "indexProcessor var: %s", var);
   if (var == "IP") return ipAddress;
   if (var == "MAC") return macAddress;
   if (var == "DEVICE_NAME") return String(deviceName);
   if (var == "TIMESTAMP") return String(deviceName);

   return String();
}

static void serveIndex(AsyncWebServerRequest* request) {
   WLOG_D(TAG, "serving index: %i", millis());

   if (handleIfNoneMatchCacheHeader(request, String(VERSION))) return;

   AsyncWebServerResponse* response = request->beginResponse_P(200, stdBlinds::MT_HTML, HTML_index, HTML_index_L, indexProcessor);

   // response->addHeader(F("Content-Encoding"), "gzip");
   setCacheControlHeaders(response, CacheMode::kShortTerm, String(VERSION), 0 /* ignored */);

   request->send(response);
   WLOG_D(TAG, "serving index sent: %i", millis());

}

static void serveBackground(AsyncWebServerRequest* request) {
   if (handleIfNoneMatchCacheHeader(request, String(VERSION))) return;

   AsyncWebServerResponse* response = request->beginResponse_P(200, stdBlinds::MT_JPG, IMG_background, IMG_background_L);

   response->addHeader(F("Content-Encoding"), "gzip");
   setCacheControlHeaders(response, CacheMode::kLongTerm, String(VERSION), 0 /*ignored*/);

   request->send(response);
}

static void getState(AsyncWebServerRequest* request) {
   WLOG_I(TAG, "%s (%d args)", request->url().c_str(), request->params());

   AsyncWebServerResponse* response = request->beginResponse(200, stdBlinds::MT_JSON, State::getInstance()->serialize());
   request->send(response);
}

static void getDevices(AsyncWebServerRequest* request) {
   WLOG_I(TAG, "%s (%d args)", request->url().c_str(), request->params());
   if (handleFileRead(request, "/devices.json")) return;
   AsyncWebServerResponse* response = request->beginResponse(200, stdBlinds::MT_JSON, "{}");
   request->send(response);
}

static void getRoutines(AsyncWebServerRequest* request) {
   WLOG_I(TAG, "%s (%d args)", request->url().c_str(), request->params());
   if (handleFileRead(request, "/routines.json")) return;
   AsyncWebServerResponse* response = request->beginResponse(200, stdBlinds::MT_JSON, "{}");
   request->send(response);
}

static void updateState(AsyncWebServerRequest* request, JsonVariant& json) {
   WLOG_I(TAG, "%s (%d args)", request->url().c_str(), request->params());
   JsonObject obj = json.as<JsonObject>();
   auto errCode = State::getInstance()->loadFromObject(nullptr, obj);
   if (errCode == stdBlinds::error_code_t::NoError) {
      return request->send(204);
   }
   char* err = errorJson(stdBlinds::ErrorMessage[errCode]);
   return request->send(400, stdBlinds::MT_JSON, err);
}

static void serveOps(AsyncWebServerRequest* request, bool post) {
   WLOG_I(TAG, "%s (%d args)", request->url().c_str(), request->params());
   if (post) {
      auto errCode = BlindsAPI::doOperation(request->arg("plain").c_str());
      if (errCode == stdBlinds::error_code_t::NoError) {
         return request->send(202);
      }
      char* err = errorJson(stdBlinds::ErrorMessage[errCode]);
      return request->send(400, stdBlinds::MT_JSON, err);
   }
   request->beginResponse_P(200, stdBlinds::MT_HTML, HTML_index, HTML_index_L);
}

static void updateSettings(AsyncWebServerRequest* request, JsonVariant& json) {
   WLOG_I(TAG, "%s (%d args)", request->url().c_str(), request->params());
   JsonObject obj = json.as<JsonObject>();
   auto errCode = State::getInstance()->loadFromObject(nullptr, obj, true);
   if (errCode == stdBlinds::error_code_t::NoError) {
      return request->send(204);
   }
   char* err = errorJson(stdBlinds::ErrorMessage[errCode]);
   return request->send(400, stdBlinds::MT_JSON, err);
}

static void getSettings(AsyncWebServerRequest* request) {
   WLOG_I(TAG, "%s (%d args)", request->url().c_str(), request->params());
   auto state = State::getInstance();

   String data;
   String etag;
   if (request->hasArg("type")) {
      auto p = request->getParam("type")->value();
      if (0 != strcmp(p.c_str(), "mqtt")) {
         etag = state->getMqttEtag();
         if (handleIfNoneMatchCacheHeader(request, etag)) return;
         data = state->serializeSettings(setting_t::kMqtt);
      }
      else if (0 != strcmp(p.c_str(), "hw")) {
         etag = state->getHardwareEtag();
         if (handleIfNoneMatchCacheHeader(request, etag)) return;
         data = state->serializeSettings(setting_t::kHardware);
      }
      else if (0 != strcmp(p.c_str(), "gen")) {
         etag = state->getGeneralEtag();
         if (handleIfNoneMatchCacheHeader(request, etag)) return;
         data = state->serializeSettings(setting_t::kGeneral);
      }
      else {
         request->send(400, stdBlinds::MT_JSON, errorJson("Invalid type"));
      }
   }
   else {
      etag = state->getAllSettingsEtag();
      if (handleIfNoneMatchCacheHeader(request, etag)) return;
      data = state->serializeSettings(setting_t::kAll);
   }
   AsyncWebServerResponse* response = request->beginResponse(200, stdBlinds::MT_JSON, data);
   setCacheControlHeaders(response, CacheMode::kRevalidate, etag, 0 /* ignored */);
   request->send(response);
}

void BlindsHTTPAPI::init() {
   WLOG_I(TAG);

   EventFlags interestingFlags;
   interestingFlags.pos_ = true;
   interestingFlags.targetPos_ = true;
   interestingFlags.accel_ = true;
   interestingFlags.speed_ = true;


   State::getInstance()->Attach(this, interestingFlags);

   ws.onEvent(onEvent);
   server.addHandler(&ws);

   DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
   DefaultHeaders::Instance().addHeader("Access-Control-Expose-Headers", "*");
   DefaultHeaders::Instance().addHeader("Access-Control-Allow-Methods", "*");
   DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "*");

   /**
    * Fixtures
    */
   server.on("/favicon.ico", HTTP_GET, serveFavicon);
   String bgVersioned = "/bg-";
   bgVersioned += String(VERSION);
   bgVersioned += ".jpg";
   server.on(bgVersioned.c_str(), HTTP_GET, serveBackground);

   /**
    * Modules
    */
   String appVersioned = "/app-";
   appVersioned += String(VERSION);
   appVersioned += ".js";
   server.on(appVersioned.c_str(), HTTP_GET, serveApp);

   /**
    * Index serving endpoints (routes)
    */
   server.on("^\\/(home|routines|settings)?$", HTTP_GET,
      [](AsyncWebServerRequest* request) {
         WLOG_D(TAG, "handle /, /settings, /routines: %s at %i", request->url(), millis());
         if (captivePortal(request)) return;
         if (configRedirect(request)) return;
         return serveIndex(request);
      }
   );

   /**
    * /api endpoints
    */
   server.on("/api/devices", HTTP_GET, getDevices);
   server.on("/api/routines", HTTP_GET, getRoutines);

   server.on("/api/restore", HTTP_POST,
      [](AsyncWebServerRequest* request) {
         DO_RESTORE();
         return request->send(202);
      }
   );

   server.on("/api/restore", HTTP_POST,
      [](AsyncWebServerRequest* request) {
         DO_RESTORE();
         return request->send(202);
      }
   );

   server.on("/api/wifi/scan", HTTP_GET, [](AsyncWebServerRequest* request) {
      String json = "[";
      int n = WiFi.scanComplete();
      if (n == -2) {
         WiFi.scanNetworks(true);
      }
      else if (n) {
         for (int i = 0; i < n; ++i) {
            if (i) json += ",";
            json += "{";
            json += "\"rssi\":" + String(WiFi.RSSI(i));
            json += ",\"ssid\":\"" + WiFi.SSID(i) + "\"";
            json += ",\"bssid\":\"" + WiFi.BSSIDstr(i) + "\"";
            json += ",\"channel\":" + String(WiFi.channel(i));
            json += ",\"secure\":" + String(WiFi.encryptionType(i));
            json += "}";
         }
         WiFi.scanDelete();
         if (WiFi.scanComplete() == -2) {
            WiFi.scanNetworks(true);
         }
      }
      json += "]";
      request->send(200, "application/json", json);
      json = String();
      }
   );

   /**
    * Utility endpoints
    */
   server.on("/api/esp/freeheap", HTTP_GET,
      [](AsyncWebServerRequest* request) {
         request->send(200, stdBlinds::MT_JSON, valJson(lastHeap));
      }
   );
   server.on("^\\/api\\/files\\/(.*+)$", HTTP_GET,
      [](AsyncWebServerRequest* request) {
         String fileName = "/" + request->pathArg(0);
         if (!handleFileRead(request, fileName)) {
            return request->send(404);
         }
         request->send(200, stdBlinds::MT_JSON, valJson(lastHeap));
      }
   );

   server.on("/api/state", HTTP_GET, getState);
   AsyncCallbackJsonWebHandler* stateHandler = new AsyncCallbackJsonWebHandler("/api/state", updateState);
   stateHandler->setMethod(HTTP_PUT);
   server.addHandler(stateHandler);


   // TODO: change this to use AsyncJsonResponse
   server.on("/api/settings", HTTP_GET, getSettings);
   server.on("/api/settings", HTTP_OPTIONS,
      [](AsyncWebServerRequest* request) {
         request->send(200);
      }
   );

   AsyncCallbackJsonWebHandler* settingsHandler = new AsyncCallbackJsonWebHandler("/api/settings", updateSettings);
   settingsHandler->setMethod(HTTP_PUT);
   server.addHandler(settingsHandler);



   // server.onNotFound(handleNotFound);

   server.onNotFound([](AsyncWebServerRequest* request) {
      WLOG_D(TAG, "Handle not found: %s", request->url());
      if (captivePortal(request)) return;

      if (request->method() == HTTP_OPTIONS) {
         AsyncWebServerResponse* response = request->beginResponse(200);
         response->addHeader(F("Access-Control-Max-Age"), F("7200"));
         request->send(response);
         return;
      }

      request->send(404);
      }
   );

   server.begin();
   isInit_ = true;
}

bool BlindsHTTPAPI::isInit() {
   return isInit_;
}