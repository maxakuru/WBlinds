# WBlinds

ESP32 controller for smart blinds!

## Features
* MQTT API
* HTTP/REST API
* Homekit integration
* Handles halting on home detection
* > Work in progress

## Setup
1. Configure `src/Credentials.h.ex` and rename to `src/Credentials.h`
2. Configure pins in `src/defines.h`
3. Setup `platformio.ini` to your liking
4. Build & flash

## TODO
- [x] Parameterize pins
- [x] Homekit integration
- [x] Saving settings to SPIFFS
- [ ] Solidify API definitions
- [ ] Web UI - WIP
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


## APIs
These APIs are in flux!

### HTTP
```js
POST <host:port>/state
{ 
    "tPos": 50, //[0-100] (target position %, starts move)
    "pos": 50, // [0-100] (current position %)
    "accel": 99999, // [0-UINT32_MAX] (steps/s/s)
    "speed": 1000, // [0-something reasonable] (Hz)
}
```
```js
GET <host:port>/state
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

### MQTT
WBlinds subscribes to a wildcard based on the device name provided.
For example, a device name `blinds/living_room` will subscribe to `blinds/living_room/#`.

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
body="{\"pos\":50,\"speed\":10,\"accel\":10}"
```
Where `pos`, `speed` are percentages and `accel` is Hz.

### Homekit
Native Homekit integration allows the ESP32 to be detected as a device without a bridge/emulator. This mode requires percentage-based position values, so it's important to calibrate the settings first.

# Other files
The `/etc` directory contains some STL files that may be useful for building WBlinds. Those are designed for use with IKEA HOPPVALS, but would be close to the TRIPPVALS, too.
> Note: Like everything else, those designs are a WIP :)