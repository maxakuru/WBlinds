# WBlinds

Wifi controller for smart blinds.

## Features
* MQTT API
* HTTP/REST API
* Handles halting on home detection

## APIs

### HTTP
```sh
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

## TODO
- [ ] AP wifi setup
- [ ] Servo brake & relay for minimizing power consumption
- [ ] Add schematic, PCB
- [ ] Build walkthrough with Ikea HOPPVALS/TRIPPEVALS