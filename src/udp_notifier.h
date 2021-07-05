#ifndef UDP_NOTIFIER_H_
#define UDP_NOTIFIER_H_

#ifndef DISABLE_UDP_SYNC

#include "defines.h"
#include "state.h"

class UDPNotifier : protected WBlindsObserver {
public:
    explicit UDPNotifier(State& state)
        : state_(state) {
        EventFlags flags;
        flags.pos_ = true;
        state.Attach(this, flags);
    };
    ~UDPNotifier() override {
        state_.Detach(this);
    };
    void handleEvent(const WBlindsEvent& event);

private:
    void notify(byte* dg);
    State& state_;
};

#endif // DISABLE_UDP_SYNC

#endif // UDP_NOTIFIER_H_