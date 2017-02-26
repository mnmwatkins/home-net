import { Template } from 'meteor/templating';
import { Elements } from '../api/home-net.js'; //Task collection
import './header.js';
import './modify.html'; //template


Template.modify.rendered = function() {
    //console.log("back in register page.");
};

Template.modify.onCreated(function configureOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('elements');
});

Template.modify.helpers({
    //Return the differnet elements..analog / outputs are not yet defined.
    elements_modify() {
        return Elements.find({ $and: [ {type: { $eq: 'output' }}, {signal: {$eq: 'digital'}} ]}, {sort: {createdAt: -1} });
    },
    elements_monitor() {
        return Elements.find({ $and: [ {type: { $eq: 'input' }}, {signal: {$eq: 'digital'}} ]}, {sort: {createdAt: -1} });
    },
    elements_analog() {
        return Elements.find({ $and: [ {type: { $eq: 'input' }}, {signal: {$eq: 'analog'}} ]}, {sort: {createdAt: -1} });
    },
    if_off(status) {
            if (status == 'OFF') {
                return('<td><div class="status" style="background-color: lightgrey">OFF</div></td>');
            } else {
                return('<td><div class="status" style="background-color: green">ON</div></td>');
            }
    },
});

Template.modify.events({
'click .toggleOutlet'(event) {
        Meteor.call('mqtt.send',this._id,this.topic, function(error, result) {
            if (typeof error != 'undefined') { //we returned an error
                if (error.error === "not-authorized") {
                    Bert.alert( 'Not-Authorized: You must be logged in to modify elements.', 'danger', 'fixed-top', 'fa-frown-o' );
                }
            }
        });
    },
});
