#ifndef UDP_NOTIFIER_H_
#define UDP_NOTIFIER_H_

#include "defines.h"
#include "state.h"

class UDPNotifier : protected StateObserver {
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
    void handleEvent(const StateEvent& event);

private:
    void notify(byte* dg);
    State& state_;
};

#endif // UDP_NOTIFIER_H_