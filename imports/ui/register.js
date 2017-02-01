import './header.js';
import './register.html'; //template


Template.register.rendered = function() {
    var el = $("checkbox");
    console.log(el);
    el.removeClass('toggleOutlet');
    el.addClass('toggleOutlet');
};

Template.register.events({
'change .toggleOutlet'(event) {
        Meteor.call('mqtt.send',event.target.id,event.target.checked);
    },
})
