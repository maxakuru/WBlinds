#ifndef DEFINES_H_
#define DEFINES_H_

#include <map>

namespace stdBlinds {

    enum class resolution_t {
        kFull = 1,
        kHalf = 2,
        kQuarter = 4,
        kEighth = 8,
        kSixteenth = 16
    };

    enum class error_code_t {
        NoError = 0,
        InvalidJson = -1,
        MissingOp = -2,
        UnknownOp = -3,
        MissingPos = -4
    };

    extern std::map<error_code_t, const char*> ErrorMessage;
}

#endif // DEFINES_H_