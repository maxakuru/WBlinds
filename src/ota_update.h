#ifndef OTA_UPDATE_H_
#define OTA_UPDATE_H_

#ifndef DISABLE_OTA

#include <ArduinoOTA.h>
#include "defines.h"

/**
 * @brief Start existing WiFi for OTA updater.
 */
// void OTAwifi() {
//     WiFi.mode(WIFI_STA);
//     WiFi.begin();
// }

/**
 * @brief Initialize OTA updater.
 */
void OTAinit() {
    ArduinoOTA
        .onStart([]() {
            String type;
            if (ArduinoOTA.getCommand() == U_FLASH)
                type = "sketch";
            else
                type = "filesystem";
            WLOG_I("Start updating " + type);
            })
        .onEnd([]() {
            WLOG_I(TAG, "\nEnd");
        })
        .onProgress([](unsigned int progress, unsigned int total) {
            WLOG_I(TAG, "Progress: %u%%\r", (progress / (total / 100)));
        })
        .onError([](ota_error_t error) {
            WLOG_E(TAG, "Error[%u]: ", error);
            if (error == OTA_AUTH_ERROR) WLOG_E(TAG, "Auth Failed");
            else if (error == OTA_BEGIN_ERROR) WLOG_E(TAG, "Begin Failed");
            else if (error == OTA_CONNECT_ERROR) WLOG_E(TAG, "Connect Failed");
            else if (error == OTA_RECEIVE_ERROR) WLOG_E(TAG, "Receive Failed");
            else if (error == OTA_END_ERROR) WLOG_E(TAG, "End Failed");
        });

        ArduinoOTA.begin();
        if (WiFi.waitForConnectResult() == WL_CONNECTED) {
            auto ip = WiFi.localIP();
            WLOG_I(TAG, "IP address: %d.%d.%d.%d", ip[0], ip[1], ip[2], ip[3]);
        }
        else {
            WLOG_E(TAG, "Wifi Connection Failed.");
        }
}

/**
 * @brief Check for update.
 */
void OTAloopHandler() {
    ArduinoOTA.handle();
}

#endif // DISABLE_OTA

#endif // OTA_UPDATE_H_