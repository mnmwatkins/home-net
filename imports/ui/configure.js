import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Elements } from '../api/home-net.js';
import './element.js'; //element list template for each element displayed.
import './header.js'
import './configure.html'; //Template for configure page/route.


Template.configure.onCreated(function taskListOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('elements');
})

Template.configure.events({
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
