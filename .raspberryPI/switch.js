/* This small node program will monitor a GPIO pin on the 
 * RaspberryPI and send an MQTT message to update the
 * meteor database that is has changed.
 */

var mqtt = require('mqtt');
var GPIO = require('onoff').Gpio;
var sleep = require('sleep').usleep;

reedSwitch = new GPIO(17, 'in','both'); //Pick a pin

var gpioClient = mqtt.connect('mqtt://192.168.1.3'); //MQTT Broker
gpioClient.on('connect',function() {
	console.log("connected to mqtt broker");
});

reedSwitch.watch(function (err, value) { //watch and send...
	if (err) {
		throw err;
	}
	var mqttMessage = "OFF";			
	if (value === 1) { 
		mqttMessage = "ON";
	}
	//console.log("mqtt publish: /switch/status/0/0   message: " + mqttMessage);
	gpioClient.publish('/switch/status/0/0', mqttMessage);
});
