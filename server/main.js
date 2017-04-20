import { Meteor } from 'meteor/meteor';
import { MQTT } from '../imports/api/home-net.js';
import { Elements } from '../imports/api/home-net.js';
import { AlertMail } from '../imports/api/home-net.js';
import { SystemStatus } from '../imports/api/home-net.js';

import '../imports/api/home-net.js'

//SERVER MAIN.
Meteor.startup(() => {});

/*
 * These functions connect to the MQTT broker and watch for changes
 * in the MQTT collection.  Then calls the function processTopic().
 * processTopic() will take the message and parse it to the appropriate
 * collection / action.
 *
 * Topics: "status" topics for I/O and "system" topic for alarming
 */
MQTT.mqttConnect("mqtt://mqttbroker", ["/+/status/+/+", "/home-net/system"], {}, {}); //Format for status topics eg. /outlet/status/0/0 (type: outlet number 0, plug 0...)
//MQTT.mqttConnect("mqtt://localhost", ["/+/status/+/+", "/home-net/system"], {}, {}); //Format for status topics eg. /outlet/status/0/0 (type: outlet number 0, plug 0...)
MQTT.find().observe({
    added: function (document) {
        // Do something if needed..this will change when a element is turned on or any published data is changed.
        processTopic(document);
    },
    changed: function (newStatus, oldStatus) {
        //This will only change if something is updated..so it would miss the first time.
        processTopic(newStatus);
    },
    removed: function (oldStatus) {
        //NOOP - not using this for anything yet.
    }
});
/*
 *
 */
Elements.find({'type':'input'}).observe({
    changed: function(document) {
        //console.log(document);
        if (document.status === "OFF") { //on DI's OFF is ERROR.
            var status = "DISARMED";
            if (SystemStatus.findOne() !== undefined) { //Something in the collection
                status = SystemStatus.findOne({}).status; //Find the current state
            }
            if (status === "ARMED") {
                var to = "mnmwatkins@gmail.com;melwat92@gmail.com";
                var message = "Home Net System: Armed <BR>" +
                              "Element: " + document.topic + "<BR>" +
                              "Description: " + document.description + "<BR>" +
                              "Status: " + document.status;
                AlertMail.insert({
                    to: to,
                    message: message,
                    sent: false,
                    createdAt: new Date(),
                    owner: document.username,
                    username: document.username,
                });
            }
        }
    }
});
/*
 * This function finds new entries into the alertmail collection.
 * The fine command is searching for only documents that have not
 * been sent yet.  It then tries to send them via the local sendmail
 * system.
 *
 * input: Non-sent alertmail documents in the collection
 * return: none
 *
 */
AlertMail.find({'sent':false}).observe({
	added: function (document) {
		/* I am using sendmail on the server. Didn't set up the Gmail
		 * configuration here or someother email service; wanted to keep
		 * the credentials for my mail system more abstracted. Besides I have this
		 * setup for other projects; so why not use it?
		*/
		var transporter = Nodemailer.createTransport({
			service: "localhost",
			sendmail: true,
		});
		var mailOptions = {
			from: 'HomeNet',
			subject: 'Alert from HomeNet!',
			html: '<b>DEFUALT MESSAGE</B>', //If I get this email; something is broke.
		};

		var alertMessage = document.message;
		var messageId = document._id;
        var toEmail = document.to;

        mailOptions['to'] = toEmail; //Comes from the database...
		mailOptions['html'] = '<B>' + alertMessage + '<B>';
		transporter.sendMail(mailOptions);
		AlertMail.update(
			{_id : messageId},
			{$set: {'sent':true} }, //Don't delete so you have a record of emails.
		);
		transporter.close();
	}
})
/*
 * This function processes a topic that was recieved via MQTT.
 * The two basic types are status of inputs/outputs and the
 * ability to set the alarm system to auto email if a point
 * is in error.
 *
 * input: mqtt document object
 * return: none
 *
 */
function processTopic(document) {
    const topicRecieved = document.topic;
    if (topicRecieved.includes("home-net")) { //This is used to allow arm and disarming via MQTT request.
        var action = document.message;
        var status = "DISARMED";
        if (SystemStatus.findOne() !== undefined) { //Something in the collection
            status = SystemStatus.findOne({}).status; //Find the current state
        }
        if (status === "ARMED" && action === "DISARM") {
            SystemStatus.upsert({ //Insert or update topics or elements.
                // Selector
                    status: status,
                }, {
                // Modifier
                $set: {
                    status: "DISARMED",
                    createdAt: Date.now() // no need coma here
                }
            });
        } else if (status === "DISARMED" && action === "ARM") {
            SystemStatus.upsert({ //Insert or update topics or elements.
                // Selector
                    status: status,
                }, {
                // Modifier
                $set: {
                    status: "ARMED",
                    createdAt: Date.now() // no need coma here
                }
            });
        }

    } else if (topicRecieved.includes("status")) { //then the mqtt collection must of be cleared..update the element status
        const updateTopic = document.topic.replace("status/",""); //Find root topic..and update it's status
        Elements.upsert(
            {topic: updateTopic},
            {$set:
                {status: document.message}, //Just change the status to the message coming back from the IoT device.
            },
        );
    }
}
