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