# home-net
First try at IoT via MQTT and Meteor.

The 'master' brance will contain working code; but tends to lack the main functionality.  Use the development branch if you would like to see direction and more complete feature set.

Effectively this is what this project is:

1. Use MQTT to communicate with Adafruit's Huzzah Feather device to enable and disable plugs around the house.
2. Use an old Raspberry PI to monitor reed swithces that are placed around the house entrances.
3. The ability to configure the Collection of MQTT topics that are in the field.
4. The ability to switch on and off different topic/relays to turn on an off lights,etc.
5. A place to view the overall status of the house..very basic overlay of an image with some div's.
6. Have a way to go to "secure" mode and send a text/email message
7. Repository for Arduino / Python or Node code for the various hardware elements.
8. Repository of wiring diagrams to build the different elements.

And in the end, anything else that comes to mind.

Devices communciating with:
 - Adafruit's Huzzah Feather - ESP8266 Wifi driving two channel relay board (SainSmart 2-Channel Relay Module) via MQTT
 - SONOFF - ESP8266 relay module with custom sketch for the ESPWifi board to talk MQTT
 - Raspberry PI (v2) - Custom Node.js code to read MQTT and report motion sensing / reed switch - MQTT Driven
 - Raspberry PI (v3) - Custom Node.js code to drive eight channel relay board (SainSmart 8-Channel) - MQTT Driven
