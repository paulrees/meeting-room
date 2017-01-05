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
    startTime: "08:00",
    endTime: "",
    name: "",
    title: "",
    time: "",
    clash: "",
    errors: new Errors(),
  },
  methods: {

    onSubmit(uri) {
      axios.post(uri, this.$data)
      .then(this.onSuccess)
      .catch(error => this.errors.record(error.response.data))
    },
    onSuccess(response) {
      this.name = "";
      this.title = "";
      $('#calendar').fullCalendar('refetchEvents');
    },
    onEdit(uri) {
      axios.put(uri, this.$data)
      .then(this.onEditSuccess)
      .catch(error => this.errors.record(error.response.data))
    },
    onEditSuccess() {
      window.location.href="/home";
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
  mounted() {
    $('input[name="time"]').on('hide.daterangepicker', function(ev, picker) {
      setDateAndTime(picker);
      var eventsArray = $('#calendar').fullCalendar('clientEvents');
      checkForClash(eventsArray, picker);
    });
  }
});

var setDateAndTime = function(picker) {
  app.time = moment(picker.startDate._d).format('Y-MM-DD HH:mm:ss') + " - " + moment(picker.endDate._d).format('Y-MM-DD HH:mm:ss');

}

var checkForClash = function(eventsArray, picker) {
  for (i in eventsArray) {
    if (picker.endDate._d >= eventsArray[i].start && picker.startDate._d <= eventsArray[i].end) {
      var clashMessage = "This booking clashes with an existing meeting hosted by " + eventsArray[i].name;
      app.errors.addCustomError('clash', clashMessage);
    }
    else {
      app.errors.clear('clash');
    }
  }
}


