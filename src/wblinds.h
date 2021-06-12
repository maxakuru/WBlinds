#ifndef WBLINDS_H_
#define WBLINDS_H_

#include "state.h"
#include "defines.h"

class WBlinds {
public:
    static WBlinds* instance;
    static WBlinds* getInstance();

    void setup();

    void loop();
    void reset();

    void initAP(bool resetAP = false);
    //   void handleConnection();
    //   void initConnection();
    //   void initInterfaces();
private:
    WBlinds() {}
};

#endif // WBLINDS_H_