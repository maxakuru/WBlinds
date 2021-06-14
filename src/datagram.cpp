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

    String packString(const StateEvent& event) {
        auto state = State::getInstance();
        String s = "";

        s += delimiter;
        s += event.flags_.mask_;
        s += delimiter;

        if (event.flags_.pos_) {
            s += state->getPosition();
            s += delimiter;
        }
        if (event.flags_.targetPos_) {
            s += state->getTargetPosition();
            s += delimiter;
        }
        if (event.flags_.speed_) {
            s += state->getSpeed();
            s += delimiter;
        }
        if (event.flags_.accel_) {
            s += state->getAccel();
            s += delimiter;
        }
        if (event.flags_.deviceName_) {
            s += state->getDeviceName();
            s += delimiter;
        }
        if (event.flags_.mDnsName_) {
            s += state->getmDnsName();
            s += delimiter;
        }
        WLOG_I(TAG, "DG string: %s", s);
        return s;
        // if (event.flags_.mqttEnabled_) {
        //     s += state->getMqttEnabled();
        //     s += delimiter;
        // }
    }

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

    std::map<type_t, const uint8_t> SizeMap = {
    {type_t::Hello, 128},
    {type_t::Acknowledge, 128},
    {type_t::JoinGroup, 128},
    {type_t::LeaveGroup, 128},
    {type_t::Ping, 128},
    {type_t::Pong, 128},
    {type_t::UpdateState, 128}
    };
}