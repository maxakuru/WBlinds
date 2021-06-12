#ifndef HOMEKIT_H_
#define HOMEKIT_H_

#include "defines.h"
#include "state.h"
#include <ESP32HomeKit.h>

class Homekit : Observer {
public:
    explicit Homekit(State &state);
    ~Homekit() override {};
    void handleStateChange(const StateData& newState) override;
    void init();
private:
    hap_char_t* charPos;
    hap_char_t* charTargPos;
    hap_char_t* charPosState;
    hap_char_t* charName;

};

#endif // HOMEKIT_H_