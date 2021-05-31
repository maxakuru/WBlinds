#ifndef STATE_H_
#define STATE_H_

#include <Arduino.h>

class State {
public:
    static State* instance;
    static State* getInstance();
    void save();
    void load();
private:
    int data;
    State() {
        data = 0;
    };
    void initialize();
};

#endif // STATE_H_