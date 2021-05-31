#ifndef STATE_H_
#define STATE_H_

#include <Arduino.h>
#include <type_traits>

struct StateData {
    int32_t pos;
    int32_t speed;
    uint32_t accel;
};

class State {
public:
    enum Key {
        kPosition = 0,
        kSpeed = 1
    };
    static State* instance;
    static State* getInstance();
    void save();
    void load();
    // bool shouldSave();
    bool isDirty();

    template <State::Key K>
    typename std::enable_if<K == State::Key::kPosition>::type
        set(State::Key k, int32_t& v) {
        data.pos = v;
        _isDirty = true;
    }

    template <State::Key K>
    typename std::enable_if<K == State::Key::kSpeed>::type
        set(State::Key k, uint32_t& v) {
        data.speed = v;
        _isDirty = true;
    }
private:
    StateData data;
    bool _isDirty;
    bool _isInit;
    State() {
        _isDirty = false;
        _isInit = false;
        data = {
            pos: 0,
            speed : 1000,
            accel : INT32_MAX
        };
    };
    void init();
    // bool thresholdElapsed();
};

#endif // STATE_H_