#ifndef UDP_NOTIFIER_H_
#define UDP_NOTIFIER_H_

#include "defines.h"
#include "state.h"

class UDPNotifier : Observer {
public:
    explicit UDPNotifier(State &state);
    ~UDPNotifier() override {};
    void handleStateChange(const StateData& newState);
    
private:
    void notify(byte* dg);
};

#endif // UDP_NOTIFIER_H_