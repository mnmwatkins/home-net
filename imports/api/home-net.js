import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');
export const MQTT = new Mongo.Collection('mqtt');
export const Elements = new Mongo.Collection('elements'); //the I/O IoT elements and thier current state.

Router.route('/', {
    name: 'home',
    template: 'home',
});
Router.route('/modify', {
    name: 'modify',
    template: 'modify',
    data: function() {
            //console.log("opened modify");
    },
});
Router.route('/tasklist', {
    name: 'tasklist',
    template: 'tasklist',
});
Router.route('/configure', {
    name: 'configure',
    template: 'configure',
});
Router.route('/mainfloor', {
    name: 'mainfloor',
    template: 'mainfloor',
});


if (Meteor.isServer) {
    //code only runs on server
    Meteor.publish('tasks',function tasksPublication() {
        return Tasks.find({
            $or: [
                {private: {$ne: true}},
                {owner: this.userId},
            ],
        });
    });
    Meteor.publish('elements',function elementsPublication() {
        return Elements.find({});
    });

    MQTT.mqttConnect("mqtt://localhost", {
    //MQTT.mqttConnect("mqtt://192.168.1.3", {
        insert: true,
        raw: true,
    });
}

Meteor.methods({
    'element.insert'(topic,description,type,signal) {
        check(topic,String);
        check(description,String);
        check(type,String);
        check(signal,String);

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
    'tasks.insert'(text) {
        check(text,String);

        if (! this.userId) { //Logged in?
            throw new Meteor.Error('not-authorized');
        }

        Tasks.insert({
            text,
            createdAt: new Date(),
            owner: this.userId,
            username: Meteor.users.findOne(this.userId).username,
        });
    },
    'tasks.remove'(taskId) {
        check(taskId,String);
        const task = Tasks.findOne(taskId);
        if (task.private && (task.owner !== this.userId)) {
            //if it is private, make sure only the ownder can delete
            throw new Meteor.Error('not-authorized');
        }
        Tasks.remove(taskId);
    },
    'tasks.setChecked'(taskId,setChecked) {
        check(taskId,String);
        check(setChecked,Boolean);
        const task = Tasks.findOne(taskId);
        if (task.private && (task.owner !== this.userId)) {
            // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error('not-authorized');
        }
        Tasks.update(taskId, {$set: {checked: setChecked}});
    },
    'tasks.setPrivate'(taskId, setToPrivate) {
        check(taskId, String);
        check(setToPrivate, Boolean);

        const task = Tasks.findOne(taskId);

        //check owner to verify.
        if (task.owner !== this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, {$set: {private: setToPrivate}});
    },
    'mqtt.send'(topicId,topic) {
        if (!this.userId) { //actually logged in; throw error..
            throw new Meteor.Error('not-authorized');
        }
        const currentStatus = Elements.findOne(topicId);
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
