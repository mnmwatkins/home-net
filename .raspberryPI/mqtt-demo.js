/* This program monitors the MQTT broker and enables upto 8 SanSmart relays
 * for output to line voltage systems.  Similar to Arduino system; but via 
 * the RaspberryPI and node.js
 */

var mqtt = require('mqtt');
var Gpio = require('onoff').Gpio;

var relay = new Array();
relay[0] = new Gpio(17, 'out');
relay[1] = new Gpio(18, 'out');
relay[2] = new Gpio(27, 'out');
relay[3] = new Gpio(22, 'out');
relay[4] = new Gpio(23, 'out');
relay[5] = new Gpio(23, 'out');
relay[6] = new Gpio(25, 'out');
relay[7] = new Gpio(4, 'out');

var gpioClient = mqtt.connect('mqtt://192.168.1.3'); //mqtt broker

gpioClient.on('connect',function() {
	gpioClient.subscribe('/outlet/8/+'); //I am outlet #8; ie for 8 relay's...
});

gpioClient.on('message',function(topic, message) {
	//console.log(message.toString());
	//console.log(topic.toString());
	var topicString = topic.toString();
	var splitTopic = topicString.split("/");
	var relayOffset = splitTopic[3];
	if (relayOffset > relay.length) {
		console.log("relay not defined.");
		return;
	}

	if (message.toString() === "ON") {
		//console.log("turning on..");
		relay[relayOffset].writeSync(1);
		gpioClient.publish('/outlet/status/8/' + relayOffset, 'ON');
	} else {
		//console.log("turning off..");
		relay[relayOffset].writeSync(0);
		gpioClient.publish('/outlet/status/8/' + relayOffset, 'OFF');
	}
});
