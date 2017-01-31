import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');
export const MQTT = new Mongo.Collection('mqtt');

Router.route('/', {
    name: 'home',
    template: 'home',
});
Router.route('/register');
Router.route('/tasklist');

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

    MQTT.mqttConnect("mqtt://localhost", {
    //MQTT.mqttConnect("mqtt://192.168.1.3", {
        insert: true,
        raw: true,
    });
}


Meteor.methods({
    'tasks.insert'(text) {
        check(text,String);

        if (! this.userId) { //Logged in?
            throw new Meteor.Error('Not-Authorized');
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
    'mqtt.send'(feedId,sendChecked) {
        if (!this.userId) { //actually logged in; throw error..
            throw new Meteor.Error('not-authorized');
        }

        var mqttTopic = "/outlet/" + feedId;
        var mqttMessage = "ON";
        if (!sendChecked) {
            mqttMessage = "OFF";
        }
        MQTT.insert({
          topic: mqttTopic,
          message: mqttMessage,
          broadcast: true,
        });
    },
});
