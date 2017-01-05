$('input[name="time"]').on('hide.daterangepicker', function(ev, picker) {
          
  app.time = moment(picker.startDate._d).format('Y-MM-DD HH:mm:ss') + " - " + moment(picker.endDate._d).format('Y-MM-DD HH:mm:ss');
  
  var array = $('#calendar').fullCalendar('clientEvents');
  for(i in array){
    if(picker.endDate._d >= array[i].start && picker.startDate._d <= array[i].end){
      function CustomError(message, field) { 
        this.message = message;
        this.field = field;
      };
      var clashError = new CustomError("This booking clashes with an existing meeting hosted by " + array[i].name, 'clash');
      app.errors.addCustomError(clashError);
    } else {
      app.errors.clear('clash');
    }
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