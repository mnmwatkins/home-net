import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const MQTT = new Mongo.Collection('mqtt');
export const Elements = new Mongo.Collection('elements'); //the I/O IoT elements and thier current state.
export const AlertMail = new Mongo.Collection('alertmail');

Router.route('/', {
    name: 'home',
    template: 'home',
});
Router.route('/modify', {
    name: 'modify',
    template: 'modify',
});
Router.route('/configure', {
    name: 'configure',
    template: 'configure',
});
Router.route('/mainfloor', {
    name: 'mainfloor',
    template: 'mainfloor',
});
Router.route('/alertmail', {
    name: 'alertmail',
    template: 'alertmail',
});

if (Meteor.isServer) {
    //code only runs on server
    Meteor.publish('elements',function elementsPublication() {
        return Elements.find({});
    });
    Meteor.publish('alertMessage',function alertMessagePublication() {
        return AlertMail.find({});
    });

    MQTT.mqttConnect("mqtt://localhost", {
    //MQTT.mqttConnect("mqtt://192.168.1.3", {
        insert: true,
        raw: true,
    });
}

Meteor.methods({
    'alertmail.insert'(text, to) {
        AlertMail.insert({
            to: to,
            message: text,
            sent: false,
            createdAt: new Date(),
            owner: this.userId,
            username: Meteor.users.findOne(this.userId).username,
        });
    },
    'alertmail.remove'(messageId) {
        check(messageId,String);
        if (! this.userId) {
            //if it is private, make sure only the ownder can delete
            throw new Meteor.Error('not-authorized');
        }
        AlertMail.remove(messageId);
    },
    'element.insert'(topic,description,type,signal,statusClass) {
        check(topic,String);
        check(description,String);
        check(type,String);
        check(signal,String);
        check(statusClass,String);

        if (! this.userId) { //Logged in?
            throw new Meteor.Error('not-authorized');
        }
        Elements.upsert({ //Insert or update topics or elements.
            // Selector
                topic: topic,
            }, {
            // Modifier
            $set: {
                description: description,
                type: type,
                signal: signal,
                status: null,
                statusClass: statusClass,
                owner: this.userId,
                username: Meteor.users.findOne(this.userId).username,
                createdAt: Date.now() // no need coma here
            }
        });
    },
    'elements.remove'(elementId) {
        check(elementId,String);
        if (! this.userId) {
            //if it is private, make sure only the ownder can delete
            throw new Meteor.Error('not-authorized');
        }
        Elements.remove(elementId);
    },
    'mqtt.send'(topicId,topic) {
        if (!this.userId) { //actually logged in; throw error..
            throw new Meteor.Error('not-authorized');
        }
        const currentStatus = Elements.findOne(topicId); //Find the current status in the database.
        var mqttTopic = topic;

        if (currentStatus.status === null) { //newly defined element, not set yet so force off; then turn allow on..just in case it was left in a strange state.
            MQTT.insert({
              topic: mqttTopic,
              message: "OFF",
              broadcast: true,
            });
            Elements.update(topicId, {$set: {status: 'OFF'}}); //force a status
            return; //Just leave to ensure set up correctly.
        }

        var mqttMessage = "ON";
        if (currentStatus.status === "ON") {
            mqttMessage = "OFF";
        }
        MQTT.insert({
          topic: mqttTopic,
          message: mqttMessage,
          broadcast: true,
        });
    },
});
