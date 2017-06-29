import { Template } from 'meteor/templating';
import { SystemStatus } from '../api/home-net.js'; //Task collection
import { EnableAuto } from '../api/home-net.js'; //Task collection
import './header.html'

Template.header.onCreated(function headerOnCreated() {
    Meteor.subscribe('systemStatus');
    Meteor.subscribe('enableAuto');
});

Template.header.helpers({
    current_status() {
        var status = "DISARMED";
        if (SystemStatus.findOne() !== undefined) { //Something in the collection
            status = SystemStatus.findOne({}).status; //Find the current state
        }
        return(status);
    },
    ifArmed(status) {
        if (status == 'ARMED') {
            return('<button type="submit" id="DISARMED" class="btn btn-sm btn-danger toggleArmed">Disarm System</button>');
            //return('<td><div class="status" style="background-color: lightgrey">OFF</div></td>');
        } else {
            return('<button type="submit" id="ARMED" class="btn btn-sm btn-defualt toggleArmed">Arm System</button>');
            //return('<td><div class="status" style="background-color: green">ON</div></td>');
        }
    },
    auto_status() {
        var status = "DISABLED";
        if (EnableAuto.findOne() !== undefined) { //Something in the collection
            status = EnableAuto.findOne({}).status; //Find the current state
        }
        return(status);
    },
    ifEnabled(status) {
        if (status == 'ENABLED') {
            return('<button type="submit" id="DISABLED" class="btn btn-sm btn-success toggleAuto">Disable Lights</button>');
            //return('<td><div class="status" style="background-color: lightgrey">OFF</div></td>');
        } else {
            return('<button type="submit" id="ENABLED" class="btn btn-sm btn-defualt toggleAuto">Enable Lights</button>');
            //return('<td><div class="status" style="background-color: green">ON</div></td>');
        }
    },
});
Template.header.events({
    'click .toggleArmed'(event) {
        var target = event.target;

        Meteor.call('systemstatus.update',target.id, function(error, result) {
            if (typeof error != 'undefined') { //we returned an error
                if (error.error === "not-authorized") {
                    Bert.alert( 'Not-Authorized: You must be logged in to modify elements.', 'danger', 'fixed-top', 'fa-frown-o' );
                }
            }
        });

    },
    'click .toggleAuto'(event) {
        var target = event.target;

        Meteor.call('enableauto.update',target.id, function(error, result) {
            if (typeof error != 'undefined') { //we returned an error
                if (error.error === "not-authorized") {
                    Bert.alert( 'Not-Authorized: You must be logged in to modify elements.', 'danger', 'fixed-top', 'fa-frown-o' );
                }
            }
        });

    },
});
