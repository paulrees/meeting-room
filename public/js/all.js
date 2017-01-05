function Errors() {
      this.errors = {};
      this.customErrors = {};

    this.get = function(field) {
      if (this.errors[field]) {
        return this.errors[field][0];
      };
      if (this.customErrors[field]) {
        return this.customErrors[field][0];
      };
    };
    
    this.record = function(errors) {
       this.errors = errors;
    };
    
    this.clear = function(field) {
      delete this.errors[field];
      delete this.customErrors[field];
    }
    
    this.addCustomError = function(field, message) {
      this.customErrors[field] = [message];
    }
    
    this.has = function(field) {
      return this.errors.hasOwnProperty(field);
    }
    
    this.any = function() {
      return Object.keys(this.errors).length > 0;
    }
};
   
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
//# sourceMappingURL=all.js.map
