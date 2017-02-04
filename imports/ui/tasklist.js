import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tasks } from '../api/home-net.js';
import './task.js'; //task list template for each task displayed.
import './header.js'
import './tasklist.html';


Template.tasklist.onCreated(function taskListOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('tasks');
});

Template.tasklist.helpers({
    tasks() {
        const instance = Template.instance();
        if (instance.state.get('hideCompleted')) {
            // If hide completed is checked, filter tasks
            return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
        }
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1} });
    },
    incompleteCount() {
        return Tasks.find({checked: { $ne : true } }).count();
    },
});

Template.tasklist.events({
    'submit .new-task'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        // Insert a task into the collection
        Meteor.call('tasks.insert', text);

        // Clear form
        target.text.value = '';
    },
    'change .hide-completed input'(event, instance) {
        instance.state.set('hideCompleted', event.target.checked);
    },
    'change .toggleOutlet'(event) {
        Meteor.call('mqtt.send',event.target.id,event.target.checked);
    },
    ''(event) {
        console.log(event);
    }
})
