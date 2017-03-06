import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { AlertMail } from '../api/home-net.js'; //Task collection
import './mail.js';
import './header.js';
import './alertmail.html'; //template


Template.alertmail.onCreated(function alertmailOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('alertMessage'); //server side data on create.
});

Template.alertmail.helpers({
    alertMessage() {
        return AlertMail.find();
    },
});

Template.alertmail.events({
    'submit .new-msg'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;
        const to = target.to.value;

        // Insert a message into the collection
        Meteor.call('alertmail.insert', text, to);

        // Clear form
        target.text.value = '';
        target.to.value = '';
    },
});
