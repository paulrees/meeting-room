function Errors() {
      this.errors = {};

    this.get = function(field) {
      if (this.errors[field]) {
      return this.errors[field][0];
      };
    };
    
    this.record = function(errors) {
       this.errors = errors;
    };
};
    
    






/**
 * First we will load all of this project's JavaScript dependencies which
 * include Vue and Vues Resource. This gives a great starting point for
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

const moment = require('moment')

// global.jQuery = require('jquery');
// var $ = global.jQuery;
// window.$ = $;

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
      name: "",
      title: "",
      time: "",
      clash: "",
      errors: new Errors(),
    },
      methods: {
        
        onSubmit() {
          axios.post('/events', this.$data)
          
                .catch(error => this.errors.record(error.response.data));
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
        $('input[name="time"]').on('hide.daterangepicker', function(ev, picker) {
          
          app.time = moment(picker.startDate._d).format('Y-MM-DD HH:mm:ss') + " - " + moment(picker.endDate._d).format('Y-MM-DD HH:mm:ss');
          
          var array = $('#calendar').fullCalendar('clientEvents');
          for(i in array){
            if(picker.endDate._d >= array[i].start && picker.startDate._d <= array[i].end){
              
              function Error(message, location) { 
                this.location = [message]
              };
              var theErrorObject = new Error("This booking clashes with an existing meeting hosted by " + array[i].name, clash);
              app.errors.record(theErrorObject);
                          } 
          }
      });
        
      }
    
    
});

$(function () {
	$('input[name="time"]').daterangepicker({
		"minDate": moment().startOf('hour').format('Y-MM-DD HH:mm:ss'),
		"timePicker": true,
		"timePicker24Hour": true,
		"timePickerIncrement": 30,
		"autoApply": true,
		"locale": {
			"format": "YYYY-MM-DD HH:mm:ss",
			"separator": " - ",
		}
	});
});

