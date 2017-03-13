import { Template } from 'meteor/templating';
import { Elements } from '../api/home-net.js'; //Elements collection
import './element.html'; //template

Template.element.helpers({
    isOwner() {
        return this.owner === Meteor.userId();
    },
});

Template.element.events({
    'click .delete-element'() {
        Meteor.call('elements.remove', this._id, function(error, result) {
            if (typeof error != 'undefined') { //we returned an error
                if (error.error === "not-authorized") {
                    Bert.alert( 'Not-Authorized: You must be logged in to delete elements.', 'danger', 'fixed-top', 'fa-frown-o' );
                }
            }
        });
    },
});
