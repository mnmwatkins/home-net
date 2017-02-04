import { Template } from 'meteor/templating';
import { Elements } from '../api/home-net.js'; //Task collection
import './header.js';
import './register.html'; //template


Template.register.rendered = function() {
    //console.log("back in register page.");
};

Template.register.onCreated(function configureOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('elements');
});

Template.register.helpers({
    elements() {
        return Elements.find({}, {sort: {createdAt: -1} });
    },
});

Template.register.events({
'click .toggleOutlet'(event) {
        Meteor.call('mqtt.send',this._id,this.topic, function(error, result) {
            if (typeof error != 'undefined') { //we returned an error
                if (error.error === "not-authorized") {
                    Bert.alert( 'Not-Authorized: You must be logged in to modify elements.', 'danger', 'fixed-top', 'fa-frown-o' );
                }
            }
        });
    },
})
