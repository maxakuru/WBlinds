#ifndef DATAGRAM_H_
#define DATAGRAM_H_

#include "defines.h"
#include "event.h"
#include "state.h"


namespace Datagram {
    byte* pack(const WBlindsEvent& event);
    // todo unpackString(byte* message);

    enum class type_t {
        Hello = 0,
        Acknowledge = 1,
        JoinGroup = 2,
        LeaveGroup = 3,
        UpdateState = 4,
        Ping = 5,
        Pong = 6
    };
    extern std::map<type_t, size_t> SizeMap;
}

#endif // DATAGRAM_H_