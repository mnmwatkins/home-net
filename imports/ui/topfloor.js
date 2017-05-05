import { Template } from 'meteor/templating';
import { Elements } from '../api/home-net.js'; //Task collection
import './header.js';
import './topfloor.html'; //template


Template.topfloor.rendered = function() {
    //console.log("back in register page.");
};

Template.topfloor.onCreated(function configureOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('elements');
});

Template.topfloor.helpers({
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
        /*
        if (topic === '/switch/0/0') { //front door.
            if (status == 'OFF') {
                returnTD = "<td><div class=" + statusClass + " style='background-color: red'>DOOR<BR>(OPENED)</div></td>";
            } else {
                returnTD = "<td><div class=" + statusClass + " style='background-color: lightgreen'>DOOR<BR>(CLOSED)</div></td>";
            }
        } else if (topic === '/switch/0/1') { //motion sensor
            if (status == 'OFF') {
                returnTD = "<td><div class=" + statusClass + " style='background-color: red'>Motion Detected!</div></td>";
            } else {
                returnTD = "<td><div class=" + statusClass + " style='background-color: lightgreen'>Nothing Detected</div></td>";
            }
        } else {
            if (statusClass) { //something we have defined to monitor..via the config page in the collection and the main.css file..
                if (status == 'OFF') {
                    returnTD = "<td><div class=" + statusClass + " style='background-color: red'>" + topic + "<BR>" + this.description + "</div></td>";
                } else {
                    returnTD = "<td><div class=" + statusClass + " style='background-color: lightgreen'>" + topic +"<BR>" + this.description + "</div></td>";
                }
            }
        }
        */
        return(returnTD);
    },
    notAuthorized() {
            Bert.alert('To view this page; you must login.', 'danger', 'fixed-top', 'fa-frown-o' );
    },
});
Template.topfloor.events({
'click '(event) {
        if (event.target.className) {
            //format the div class to a valid topic..
            var mqttTopic = "/" + event.target.className.replace(/[0-9]/g, function myFunction(x){return "/"+x;});
            Meteor.call('mqtt.send',this._id,mqttTopic, function(error, result) {
                if (typeof error != 'undefined') { //we returned an error
                    if (error.error === "not-authorized") {
                        Bert.alert( 'Not-Authorized: You must be logged in to modify elements.', 'danger', 'fixed-top', 'fa-frown-o' );
                    }
                }
            });
        }
    },
});
