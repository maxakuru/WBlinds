#include "udp_notifier.h"

void pack(byte* dg, byte* data, size_t len) {
    memcpy(dg, MAGIC_NUMBER, 4);
    memcpy(&dg[4], data, len);
}

void UDPNotifier::handleEvent(const StateEvent& event) {
    // byte dg[DatagramSize[stdBlinds::datagram_t::UpdateState]];
    // byte data[4] = { 0x01, 0x02, 0x03, 0x04 };
    // pack(dg, data, 4);
    // notify(dg);
}

void UDPNotifier::notify(byte* dg) {
    WLOG_I(TAG, "dg: %i %i %i %i %i %i %i %i", dg[0], dg[1], dg[2], dg[3], dg[4], dg[5], dg[6], dg[7]);
}