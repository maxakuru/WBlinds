#include "api_http.h"
#include "defines.h"
#include "datagram.h"
#include "api_http_websocket.h"
#include <ESPAsyncWebServer.h>

// Errors
const char* errPrefix = "{\"error\":\"";
const char* errSuffix = "\"}";
char errStr[50] = "";

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

BlindsHTTPAPI::BlindsHTTPAPI() {
   WLOG_I(TAG);
}

BlindsHTTPAPI::~BlindsHTTPAPI() {
   State::getInstance()->Detach(this);
   ws.cleanupClients();
};

void BlindsHTTPAPI::handleEvent(const StateEvent& event) {
   // TODO: send data over websocket to connected web clients
   WLOG_I(TAG, "event mask: %i", event.flags_.mask_);

   // auto b = datagramToWSMessage()
   String m = Datagram::packString(event);
   WLOG_I(TAG, "DG message: %s", m);

   ws.textAll(m);
}

char* errorJson(const char* msg) {
   strcpy(errStr, errPrefix);
   strcat(errStr, msg);
   strcat(errStr, errSuffix);
   return errStr;
};

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

bool handleFileRead(AsyncWebServerRequest* request, String path) {
   WLOG_I(TAG);
   if (path.endsWith("/")) path += "index.html";
   String contentType = getContentType(request, path);
   if (LITTLEFS.exists(path)) {
      WLOG_I(TAG, "exists");
      request->send(LITTLEFS, path, contentType);
      return true;
   }
   return false;
}


bool handleIfNoneMatchCacheHeader(AsyncWebServerRequest* request) {
   AsyncWebHeader* header = request->getHeader("If-None-Match");
   if (header && header->value() == String(VERSION)) {
      request->send(304);
      return true;
   }
   return false;
}

void setStaticContentCacheHeaders(AsyncWebServerResponse* response) {
   response->addHeader(F("Cache-Control"), "no-cache");
   response->addHeader(F("ETag"), String(VERSION));
}

void serveIndex(AsyncWebServerRequest* request) {
   if (handleFileRead(request, "/index.html")) return;

   if (handleIfNoneMatchCacheHeader(request)) return;

   AsyncWebServerResponse* response = request->beginResponse_P(200, stdBlinds::MT_HTML, PAGE_index, PAGE_index_L);

   response->addHeader(F("Content-Encoding"), "gzip");
   setStaticContentCacheHeaders(response);

   request->send(response);
}

void handleNotFound(AsyncWebServerRequest* request) {
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

void getState(AsyncWebServerRequest* request) {
   bool fromFile = request->hasParam("f");
   if (fromFile) {
      if (!handleFileRead(request, "/state.json")) {
         return request->send(404, stdBlinds::MT_HTML, "Not found");
      }
   };
   request->send(200, stdBlinds::MT_JSON, State::getInstance()->serialize());
}

void updateState(AsyncWebServerRequest* request, JsonVariant& json) {
   WLOG_I(TAG);
   JsonObject obj = json.as<JsonObject>();
   auto errCode = State::getInstance()->loadFromObject(nullptr, obj);
   if (errCode == stdBlinds::error_code_t::NoError) {
      return request->send(200, stdBlinds::MT_HTML, "Ok");
   }
   char* err = errorJson(stdBlinds::ErrorMessage[errCode]);
   return request->send(400, stdBlinds::MT_JSON, err);
}

void serveOps(AsyncWebServerRequest* request, bool post) {
   WLOG_I(TAG, "HTTP POST");
   if (post) {
      auto errCode = BlindsAPI::doOperation(request->arg("plain").c_str());
      if (errCode == stdBlinds::error_code_t::NoError) {
         return request->send_P(200, stdBlinds::MT_HTML, "Ok");
      }
      char* err = errorJson(stdBlinds::ErrorMessage[errCode]);
      return request->send(400, stdBlinds::MT_JSON, err);
   }
   request->beginResponse_P(200, "text/html", PAGE_index, PAGE_index_L);
}

void updateSettings(AsyncWebServerRequest* request) {
   WLOG_I(TAG);
   // TODO:
}

void getSettings(AsyncWebServerRequest* request) {
   WLOG_I(TAG);
   // TODO:
}

void BlindsHTTPAPI::init() {
   WLOG_I(TAG);

   EventFlags interestingFlags;
   interestingFlags.pos_ = true;
   interestingFlags.targetPos_ = true;
   interestingFlags.accel_ = true;

   State::getInstance()->Attach(this, interestingFlags);

   ws.onEvent(onEvent);
   server.addHandler(&ws);

   server.on("/", HTTP_GET, serveIndex);

   server.on("/state", HTTP_GET, getState);

   AsyncCallbackJsonWebHandler* handler = new AsyncCallbackJsonWebHandler("/state", updateState);
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

   server.onNotFound(handleNotFound);

   server.begin();
}