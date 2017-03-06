import { Template } from 'meteor/templating';
import { AlertMail } from '../api/home-net.js'; //Task collection
import './mail.html'; //template

Template.mail.helpers({
    isOwner() {
        return this.owner === Meteor.userId();
    },
});

Template.mail.events({
    'click .delete-alertmail'() {
        Meteor.call('alertmail.remove', this._id, function(error, result) {
            if (typeof error != 'undefined') { //we returned an error
                if (error.error === "not-authorized") {
                    Bert.alert( 'Not-Authorized: You must be logged in to delete elements.', 'danger', 'fixed-top', 'fa-frown-o' );
                }
            }
        });
    },
});
