import { Template } from 'meteor/templating';
import { AlertMail } from '../api/home-net.js'; //Task collection
import './alertmail.html'; //template

Template.alertmail.helpers({
    isOwner() {
        return this.owner === Meteor.userId();
    },
});

Template.alertmail.events({
    'submit .new-msg'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        // Insert a message into the collection
        Meteor.call('alertmail.insert', text);

        // Clear form
        target.text.value = '';
    },
    /*
    'click .toggle-checked'() {
        // Set the checked property to the opposite of its current value
        Meteor.call('tasks.setChecked', this._id, !this.checked);
    },
    'click .delete'() {
        Meteor.call('tasks.remove', this._id);
    },
    'click .toggle-private'() {
        Meteor.call('tasks.setPrivate', this._id, !this.private);
    },
    */
});
