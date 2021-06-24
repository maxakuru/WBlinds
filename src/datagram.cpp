#include "datagram.h"

const char delimiter = '/';

namespace Datagram {
    // void pack(byte* dg, byte* data, size_t len) {
    //     memcpy(dg, MAGIC_NUMBER, 4);
    //     memcpy(&dg[4], data, len);
    // }

    // String packDatagram(const StateEvent& event) {
    //     byte dg[SizeMap[type_t::UpdateState]];
    // }

    /**
     * @brief Pack byte array.
     *
     * @param event
     * @return byte*
     */
     // byte* pack(const StateEvent& event) {

     //     byte b[1024] = {};
     //     auto maskSize = sizeof(event.flags_.mask_);
     //     memcpy(b, static_cast<const char*>(static_cast<const void*>(&event.flags_.mask_)), maskSize);
     //     if (event.flags_.pos_) {

     //     }
     // }

    std::map<type_t, size_t> SizeMap = {
    {type_t::Hello, 128},
    {type_t::Acknowledge, 128},
    {type_t::JoinGroup, 128},
    {type_t::LeaveGroup, 128},
    {type_t::Ping, 128},
    {type_t::Pong, 128},
    {type_t::UpdateState, 128}
    };
}