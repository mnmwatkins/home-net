import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Elements } from '../api/home-net.js';
import './element.js'; //element list template for each element displayed.
import './header.js'
import './configure.html'; //Template for configure page/route.

//This will disable the enter key on the text fields from triggering the submit event.
$(document).ready(function() {
  $(window).keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
});

Template.configure.onCreated(function taskListOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('elements');
})

Template.configure.events({
    'submit .new-element'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form elements
        const target = event.target;
        const topic = target.topic.value;
        const description = target.description.value
        const type = target.type.value;
        const signal = target.signal.value;

        if (topic === "" || description === "") {
            Bert.alert( 'You must enter: Topic and Description', 'danger', 'fixed-top', 'fa-frown-o' );
            return;
        }

        console.log(topic);
        console.log(description);
        console.log(type);
        console.log(signal);


        // Insert a element into the collection (see home-net.js)
        Meteor.call('element.insert', topic,description,type,signal);

        // Clear form
        target.topic.value = '';
        target.description.value = '';
        target.type.value = 'output';
        target.signal.value = 'digital';
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
