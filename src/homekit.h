#ifndef HOMEKIT_H_
#define HOMEKIT_H_

#include "defines.h"
#include "state.h"
#include "event.h"
#include <ESP32HomeKit.h>

class Homekit : protected WBlindsObserver {
public:
    explicit Homekit(State& state)
        :state_(state) {
        EventFlags flags;
        flags.deviceName_ = true;
        flags.pos_ = true;
        flags.speed_ = true;
        flags.accel_ = true;
        flags.targetPos_ = true;
        state_.Attach(this, flags);
    };
    ~Homekit() override {
        hap_stop();
        state_.Detach(this);
    };
    void handleEvent(const WBlindsEvent& event) override;
    void init();
    void resetToFactory();
    void resetPairings();
    void resetNetwork();
private:
    hap_char_t* charPos_;
    hap_char_t* charTargPos_;
    hap_char_t* charPosState_;
    hap_char_t* charName_;

    State& state_;

};

#endif // HOMEKIT_H_
