
/**
 * First we will load all of this project's JavaScript dependencies which
 * include Vue and Vues Resource. This gives a great starting point for
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

const moment = require('moment')

// Vue.use(require('vue-moment'))



/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the body of the page. From here, you may begin adding components to
 * the application, or feel free to tweak this setup for your needs.
 */

Vue.component('example', require('./components/Example.vue'));

const app = new Vue({
    el: '#app',
    data: {
      calendar: true,
      startTime:"08:00",
      endTime: "",
    },
      methods: {
        incrementStartTime: function() {
          return this.startTime = moment(this.startTime, "HH:mm").add(30, "minutes").format("HH:mm");
        },
        decrementStartTime: function() {
          return this.startTime = moment(this.startTime, "HH:mm").subtract(30, "minutes").format("HH:mm");
        },
        incrementEndTime: function() {
          return this.endTime = moment(this.endTime, "HH:mm").add(30, "minutes").format("HH:mm");
        },
        decrementEndTime: function() {
          return this.endTime = moment(this.endTime, "HH:mm").subtract(30, "minutes").format("HH:mm");
        },
        toggle: function() {
          return this.calendar = !this.calendar;
        }
      },
      computed: {
        returnEndTime: function() {
          return this.endTime = moment(this.startTime, "HH:mm").add(30, "minutes").format("HH:mm");
        }, 
        twoWeeks: function() {
          return !this.calendar;
        }
    }
});
