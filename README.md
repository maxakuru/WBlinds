![Logo](./etc/logo.png)

![License](https://img.shields.io/static/v1?label=License&message=MIT&color=blue&style=flat-square)
![Releasde](https://img.shields.io/static/v1?label=Release&message=WIP&color=blue&style=flat-square)


#### ESP32 controller for smart blinds!



## 🌟 Features
* MQTT API
* HTTP/REST API
* Homekit integration
* Handles halting on home detection
* Web UI for controlling/configuring


## ✏️ Setup
1. `git clone https://github.com/maxakuru/WBlinds.git`
2. Configure `src/Credentials.h.ex` and rename to `src/Credentials.h`
3. Configure pins in `src/defines.h`
4. Setup `platformio.ini` to your liking
5. Build & flash


## ⏳ TODO
- [x] Parameterize pins
- [x] Homekit integration
- [x] Saving settings to SPIFFS
- [x] Web UI
- [ ] Solidify API definitions
- [ ] Settings page in web UI (pins, hardware, name, etc.) - WIP
- [ ] Web calibration wizard
- [ ] UDP Sync
- [ ] UDP Sync Groups
- [ ] Routines
- [ ] WS support for web clients
- [ ] AP wifi setup
- [ ] Servo brake & relay for minimizing power consumption
- [ ] Add schematic, PCB
- [ ] Add STLs for 3D printing axis, brake, enclosure - initial
- [ ] Build walkthrough with Ikea HOPPVALS/TRIPPEVALS
- [ ] State approximation with Hall effect sensor (built-in on ESP32)


## 💻 Web UI
TODO


## 🔧 Configuration
There are a few ways to configure WBlinds. Eventually the goal is to provide a way to easily calibrate top and bottom ranges of the blinds, but for now the distances are either manually set or (by default) calculated from configuration values.

### Parameters
| Parameter | Description | Default |
| --------- | ----------- | ------- |
| `DEFAULT_STEPS_PER_REV` | Steps per revolution, varies from motor to motor. May be defined as step angle, in which case you can divide 360/stepAngle for the steps/rev | `200` (1.8°) |
| `DEFAULT_CORD_LENGTH_MM` | Length of the cord or material that wraps around the axis, in millimeters. Used to calculate maximum turns to fully wrap around axis. | `1650` |
| `DEFAULT_CORD_DIAMETER_MM` | Diameter of the cord or material, in millimeters. Used to calculate maximum turns to fully wrap around axis. | `0.1` |
| `DEFAULT_AXIS_DIAMETER_MM` | Diameter of the axis the motor turns, in millimeters. Default is the approx size of the stl in `etc/` | `15` |

### Default Pins
| Pin | Use | Description
| --- | --- | -----------|
| `18`  | pDir | Controls direction (optional) |
| `19`  | pStep | Controls steps via PWM with A4988 (required) |
| `21`  | pSlp | Allows putting motor to sleep to save most power possible. (optional) |
| `23`  | pEn | Allows enabling/disabling motor with A4988. By default the motor is disabled and enabled between uses which lowers power consumption. (optional)
| `3` | pRst | Reset pin (optional)
| `1` | pMs1 | Microstep resolution pin 1, using microsteps can decrease sound (optional)
| `5` | pMs2 | Microstep resolution pin 2 (optional)
| `17` | pMs3 | Microstep resolution pin 3 (optional)
| `4` | pHomeSw | Home trigger switch, recommended as a way to hard stop when the blinds reach the fully contracted position to avoid damaging hardware when steps are skipped or malfunctions. (optional)



## 🔌 APIs
These APIs are in flux!

### HTTP
```js
PUT <host:port>/api/state
// All fields optional
{ 
    "tPos": 50, //[0-100] (target position %, starts move)
    "pos": 50, // [0-100] (current position %)
    "accel": 99999, // [0-UINT32_MAX] (steps/s/s)
    "speed": 1000, // [0-something reasonable] (Hz)
}
```
```js
GET <host:port>/api/state
// 200
{ 
    "tPos": 50,
    "pos": 50,
    "accel": 99999,
    "speed": 1000
}
```

```js
POST <host:port> 
{ 
    "op": "run_forward" | "run_backward" | "stop" | "sleep"
}
```

```js
PUT <host:port>/api/settings
// All fields optional
// NOTE: MQTT password is sent in body unencoded/unencrypted.
// If that isn't acceptable for your use-case, set it at compile time.
{ 
    gen: { 
        deviceName: "WBlinds", 
        mdnsName: "WBlinds", 
        emitSync: true 
    },
    hw: {
        pStep: 19,
        pDir: 18,
        pEn: 23,
        pSleep: 21,
        pReset: 3,
        pMs1: 1,
        pMs2: 5,
        pMs3: 17,
        pHome: 4,
        cLen: 1650,
        cDia: 0.1,
        axDia: 15,
        stepsPerRev: 200,
        res: 16,
    },
    mqtt: {
        enabled: true,
        host: "192.168.1.99",
        port: 1883,
        topic: "WBlinds",
        user: "max",
        pass: "mysupersecurepassword"
    }
}
```

```js
POST <host:port>/api/restore
// 202, ESP resets once completed
// This wipes Homekit config & state files
```

### MQTT
WBlinds subscribes to a wildcard based on the topic provided.
For example, a topic name `blinds/living_room` will subscribe to `blinds/living_room/#`.

The topic defines a number of actions without any payload, for example:
```sh
topic="blinds/living_room/forward"
```
```sh
topic="blinds/living_room/backward"
```
```sh
topic="blinds/living_room/stop"
```
```sh
topic="blinds/living_room/sleep"
```

Some topics can specify additional data:
```sh
topic="blinds/living_room/move"
body="{\"pos\":50,\"speed\":1000,\"accel\":1000}"
```
Where `pos` is %, `speed` is Hz, and `accel` is steps/s^2.

### Homekit
Native Homekit integration allows the ESP32 to be detected as a device without a bridge/emulator. This mode requires percentage-based position values, so it's important to calibrate the settings first.


## 📝 Development
There are 2 main projects that make up this repo: the C++ ESP controller and a TypeScript-based web UI. The web UI is transpiled to Javascript and gzipped/chunked into header files with a script. All generated header files as well as transpiled JS is included in the repo, so no additional build steps are needed.

### Scripts
Build web UI in development/watch mode (outputs to `public/`):
```sh
yarn build:dev
```

Build web UI minified (outputs to `public/`):
```sh
yarn build:ui
```

Generate header files from `public/`:
```sh
yarn build:uih
```

The previous 2 scripts can be combined with:
```sh
yarn build
```


The following scripts depend on PlatformIO, and can be replaced with the toolbar quick actions in VSCode if you prefer.

Compile C++ (assumes *nix machine right now):
```sh
yarn build:cpp
```

Build & flash using pio:
```sh
yarn flash
```

### Tools
I recommend using VSCode to build/flash. Eventually I plan to cut releases of precompiled binary that can be flashed directly, but for the time being you'll need to pull the code and compile it yourself. That is made very simple by the wonderful [PlatformIO](https://platformio.org/) - I highly recommend using it with their [VSCode plugin](https://platformio.org/install/ide?install=vscode).

There are some other suggested plugins in the `.vscode` directory; VSCode should suggest installing any missing plugin on first boot, but none are required.

### Custom integrations
Additional integrations can be built in by extending the `StateObserver` class and attaching to it, specifying the event flags you are interested in.

```cpp
#include "defines.h"
#include "state.h"
#include <SpecialLib.h>

class SpecialLibIntegration : protected StateObserver {
public:
    explicit SpecialLibIntegration() {
        EventFlags flags;
        flags.pos_ = true;
        flags.speed_ = true;
        flags.accel_ = true;
        flags.targetPos_ = true;
        State::getInstance()->Attach(this, flags);
    };
    ~SpecialLibIntegration() override {
        specialLib.teardown();
        state_.Detach(this);
    };
}
```


## 🔗 Other files
The `/etc` directory contains some STL files that may be useful for building WBlinds. Those are designed for use with IKEA HOPPVALS, but would be close to the TRIPPVALS, too.
> Note: Like everything else, those designs are a WIP :)