import { Template } from 'meteor/templating';
import { Elements } from '../api/home-net.js'; //Task collection
import './header.js';
import './mainfloor.html'; //template


Template.mainfloor.rendered = function() {
    //console.log("back in register page.");
};

Template.mainfloor.onCreated(function configureOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('elements');
});

Template.mainfloor.helpers({
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
    if_open(topic,status) {
        //This is where I define the topic to be equivalent to a location; should be configured in DB, but it is hard coded for now.
        if (topic === '/switch/0/0') { //front door.
            if (status == 'OFF') {
                return('<td><div class="frontDoor" style="background-color: red">DOOR<BR>(OPENED)</div></td>');
            } else {
                return('<td><div class="frontDoor" style="background-color: lightgreen">DOOR<BR>(CLOSED)</div></td>');
            }
        }
    },
});
