#include "udp_notifier.h"

void pack(byte* dg, byte* data, size_t len) {
    memcpy(dg, MAGIC_NUMBER, 4);
    memcpy(&dg[4], data, len);
}

UDPNotifier::UDPNotifier(State &state) {
    state.Attach(this);
}

void UDPNotifier::handleStateChange(const StateData& newState) {
    byte dg[DatagramSize[WBlinds::datagram_t::UpdateState]];
    byte data[4] = {0x01, 0x02, 0x03, 0x04};
    pack(dg, data, 4);
    notify(dg);
}

void UDPNotifier::notify(byte* dg) {
    Serial.print("notify: ");
    Serial.println(dg[0]);
    Serial.println(dg[1]);
    Serial.println(dg[2]);
    Serial.println(dg[3]);
    Serial.println(dg[4]);
    Serial.println(dg[5]);
    Serial.println(dg[6]);
    Serial.println(dg[7]);
    Serial.println(dg[8]);


}