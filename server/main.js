import { Meteor } from 'meteor/meteor';
import { MQTT } from '../imports/api/home-net.js';
import { Elements } from '../imports/api/home-net.js';

import '../imports/api/home-net.js'

//SERVER MAIN.
Meteor.startup(() => {

});

MQTT.mqttConnect("mqtt://localhost", ["/+/status/+/+"], {}, {}); //Format for status topics eg. /outlet/status/0/0 (type: outlet number 0, plug 0...)
MQTT.find().observe({
    added: function (document) {
        // Do something if needed..this will change when a element is turned on or any published data is changed.
        //console.log('got an add..')
        const topicAdded = document.topic;
        if (topicAdded.includes("status")) { //then the mqtt collection must of be cleared..update the element status
            const updateTopic = document.topic.replace("status/",""); //Find root topic..and update it's status
            //console.log("updateTopic: " + updateTopic);
            Elements.upsert(
                {topic: updateTopic},
                {$set:
                    {status: document.message}, //Just change the status to the message coming back from the IoT device.
                },
            );
        }
    },
    changed: function (newStatus, oldStatus) { //This will only change if something is updated..so it would miss the first time.
        const updateTopic = newStatus.topic.replace("status/",""); //Find root topic..and update it's status
        //console.log("updateTopic: " + updateTopic);
        Elements.upsert(
            {topic: updateTopic},
            {$set:
                {status: newStatus.message}, //Just change the status to the message coming back from the IoT device.
            },
        );
    },
    removed: function (oldStatus) {
        // This will change when an element is turned on or off; it caused an add the immediate remove.
        //console.log('got a remove...')
    }
});
