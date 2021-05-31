#include "state.h"

State* State::instance = 0;

State* State::getInstance() {
    if (!instance)
        instance = new State;
    return instance;
}

void State::load() {
    Serial.println("[State] load()");
}

void State::save() {
    Serial.println("[State] save()");

}