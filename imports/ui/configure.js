import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Elements } from '../api/home-net.js';
import './element.js'; //element list template for each element displayed.
import './header.js'
import './configure.html'; //Template for configure page/route.


Template.configure.onCreated(function taskListOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('elements');
})
