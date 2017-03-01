/* This small node program will monitor a GPIO pin on the 
 * RaspberryPI and send an MQTT message to update the
 * meteor database that is has changed.
 */
 
var mqtt = require('mqtt');
var GPIO = require('onoff').Gpio;
var sleep = require('sleep').usleep;

motionSwitch = new GPIO(18, 'in','both'); //Pick a pin

var gpioClient = mqtt.connect('mqtt://192.168.1.3');  //MQTT Broker
gpioClient.on('connect',function() {
	console.log("connected to mqtt broker");
});

motionSwitch.watch(function (err, value) {
	if (err) {
		throw err;
	}
	var mqttMessage = "OFF";			
	if (value === 1) { 
		mqttMessage = "ON";
	}
	//console.log("mqtt publish: /switch/status/0/1   message: " + mqttMessage);
	gpioClient.publish('/switch/status/0/1', mqttMessage);
});
