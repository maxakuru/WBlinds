#ifndef OTA_UPDATE_H_
#define OTA_UPDATE_H_

#ifndef OTA_ENABLE
#define OTA_ENABLE true
#endif  // OTA_ENABLE

#if OTA_ENABLE

#include <WiFi.h>
#include <ESPmDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include "defines.h"

/**
 * @brief Start existing WiFi for OTA updater.
 */
void OTAwifi() {
    WiFi.mode(WIFI_STA);
    WiFi.begin();
}

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

            ESP_LOGI("Start updating " + type);
            })
        .onEnd([]() {
            ESP_LOGI(TAG, "\nEnd");
        })
        .onProgress([](unsigned int progress, unsigned int total) {
            ESP_LOGI(TAG, "Progress: %u%%\r", (progress / (total / 100)));
        })
        .onError([](ota_error_t error) {
            ESP_LOGE(TAG, "Error[%u]: ", error);
            if (error == OTA_AUTH_ERROR) ESP_LOGE(TAG, "Auth Failed");
            else if (error == OTA_BEGIN_ERROR) ESP_LOGE(TAG, "Begin Failed");
            else if (error == OTA_CONNECT_ERROR) ESP_LOGE(TAG, "Connect Failed");
            else if (error == OTA_RECEIVE_ERROR) ESP_LOGE(TAG, "Receive Failed");
            else if (error == OTA_END_ERROR) ESP_LOGE(TAG, "End Failed");
        });

        ArduinoOTA.begin();
        if (WiFi.waitForConnectResult() == WL_CONNECTED) {
            ESP_LOGI(TAG, "IP address: %s", WiFi.localIP());
        }
        else {
            ESP_LOGE(TAG, "Wifi Connection Failed.");
        }
}

/**
 * @brief Check for update.
 */
void OTAloopHandler() {
    ArduinoOTA.handle();
}

#else   // OTA_ENABLE
void OTAwifi() {}
void OTAinit() {}
void OTAloopHandler() {}
#endif  // OTA_ENABLE

#endif // OTA_UPDATE_H_