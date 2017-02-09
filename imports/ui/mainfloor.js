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
    /*
    elements_modify() {
        return Elements.find({ $and: [ {type: { $eq: 'output' }}, {signal: {$eq: 'digital'}} ]}, {sort: {createdAt: -1} });
    },
    elements_monitor() {
        return Elements.find({ $and: [ {type: { $eq: 'input' }}, {signal: {$eq: 'digital'}} ]}, {sort: {createdAt: -1} });
    },
    elements_analog() {
        return Elements.find({ $and: [ {type: { $eq: 'input' }}, {signal: {$eq: 'analog'}} ]}, {sort: {createdAt: -1} });
    },
    */
    elements_monitor() {
        return Elements.find({ $and: [ {signal: {$eq: 'digital'}} ]}, {sort: {createdAt: -1} });
    },
    if_open(topic,status,statusClass) {
        /*
            The class comes from the element collections; what ever is defined there must exist in the main.class
            file to give it a location, etc.
            You can set up unique actions by topic or by default based only on status (ie. ON or OFF..)
        */
        var returnTD = "";
        if (topic === '/switch/0/0') { //front door.
            if (status == 'OFF') {
                returnTD = "<td><div class=" + statusClass + " style='background-color: red'>DOOR<BR>(OPENED)</div></td>";
            } else {
                returnTD = "<td><div class=" + statusClass + " style='background-color: lightgreen'>DOOR<BR>(CLOSED)</div></td>";
            }
        } else if (topic === '/switch/0/1') { //motion sensor
            if (status == 'OFF') {
                returnTD = "<td><div class=" + statusClass + " style='background-color: lightgreen'>Nothing Detected</div></td>";
            } else {
                returnTD = "<td><div class=" + statusClass + " style='background-color: red'>Motion Detected!</div></td>";
            }
        } else {
            if (statusClass) { //something we have defined to monitor..via the config page in the collection and the main.css file..
                if (status == 'OFF') {
                    returnTD = "<td><div class=" + statusClass + " style='background-color: red'>" + topic +" - ELEMENT OFF</div></td>";
                } else {
                    returnTD = "<td><div class=" + statusClass + " style='background-color: lightgreen'>" + topic +" - ELEMENT ON</div></td>";
                }
            }
        }
        return(returnTD);
    },
});
