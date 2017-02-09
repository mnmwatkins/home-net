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

Template.configure.onCreated(function configureOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('elements');
});

Template.configure.helpers({
    elements() {
        return Elements.find({}, {sort: {createdAt: -1} });
    },
});


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
        const statusClass = target.statusClass.value;

        if (topic === "" || description === "") {
            Bert.alert( 'You must enter: Topic and Description', 'danger', 'fixed-top', 'fa-frown-o' );
            return;
        }

        // Insert a element into the collection (see home-net.js)
        Meteor.call('element.insert', topic,description,type,signal,statusClass);

        // Clear form
        target.topic.value = '';
        target.description.value = '';
        target.type.value = 'output';
        target.signal.value = 'digital';
    },
})
