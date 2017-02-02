import './header.js';
import './register.html'; //template


Template.register.rendered = function() {
    console.log("back in register page.");
};

Template.register.events({
'change .toggleOutlet'(event) {
        Meteor.call('mqtt.send',event.target.id,event.target.checked);
    },
})
