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
    
    this.addCustomError = function(error) {
      this.customErrors[error.field] = [error.message];
    }
    
    this.has = function(field) {
      return this.errors.hasOwnProperty(field);
    }
    
    this.any = function() {
      return Object.keys(this.errors).length > 0;
    }
};
   