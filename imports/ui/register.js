import './header.html';
import './register.html'; //template

Template.register.events({
'change .toggleOutlet'(event) {
        Meteor.call('mqtt.send',event.target.id,event.target.checked);
    },
})
