/**
 * First we will load all of this project's JavaScript dependencies which
 * include Vue and Vues Resource. This gives a great starting point for
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');


const moment = require('moment')
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
      name: "",
      title: "",
      time: "",
      clash: "",
      errors: new Errors(),
    },
      methods: {
        
        onSubmit() {
          axios.post('/events', this.$data)
          
                .then(this.onSuccess)
          
                .catch(error => this.errors.record(error.response.data))
        },
        onSuccess(response) {
          this.name = "";
          this.title = "";
          $('#calendar').fullCalendar('refetchEvents');
        }
      },
      computed: {
        returnEndTime() {
          return this.endTime = moment(this.startTime, "HH:mm").add(30, "minutes").format("HH:mm");
        }, 
        twoWeeks() {
          return !this.calendar;
        }
      },
      mounted () {
      }
});


