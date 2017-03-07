import { Template } from 'meteor/templating';
import { Elements } from '../api/home-net.js'; //Task collection
import './header.js';
import './mobile.html'; //template


Template.mobile.rendered = function() {
    //console.log("back in register page.");

};

Template.mobile.onCreated(function configureOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('elements');
});

Template.mobile.helpers({
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
            if (status === 'OFF') {
                return('<td><div class="status" style="background-color: lightgrey">OFF</div></td>');
            } else {
                return('<td><div class="status" style="background-color: green">ON</div></td>');
            }
            var statusDiv = document.getElementById(this.topic); //the id of the div is the same as the topic.
            //Swap color of panel

    },
    toggleState() {
        var statusDiv = document.getElementById(this.topic); //the id of the div is the same as the topic.
        if (statusDiv !== null) {
            if (this.status === "ON") {
                statusDiv.className = "panel panel-success";
            } else {
                statusDiv.className = "panel panel-danger";
            }
        }
    },
});

Template.mobile.events({
    'click .panel-danger,.panel-success,.panel-primary'(event) {
        var statusDiv = document.getElementById(this.topic); //the id of the div is the same as the topic.
        //Swap color of panel
        if (this.status === "ON") {
            statusDiv.className = "panel panel-danger";
        } else {
            statusDiv.className = "panel panel-success";
        }
        //Toggle the output.
        Meteor.call('mqtt.send',this._id,this.topic, function(error, result) {
            if (typeof error != 'undefined') { //we returned an error
                if (error.error === "not-authorized") {
                    Bert.alert( 'Not-Authorized: You must be logged in to modify elements.', 'danger', 'fixed-top', 'fa-frown-o' );
                }
            }
        });
    },

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
