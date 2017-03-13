import { Template } from 'meteor/templating';
import { SystemStatus } from '../api/home-net.js'; //Task collection
import './header.html'

Template.header.onCreated(function headerOnCreated() {
    Meteor.subscribe('systemStatus');
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
});
Template.header.events({
    'click .toggleArmed'(event) {
        var target = event.target;
        var armSystem = target.checked;

        Meteor.call('systemstatus.update',target.id, function(error, result) {
            if (typeof error != 'undefined') { //we returned an error
                if (error.error === "not-authorized") {
                    Bert.alert( 'Not-Authorized: You must be logged in to modify elements.', 'danger', 'fixed-top', 'fa-frown-o' );
                }
            }
        });

    },
});
