/**
* @version: 2.1.13
* @author: Dan Grossman http://www.dangrossman.info/
* @copyright: Copyright (c) 2012-2015 Dan Grossman. All rights reserved.
* @license: Licensed under the MIT license. See http://www.opensource.org/licenses/mit-license.php
* @website: https://www.improvely.com/
*/

(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['moment', 'jquery', 'exports'], function(momentjs, $, exports) {
      root.daterangepicker = factory(root, exports, momentjs, $);
    });

  } else if (typeof exports !== 'undefined') {
      var momentjs = require('moment');
      var jQuery = (typeof window != 'undefined') ? window.jQuery : undefined;  //isomorphic issue
      if (!jQuery) {
          try {
              jQuery = require('jquery');
              if (!jQuery.fn) jQuery.fn = {}; //isomorphic issue
          } catch (err) {
              if (!jQuery) throw new Error('jQuery dependency not found');
          }
      }

    factory(root, exports, momentjs, jQuery);

  // Finally, as a browser global.
  } else {
    root.daterangepicker = factory(root, {}, root.moment || moment, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this || {}, function(root, daterangepicker, moment, $) { // 'this' doesn't exist on a server

    var DateRangePicker = function(element, options, cb) {

        //default settings for options
        this.parentEl = 'body';
        this.element = $(element);
        this.startDate = moment().startOf('day');
        this.endDate = moment().endOf('day');
        this.minDate = false;
        this.maxDate = false;
        this.dateLimit = false;
        this.autoApply = false;
        this.singleDatePicker = false;
        this.showDropdowns = false;
        this.showWeekNumbers = false;
        this.timePicker = false;
        this.timePicker24Hour = false;
        this.timePickerIncrement = 1;
        this.timePickerSeconds = false;
        this.linkedCalendars = true;
        this.autoUpdateInput = true;
        this.ranges = {};

        this.opens = 'right';
        if (this.element.hasClass('pull-right'))
            this.opens = 'left';

        this.drops = 'down';
        if (this.element.hasClass('dropup'))
            this.drops = 'up';

        this.buttonClasses = 'btn btn-sm';
        this.applyClass = 'btn-success';
        this.cancelClass = 'btn-default';

        this.locale = {
            format: 'MM/DD/YYYY',
            separator: ' - ',
            applyLabel: 'Apply',
            cancelLabel: 'Cancel',
            weekLabel: 'W',
            customRangeLabel: 'Custom Range',
            daysOfWeek: moment.weekdaysMin(),
            monthNames: moment.monthsShort(),
            firstDay: moment.localeData().firstDayOfWeek()
        };

        this.callback = function() { };

        //some state information
        this.isShowing = false;
        this.leftCalendar = {};
        this.rightCalendar = {};

        //custom options from user
        if (typeof options !== 'object' || options === null)
            options = {};

        //allow setting options with data attributes
        //data-api options will be overwritten with custom javascript options
        options = $.extend(this.element.data(), options);

        //html template for the picker UI
        if (typeof options.template !== 'string')
            options.template = '<div class="daterangepicker dropdown-menu">' +
                '<div class="calendar left">' +
                    '<div class="daterangepicker_input">' +
                      '<input class="input-mini" type="text" name="daterangepicker_start" value="" />' +
                      '<i class="fa fa-calendar glyphicon glyphicon-calendar"></i>' +
                      '<div class="calendar-time">' +
                        '<div></div>' +
                        '<i class="fa fa-clock-o glyphicon glyphicon-time"></i>' +
                      '</div>' +
                    '</div>' +
                    '<div class="calendar-table"></div>' +
                '</div>' +
                '<div class="calendar right">' +
                    '<div class="daterangepicker_input">' +
                      '<input class="input-mini" type="text" name="daterangepicker_end" value="" />' +
                      '<i class="fa fa-calendar glyphicon glyphicon-calendar"></i>' +
                      '<div class="calendar-time">' +
                        '<div></div>' +
                        '<i class="fa fa-clock-o glyphicon glyphicon-time"></i>' +
                      '</div>' +
                    '</div>' +
                    '<div class="calendar-table"></div>' +
                '</div>' +
                '<div class="ranges">' +
                    '<div class="range_inputs">' +
                        '<button class="applyBtn" disabled="disabled" type="button"></button> ' +
                        '<button class="cancelBtn" type="button"></button>' +
                    '</div>' +
                '</div>' +
            '</div>';

        this.parentEl = (options.parentEl && $(options.parentEl).length) ? $(options.parentEl) : $(this.parentEl);
        this.container = $(options.template).appendTo(this.parentEl);

        //
        // handle all the possible options overriding defaults
        //

        if (typeof options.locale === 'object') {

            if (typeof options.locale.format === 'string')
                this.locale.format = options.locale.format;

            if (typeof options.locale.separator === 'string')
                this.locale.separator = options.locale.separator;

            if (typeof options.locale.daysOfWeek === 'object')
                this.locale.daysOfWeek = options.locale.daysOfWeek.slice();

            if (typeof options.locale.monthNames === 'object')
              this.locale.monthNames = options.locale.monthNames.slice();

            if (typeof options.locale.firstDay === 'number')
              this.locale.firstDay = options.locale.firstDay;

            if (typeof options.locale.applyLabel === 'string')
              this.locale.applyLabel = options.locale.applyLabel;

            if (typeof options.locale.cancelLabel === 'string')
              this.locale.cancelLabel = options.locale.cancelLabel;

            if (typeof options.locale.weekLabel === 'string')
              this.locale.weekLabel = options.locale.weekLabel;

            if (typeof options.locale.customRangeLabel === 'string')
              this.locale.customRangeLabel = options.locale.customRangeLabel;

        }

        if (typeof options.startDate === 'string')
            this.startDate = moment(options.startDate, this.locale.format);

        if (typeof options.endDate === 'string')
            this.endDate = moment(options.endDate, this.locale.format);

        if (typeof options.minDate === 'string')
            this.minDate = moment(options.minDate, this.locale.format);

        if (typeof options.maxDate === 'string')
            this.maxDate = moment(options.maxDate, this.locale.format);

        if (typeof options.startDate === 'object')
            this.startDate = moment(options.startDate);

        if (typeof options.endDate === 'object')
            this.endDate = moment(options.endDate);

        if (typeof options.minDate === 'object')
            this.minDate = moment(options.minDate);

        if (typeof options.maxDate === 'object')
            this.maxDate = moment(options.maxDate);

        // sanity check for bad options
        if (this.minDate && this.startDate.isBefore(this.minDate))
            this.startDate = this.minDate.clone();

        // sanity check for bad options
        if (this.maxDate && this.endDate.isAfter(this.maxDate))
            this.endDate = this.maxDate.clone();

        if (typeof options.applyClass === 'string')
            this.applyClass = options.applyClass;

        if (typeof options.cancelClass === 'string')
            this.cancelClass = options.cancelClass;

        if (typeof options.dateLimit === 'object')
            this.dateLimit = options.dateLimit;

        if (typeof options.opens === 'string')
            this.opens = options.opens;

        if (typeof options.drops === 'string')
            this.drops = options.drops;

        if (typeof options.showWeekNumbers === 'boolean')
            this.showWeekNumbers = options.showWeekNumbers;

        if (typeof options.buttonClasses === 'string')
            this.buttonClasses = options.buttonClasses;

        if (typeof options.buttonClasses === 'object')
            this.buttonClasses = options.buttonClasses.join(' ');

        if (typeof options.showDropdowns === 'boolean')
            this.showDropdowns = options.showDropdowns;

        if (typeof options.singleDatePicker === 'boolean') {
            this.singleDatePicker = options.singleDatePicker;
            if (this.singleDatePicker)
                this.endDate = this.startDate.clone();
        }

        if (typeof options.timePicker === 'boolean')
            this.timePicker = options.timePicker;

        if (typeof options.timePickerSeconds === 'boolean')
            this.timePickerSeconds = options.timePickerSeconds;

        if (typeof options.timePickerIncrement === 'number')
            this.timePickerIncrement = options.timePickerIncrement;

        if (typeof options.timePicker24Hour === 'boolean')
            this.timePicker24Hour = options.timePicker24Hour;

        if (typeof options.autoApply === 'boolean')
            this.autoApply = options.autoApply;

        if (typeof options.autoUpdateInput === 'boolean')
            this.autoUpdateInput = options.autoUpdateInput;

        if (typeof options.linkedCalendars === 'boolean')
            this.linkedCalendars = options.linkedCalendars;

        if (typeof options.isInvalidDate === 'function')
            this.isInvalidDate = options.isInvalidDate;

        // update day names order to firstDay
        if (this.locale.firstDay != 0) {
            var iterator = this.locale.firstDay;
            while (iterator > 0) {
                this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                iterator--;
            }
        }

        var start, end, range;

        //if no start/end dates set, check if an input element contains initial values
        if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
            if ($(this.element).is('input[type=text]')) {
                var val = $(this.element).val(),
                    split = val.split(this.locale.separator);

                start = end = null;

                if (split.length == 2) {
                    start = moment(split[0], this.locale.format);
                    end = moment(split[1], this.locale.format);
                } else if (this.singleDatePicker && val !== "") {
                    start = moment(val, this.locale.format);
                    end = moment(val, this.locale.format);
                }
                if (start !== null && end !== null) {
                    this.setStartDate(start);
                    this.setEndDate(end);
                }
            }
        }

        if (typeof options.ranges === 'object') {
            for (range in options.ranges) {

                if (typeof options.ranges[range][0] === 'string')
                    start = moment(options.ranges[range][0], this.locale.format);
                else
                    start = moment(options.ranges[range][0]);

                if (typeof options.ranges[range][1] === 'string')
                    end = moment(options.ranges[range][1], this.locale.format);
                else
                    end = moment(options.ranges[range][1]);

                // If the start or end date exceed those allowed by the minDate or dateLimit
                // options, shorten the range to the allowable period.
                if (this.minDate && start.isBefore(this.minDate))
                    start = this.minDate.clone();

                var maxDate = this.maxDate;
                if (this.dateLimit && start.clone().add(this.dateLimit).isAfter(maxDate))
                    maxDate = start.clone().add(this.dateLimit);
                if (maxDate && end.isAfter(maxDate))
                    end = maxDate.clone();

                // If the end of the range is before the minimum or the start of the range is
                // after the maximum, don't display this range option at all.
                if ((this.minDate && end.isBefore(this.minDate)) || (maxDate && start.isAfter(maxDate)))
                    continue;
                
                //Support unicode chars in the range names.
                var elem = document.createElement('textarea');
                elem.innerHTML = range;
                var rangeHtml = elem.value;

                this.ranges[rangeHtml] = [start, end];
            }

            var list = '<ul>';
            for (range in this.ranges) {
                list += '<li>' + range + '</li>';
            }
            list += '<li>' + this.locale.customRangeLabel + '</li>';
            list += '</ul>';
            this.container.find('.ranges').prepend(list);
        }

        if (typeof cb === 'function') {
            this.callback = cb;
        }

        if (!this.timePicker) {
            this.startDate = this.startDate.startOf('day');
            this.endDate = this.endDate.endOf('day');
            this.container.find('.calendar-time').hide();
        }

        //can't be used together for now
        if (this.timePicker && this.autoApply)
            this.autoApply = false;

        if (this.autoApply && typeof options.ranges !== 'object') {
            this.container.find('.ranges').hide();
        } else if (this.autoApply) {
            this.container.find('.applyBtn, .cancelBtn').addClass('hide');
        }

        if (this.singleDatePicker) {
            this.container.addClass('single');
            this.container.find('.calendar.left').addClass('single');
            this.container.find('.calendar.left').show();
            this.container.find('.calendar.right').hide();
            this.container.find('.daterangepicker_input input, .daterangepicker_input i').hide();
            if (!this.timePicker) {
                this.container.find('.ranges').hide();
            }
        }

        if (typeof options.ranges === 'undefined' && !this.singleDatePicker) {
            this.container.addClass('show-calendar');
        }

        this.container.addClass('opens' + this.opens);

        //swap the position of the predefined ranges if opens right
        if (typeof options.ranges !== 'undefined' && this.opens == 'right') {
            var ranges = this.container.find('.ranges');
            var html = ranges.clone();
            ranges.remove();
            this.container.find('.calendar.left').parent().prepend(html);
        }

        //apply CSS classes and labels to buttons
        this.container.find('.applyBtn, .cancelBtn').addClass(this.buttonClasses);
        if (this.applyClass.length)
            this.container.find('.applyBtn').addClass(this.applyClass);
        if (this.cancelClass.length)
            this.container.find('.cancelBtn').addClass(this.cancelClass);
        this.container.find('.applyBtn').html(this.locale.applyLabel);
        this.container.find('.cancelBtn').html(this.locale.cancelLabel);

        //
        // event listeners
        //

        this.container.find('.calendar')
            .on('click.daterangepicker', '.prev', $.proxy(this.clickPrev, this))
            .on('click.daterangepicker', '.next', $.proxy(this.clickNext, this))
            .on('click.daterangepicker', 'td.available', $.proxy(this.clickDate, this))
            .on('mouseenter.daterangepicker', 'td.available', $.proxy(this.hoverDate, this))
            .on('mouseleave.daterangepicker', 'td.available', $.proxy(this.updateFormInputs, this))
            .on('change.daterangepicker', 'select.yearselect', $.proxy(this.monthOrYearChanged, this))
            .on('change.daterangepicker', 'select.monthselect', $.proxy(this.monthOrYearChanged, this))
            .on('change.daterangepicker', 'select.hourselect,select.minuteselect,select.secondselect,select.ampmselect', $.proxy(this.timeChanged, this))
            .on('click.daterangepicker', '.daterangepicker_input input', $.proxy(this.showCalendars, this))
            //.on('keyup.daterangepicker', '.daterangepicker_input input', $.proxy(this.formInputsChanged, this))
            .on('change.daterangepicker', '.daterangepicker_input input', $.proxy(this.formInputsChanged, this));

        this.container.find('.ranges')
            .on('click.daterangepicker', 'button.applyBtn', $.proxy(this.clickApply, this))
            .on('click.daterangepicker', 'button.cancelBtn', $.proxy(this.clickCancel, this))
            .on('click.daterangepicker', 'li', $.proxy(this.clickRange, this))
            .on('mouseenter.daterangepicker', 'li', $.proxy(this.hoverRange, this))
            .on('mouseleave.daterangepicker', 'li', $.proxy(this.updateFormInputs, this));

        if (this.element.is('input')) {
            this.element.on({
                'click.daterangepicker': $.proxy(this.show, this),
                'focus.daterangepicker': $.proxy(this.show, this),
                'keyup.daterangepicker': $.proxy(this.elementChanged, this),
                'keydown.daterangepicker': $.proxy(this.keydown, this)
            });
        } else {
            this.element.on('click.daterangepicker', $.proxy(this.toggle, this));
        }

        //
        // if attached to a text input, set the initial value
        //

        if (this.element.is('input') && !this.singleDatePicker && this.autoUpdateInput) {
            this.element.val(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format));
            this.element.trigger('change');
        } else if (this.element.is('input') && this.autoUpdateInput) {
            this.element.val(this.startDate.format(this.locale.format));
            this.element.trigger('change');
        }

    };

    DateRangePicker.prototype = {

        constructor: DateRangePicker,

        setStartDate: function(startDate) {
            if (typeof startDate === 'string')
                this.startDate = moment(startDate, this.locale.format);

            if (typeof startDate === 'object')
                this.startDate = moment(startDate);

            if (!this.timePicker)
                this.startDate = this.startDate.startOf('day');

            if (this.timePicker && this.timePickerIncrement)
                this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);

            if (this.minDate && this.startDate.isBefore(this.minDate))
                this.startDate = this.minDate;

            if (this.maxDate && this.startDate.isAfter(this.maxDate))
                this.startDate = this.maxDate;

            if (!this.isShowing)
                this.updateElement();

            this.updateMonthsInView();
        },

        setEndDate: function(endDate) {
            if (typeof endDate === 'string')
                this.endDate = moment(endDate, this.locale.format);

            if (typeof endDate === 'object')
                this.endDate = moment(endDate);

            if (!this.timePicker)
                this.endDate = this.endDate.endOf('day');

            if (this.timePicker && this.timePickerIncrement)
                this.endDate.minute(Math.round(this.endDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);

            if (this.endDate.isBefore(this.startDate))
                this.endDate = this.startDate.clone();

            if (this.maxDate && this.endDate.isAfter(this.maxDate))
                this.endDate = this.maxDate;

            if (this.dateLimit && this.startDate.clone().add(this.dateLimit).isBefore(this.endDate))
                this.endDate = this.startDate.clone().add(this.dateLimit);

            if (!this.isShowing)
                this.updateElement();

            this.updateMonthsInView();
        },

        isInvalidDate: function() {
            return false;
        },

        updateView: function() {
            if (this.timePicker) {
                this.renderTimePicker('left');
                this.renderTimePicker('right');
                if (!this.endDate) {
                    this.container.find('.right .calendar-time select').attr('disabled', 'disabled').addClass('disabled');
                } else {
                    this.container.find('.right .calendar-time select').removeAttr('disabled').removeClass('disabled');
                }
            }
            if (this.endDate) {
                this.container.find('input[name="daterangepicker_end"]').removeClass('active');
                this.container.find('input[name="daterangepicker_start"]').addClass('active');
            } else {
                this.container.find('input[name="daterangepicker_end"]').addClass('active');
                this.container.find('input[name="daterangepicker_start"]').removeClass('active');
            }
            this.updateMonthsInView();
            this.updateCalendars();
            this.updateFormInputs();
        },

        updateMonthsInView: function() {
            if (this.endDate) {

                //if both dates are visible already, do nothing
                if (!this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month &&
                    (this.startDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.startDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
                    &&
                    (this.endDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.endDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
                    ) {
                    return;
                }

                this.leftCalendar.month = this.startDate.clone().date(2);
                if (!this.linkedCalendars && (this.endDate.month() != this.startDate.month() || this.endDate.year() != this.startDate.year())) {
                    this.rightCalendar.month = this.endDate.clone().date(2);
                } else {
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }
                
            } else {
                if (this.leftCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM') && this.rightCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM')) {
                    this.leftCalendar.month = this.startDate.clone().date(2);
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }
            }
        },

        updateCalendars: function() {

            if (this.timePicker) {
                var hour, minute, second;
                if (this.endDate) {
                    hour = parseInt(this.container.find('.left .hourselect').val(), 10);
                    minute = parseInt(this.container.find('.left .minuteselect').val(), 10);
                    second = this.timePickerSeconds ? parseInt(this.container.find('.left .secondselect').val(), 10) : 0;
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.left .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                } else {
                    hour = parseInt(this.container.find('.right .hourselect').val(), 10);
                    minute = parseInt(this.container.find('.right .minuteselect').val(), 10);
                    second = this.timePickerSeconds ? parseInt(this.container.find('.right .secondselect').val(), 10) : 0;
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.right .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                }
                this.leftCalendar.month.hour(hour).minute(minute).second(second);
                this.rightCalendar.month.hour(hour).minute(minute).second(second);
            }

            this.renderCalendar('left');
            this.renderCalendar('right');

            //highlight any predefined range matching the current start and end dates
            this.container.find('.ranges li').removeClass('active');
            if (this.endDate == null) return;

            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
                if (this.timePicker) {
                    if (this.startDate.isSame(this.ranges[range][0]) && this.endDate.isSame(this.ranges[range][1])) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').html();
                        break;
                    }
                } else {
                    //ignore times when comparing dates if time picker is not enabled
                    if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').html();
                        break;
                    }
                }
                i++;
            }
            if (customRange) {
                this.chosenLabel = this.container.find('.ranges li:last').addClass('active').html();
                this.showCalendars();
            }

        },

        renderCalendar: function(side) {

            //
            // Build the matrix of dates that will populate the calendar
            //

            var calendar = side == 'left' ? this.leftCalendar : this.rightCalendar;
            var month = calendar.month.month();
            var year = calendar.month.year();
            var hour = calendar.month.hour();
            var minute = calendar.month.minute();
            var second = calendar.month.second();
            var daysInMonth = moment([year, month]).daysInMonth();
            var firstDay = moment([year, month, 1]);
            var lastDay = moment([year, month, daysInMonth]);
            var lastMonth = moment(firstDay).subtract(1, 'month').month();
            var lastYear = moment(firstDay).subtract(1, 'month').year();
            var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
            var dayOfWeek = firstDay.day();

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = [];
            calendar.firstDay = firstDay;
            calendar.lastDay = lastDay;

            for (var i = 0; i < 6; i++) {
                calendar[i] = [];
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]);

            var col, row;
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
                if (i > 0 && col % 7 === 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
                curDate.hour(12);

                if (this.minDate && calendar[row][col].format('YYYY-MM-DD') == this.minDate.format('YYYY-MM-DD') && calendar[row][col].isBefore(this.minDate) && side == 'left') {
                    calendar[row][col] = this.minDate.clone();
                }

                if (this.maxDate && calendar[row][col].format('YYYY-MM-DD') == this.maxDate.format('YYYY-MM-DD') && calendar[row][col].isAfter(this.maxDate) && side == 'right') {
                    calendar[row][col] = this.maxDate.clone();
                }

            }

            //make the calendar object available to hoverDate/clickDate
            if (side == 'left') {
                this.leftCalendar.calendar = calendar;
            } else {
                this.rightCalendar.calendar = calendar;
            }

            //
            // Display the calendar
            //

            var minDate = side == 'left' ? this.minDate : this.startDate;
            var maxDate = this.maxDate;
            var selected = side == 'left' ? this.startDate : this.endDate;

            var html = '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';

            // add empty cell for week number
            if (this.showWeekNumbers)
                html += '<th></th>';

            if ((!minDate || minDate.isBefore(calendar.firstDay)) && (!this.linkedCalendars || side == 'left')) {
                html += '<th class="prev available"><i class="fa fa-chevron-left glyphicon glyphicon-chevron-left"></i></th>';
            } else {
                html += '<th></th>';
            }

            var dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

            if (this.showDropdowns) {
                var currentMonth = calendar[1][1].month();
                var currentYear = calendar[1][1].year();
                var maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
                var minYear = (minDate && minDate.year()) || (currentYear - 50);
                var inMinYear = currentYear == minYear;
                var inMaxYear = currentYear == maxYear;

                var monthHtml = '<select class="monthselect">';
                for (var m = 0; m < 12; m++) {
                    if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            ">" + this.locale.monthNames[m] + "</option>";
                    } else {
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            " disabled='disabled'>" + this.locale.monthNames[m] + "</option>";
                    }
                }
                monthHtml += "</select>";

                var yearHtml = '<select class="yearselect">';
                for (var y = minYear; y <= maxYear; y++) {
                    yearHtml += '<option value="' + y + '"' +
                        (y === currentYear ? ' selected="selected"' : '') +
                        '>' + y + '</option>';
                }
                yearHtml += '</select>';

                dateHtml = monthHtml + yearHtml;
            }

            html += '<th colspan="5" class="month">' + dateHtml + '</th>';
            if ((!maxDate || maxDate.isAfter(calendar.lastDay)) && (!this.linkedCalendars || side == 'right' || this.singleDatePicker)) {
                html += '<th class="next available"><i class="fa fa-chevron-right glyphicon glyphicon-chevron-right"></i></th>';
            } else {
                html += '<th></th>';
            }

            html += '</tr>';
            html += '<tr>';

            // add week number label
            if (this.showWeekNumbers)
                html += '<th class="week">' + this.locale.weekLabel + '</th>';

            $.each(this.locale.daysOfWeek, function(index, dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            //adjust maxDate to reflect the dateLimit setting in order to
            //grey out end dates beyond the dateLimit
            if (this.endDate == null && this.dateLimit) {
                var maxLimit = this.startDate.clone().add(this.dateLimit).endOf('day');
                if (!maxDate || maxLimit.isBefore(maxDate)) {
                    maxDate = maxLimit;
                }
            }

            for (var row = 0; row < 6; row++) {
                html += '<tr>';

                // add week number
                if (this.showWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].week() + '</td>';

                for (var col = 0; col < 7; col++) {

                    var classes = [];

                    //highlight today's date
                    if (calendar[row][col].isSame(new Date(), "day"))
                        classes.push('today');

                    //highlight weekends
                    if (calendar[row][col].isoWeekday() > 5)
                        classes.push('weekend');

                    //grey out the dates in other months displayed at beginning and end of this calendar
                    if (calendar[row][col].month() != calendar[1][1].month())
                        classes.push('off');

                    //don't allow selection of dates before the minimum date
                    if (this.minDate && calendar[row][col].isBefore(this.minDate, 'day'))
                        classes.push('off', 'disabled');

                    //don't allow selection of dates after the maximum date
                    if (maxDate && calendar[row][col].isAfter(maxDate, 'day'))
                        classes.push('off', 'disabled');

                    //don't allow selection of date if a custom function decides it's invalid
                    if (this.isInvalidDate(calendar[row][col]))
                        classes.push('off', 'disabled');

                    //highlight the currently selected start date
                    if (calendar[row][col].format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD'))
                        classes.push('active', 'start-date');

                    //highlight the currently selected end date
                    if (this.endDate != null && calendar[row][col].format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD'))
                        classes.push('active', 'end-date');

                    //highlight dates in-between the selected dates
                    if (this.endDate != null && calendar[row][col] > this.startDate && calendar[row][col] < this.endDate)
                        classes.push('in-range');

                    var cname = '', disabled = false;
                    for (var i = 0; i < classes.length; i++) {
                        cname += classes[i] + ' ';
                        if (classes[i] == 'disabled')
                            disabled = true;
                    }
                    if (!disabled)
                        cname += 'available';

                    html += '<td class="' + cname.replace(/^\s+|\s+$/g, '') + '" data-title="' + 'r' + row + 'c' + col + '">' + calendar[row][col].date() + '</td>';

                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';

            this.container.find('.calendar.' + side + ' .calendar-table').html(html);

        },

        renderTimePicker: function(side) {

            var html, selected, minDate, maxDate = this.maxDate;

            if (this.dateLimit && (!this.maxDate || this.startDate.clone().add(this.dateLimit).isAfter(this.maxDate)))
                maxDate = this.startDate.clone().add(this.dateLimit);

            if (side == 'left') {
                selected = this.startDate.clone();
                minDate = this.minDate;
            } else if (side == 'right') {
                selected = this.endDate ? this.endDate.clone() : this.startDate.clone();
                minDate = this.startDate;
            }

            //
            // hours
            //

            html = '<select class="hourselect">';

            var start = this.timePicker24Hour ? 0 : 1;
            var end = this.timePicker24Hour ? 23 : 12;

            for (var i = start; i <= end; i++) {
                var i_in_24 = i;
                if (!this.timePicker24Hour)
                    i_in_24 = selected.hour() >= 12 ? (i == 12 ? 12 : i + 12) : (i == 12 ? 0 : i);

                var time = selected.clone().hour(i_in_24);
                var disabled = false;
                if (minDate && time.minute(59).isBefore(minDate))
                    disabled = true;
                if (maxDate && time.minute(0).isAfter(maxDate))
                    disabled = true;

                if (i_in_24 == selected.hour() && !disabled) {
                    html += '<option value="' + i + '" selected="selected">' + i + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + i + '</option>';
                } else {
                    html += '<option value="' + i + '">' + i + '</option>';
                }
            }

            html += '</select> ';

            //
            // minutes
            //

            html += ': <select class="minuteselect">';

            for (var i = 0; i < 60; i += this.timePickerIncrement) {
                var padded = i < 10 ? '0' + i : i;
                var time = selected.clone().minute(i);

                var disabled = false;
                if (minDate && time.second(59).isBefore(minDate))
                    disabled = true;
                if (maxDate && time.second(0).isAfter(maxDate))
                    disabled = true;

                if (selected.minute() == i && !disabled) {
                    html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                } else {
                    html += '<option value="' + i + '">' + padded + '</option>';
                }
            }

            html += '</select> ';

            //
            // seconds
            //

            if (this.timePickerSeconds) {
                html += ': <select class="secondselect">';

                for (var i = 0; i < 60; i++) {
                    var padded = i < 10 ? '0' + i : i;
                    var time = selected.clone().second(i);

                    var disabled = false;
                    if (minDate && time.isBefore(minDate))
                        disabled = true;
                    if (maxDate && time.isAfter(maxDate))
                        disabled = true;

                    if (selected.second() == i && !disabled) {
                        html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                    } else if (disabled) {
                        html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + padded + '</option>';
                    }
                }

                html += '</select> ';
            }

            //
            // AM/PM
            //

            if (!this.timePicker24Hour) {
                html += '<select class="ampmselect">';

                var am_html = '';
                var pm_html = '';

                if (minDate && selected.clone().hour(12).minute(0).second(0).isBefore(minDate))
                    am_html = ' disabled="disabled" class="disabled"';

                if (maxDate && selected.clone().hour(0).minute(0).second(0).isAfter(maxDate))
                    pm_html = ' disabled="disabled" class="disabled"';

                if (selected.hour() >= 12) {
                    html += '<option value="AM"' + am_html + '>AM</option><option value="PM" selected="selected"' + pm_html + '>PM</option>';
                } else {
                    html += '<option value="AM" selected="selected"' + am_html + '>AM</option><option value="PM"' + pm_html + '>PM</option>';
                }

                html += '</select>';
            }

            this.container.find('.calendar.' + side + ' .calendar-time div').html(html);

        },

        updateFormInputs: function() {

            //ignore mouse movements while an above-calendar text input has focus
            if (this.container.find('input[name=daterangepicker_start]').is(":focus") || this.container.find('input[name=daterangepicker_end]').is(":focus"))
                return;

            this.container.find('input[name=daterangepicker_start]').val(this.startDate.format(this.locale.format));
            if (this.endDate)
                this.container.find('input[name=daterangepicker_end]').val(this.endDate.format(this.locale.format));

            if (this.singleDatePicker || (this.endDate && (this.startDate.isBefore(this.endDate) || this.startDate.isSame(this.endDate)))) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }

        },

        move: function() {
            var parentOffset = { top: 0, left: 0 },
                containerTop;
            var parentRightEdge = $(window).width();
            if (!this.parentEl.is('body')) {
                parentOffset = {
                    top: this.parentEl.offset().top - this.parentEl.scrollTop(),
                    left: this.parentEl.offset().left - this.parentEl.scrollLeft()
                };
                parentRightEdge = this.parentEl[0].clientWidth + this.parentEl.offset().left;
            }

            if (this.drops == 'up')
                containerTop = this.element.offset().top - this.container.outerHeight() - parentOffset.top;
            else
                containerTop = this.element.offset().top + this.element.outerHeight() - parentOffset.top;
            this.container[this.drops == 'up' ? 'addClass' : 'removeClass']('dropup');

            if (this.opens == 'left') {
                this.container.css({
                    top: containerTop,
                    right: parentRightEdge - this.element.offset().left - this.element.outerWidth(),
                    left: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else if (this.opens == 'center') {
                this.container.css({
                    top: containerTop,
                    left: this.element.offset().left - parentOffset.left + this.element.outerWidth() / 2
                            - this.container.outerWidth() / 2,
                    right: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else {
                this.container.css({
                    top: containerTop,
                    left: this.element.offset().left - parentOffset.left,
                    right: 'auto'
                });
                if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
                    this.container.css({
                        left: 'auto',
                        right: 0
                    });
                }
            }
        },

        show: function(e) {
            if (this.isShowing) return;

            // Create a click proxy that is private to this instance of datepicker, for unbinding
            this._outsideClickProxy = $.proxy(function(e) { this.outsideClick(e); }, this);

            // Bind global datepicker mousedown for hiding and
            $(document)
              .on('mousedown.daterangepicker', this._outsideClickProxy)
              // also support mobile devices
              .on('touchend.daterangepicker', this._outsideClickProxy)
              // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
              .on('click.daterangepicker', '[data-toggle=dropdown]', this._outsideClickProxy)
              // and also close when focus changes to outside the picker (eg. tabbing between controls)
              .on('focusin.daterangepicker', this._outsideClickProxy);

            // Reposition the picker if the window is resized while it's open
            $(window).on('resize.daterangepicker', $.proxy(function(e) { this.move(e); }, this));

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();

            this.updateView();
            this.container.show();
            this.move();
            this.element.trigger('show.daterangepicker', this);
            this.isShowing = true;
        },

        hide: function(e) {
            if (!this.isShowing) return;

            //incomplete date selection, revert to last values
            if (!this.endDate) {
                this.startDate = this.oldStartDate.clone();
                this.endDate = this.oldEndDate.clone();
            }

            //if a new date range was selected, invoke the user callback function
            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.callback(this.startDate, this.endDate, this.chosenLabel);

            //if picker is attached to a text input, update it
            this.updateElement();

            $(document).off('.daterangepicker');
            $(window).off('.daterangepicker');
            this.container.hide();
            this.element.trigger('hide.daterangepicker', this);
            this.isShowing = false;
        },

        toggle: function(e) {
            if (this.isShowing) {
                this.hide();
            } else {
                this.show();
            }
        },

        outsideClick: function(e) {
            var target = $(e.target);
            // if the page is clicked anywhere except within the daterangerpicker/button
            // itself then call this.hide()
            if (
                // ie modal dialog fix
                e.type == "focusin" ||
                target.closest(this.element).length ||
                target.closest(this.container).length ||
                target.closest('.calendar-table').length
                ) return;
            this.hide();
        },

        showCalendars: function() {
            this.container.addClass('show-calendar');
            this.move();
            this.element.trigger('showCalendar.daterangepicker', this);
        },

        hideCalendars: function() {
            this.container.removeClass('show-calendar');
            this.element.trigger('hideCalendar.daterangepicker', this);
        },

        hoverRange: function(e) {

            //ignore mouse movements while an above-calendar text input has focus
            if (this.container.find('input[name=daterangepicker_start]').is(":focus") || this.container.find('input[name=daterangepicker_end]').is(":focus"))
                return;

            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.updateView();
            } else {
                var dates = this.ranges[label];
                this.container.find('input[name=daterangepicker_start]').val(dates[0].format(this.locale.format));
                this.container.find('input[name=daterangepicker_end]').val(dates[1].format(this.locale.format));
            }
            
        },

        clickRange: function(e) {
            var label = e.target.innerHTML;
            this.chosenLabel = label;
            if (label == this.locale.customRangeLabel) {
                this.showCalendars();
            } else {
                var dates = this.ranges[label];
                this.startDate = dates[0];
                this.endDate = dates[1];

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.endOf('day');
                }

                this.hideCalendars();
                this.clickApply();
            }
        },

        clickPrev: function(e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.subtract(1, 'month');
                if (this.linkedCalendars)
                    this.rightCalendar.month.subtract(1, 'month');
            } else {
                this.rightCalendar.month.subtract(1, 'month');
            }
            this.updateCalendars();
        },

        clickNext: function(e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add(1, 'month');
            } else {
                this.rightCalendar.month.add(1, 'month');
                if (this.linkedCalendars)
                    this.leftCalendar.month.add(1, 'month');
            }
            this.updateCalendars();
        },

        hoverDate: function(e) {

            //ignore mouse movements while an above-calendar text input has focus
            if (this.container.find('input[name=daterangepicker_start]').is(":focus") || this.container.find('input[name=daterangepicker_end]').is(":focus"))
                return;

            //ignore dates that can't be selected
            if (!$(e.target).hasClass('available')) return;

            //have the text inputs above calendars reflect the date being hovered over
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');
            var date = cal.hasClass('left') ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];

            if (this.endDate) {
                this.container.find('input[name=daterangepicker_start]').val(date.format(this.locale.format));
            } else {
                this.container.find('input[name=daterangepicker_end]').val(date.format(this.locale.format));
            }

            //highlight the dates between the start date and the date being hovered as a potential end date
            var leftCalendar = this.leftCalendar;
            var rightCalendar = this.rightCalendar;
            var startDate = this.startDate;
            if (!this.endDate) {
                this.container.find('.calendar td').each(function(index, el) {

                    //skip week numbers, only look at dates
                    if ($(el).hasClass('week')) return;

                    var title = $(el).attr('data-title');
                    var row = title.substr(1, 1);
                    var col = title.substr(3, 1);
                    var cal = $(el).parents('.calendar');
                    var dt = cal.hasClass('left') ? leftCalendar.calendar[row][col] : rightCalendar.calendar[row][col];

                    if (dt.isAfter(startDate) && dt.isBefore(date)) {
                        $(el).addClass('in-range');
                    } else {
                        $(el).removeClass('in-range');
                    }

                });
            }

        },

        clickDate: function(e) {

            if (!$(e.target).hasClass('available')) return;

            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');
            var date = cal.hasClass('left') ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];

            //
            // this function needs to do a few things:
            // * alternate between selecting a start and end date for the range,
            // * if the time picker is enabled, apply the hour/minute/second from the select boxes to the clicked date
            // * if autoapply is enabled, and an end date was chosen, apply the selection
            // * if single date picker mode, and time picker isn't enabled, apply the selection immediately
            //

            if (this.endDate || date.isBefore(this.startDate)) {
                if (this.timePicker) {
                    var hour = parseInt(this.container.find('.left .hourselect').val(), 10);
                    if (!this.timePicker24Hour) {
                        var ampm = cal.find('.ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                    var minute = parseInt(this.container.find('.left .minuteselect').val(), 10);
                    var second = this.timePickerSeconds ? parseInt(this.container.find('.left .secondselect').val(), 10) : 0;
                    date = date.clone().hour(hour).minute(minute).second(second);
                }
                this.endDate = null;
                this.setStartDate(date.clone());
            } else {
                if (this.timePicker) {
                    var hour = parseInt(this.container.find('.right .hourselect').val(), 10);
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.right .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                    var minute = parseInt(this.container.find('.right .minuteselect').val(), 10);
                    var second = this.timePickerSeconds ? parseInt(this.container.find('.right .secondselect').val(), 10) : 0;
                    date = date.clone().hour(hour).minute(minute).second(second);
                }
                this.setEndDate(date.clone());
                if (this.autoApply)
                    this.clickApply();
            }

            if (this.singleDatePicker) {
                this.setEndDate(this.startDate);
                if (!this.timePicker)
                    this.clickApply();
            }

            this.updateView();

        },

        clickApply: function(e) {
            this.hide();
            this.element.trigger('apply.daterangepicker', this);
        },

        clickCancel: function(e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.hide();
            this.element.trigger('cancel.daterangepicker', this);
        },

        monthOrYearChanged: function(e) {
            var isLeft = $(e.target).closest('.calendar').hasClass('left'),
                leftOrRight = isLeft ? 'left' : 'right',
                cal = this.container.find('.calendar.'+leftOrRight);

            // Month must be Number for new moment versions
            var month = parseInt(cal.find('.monthselect').val(), 10);
            var year = cal.find('.yearselect').val();

            if (!isLeft) {
                if (year < this.startDate.year() || (year == this.startDate.year() && month < this.startDate.month())) {
                    month = this.startDate.month();
                    year = this.startDate.year();
                }
            }

            if (this.minDate) {
                if (year < this.minDate.year() || (year == this.minDate.year() && month < this.minDate.month())) {
                    month = this.minDate.month();
                    year = this.minDate.year();
                }
            }

            if (this.maxDate) {
                if (year > this.maxDate.year() || (year == this.maxDate.year() && month > this.maxDate.month())) {
                    month = this.maxDate.month();
                    year = this.maxDate.year();
                }
            }

            if (isLeft) {
                this.leftCalendar.month.month(month).year(year);
                if (this.linkedCalendars)
                    this.rightCalendar.month = this.leftCalendar.month.clone().add(1, 'month');
            } else {
                this.rightCalendar.month.month(month).year(year);
                if (this.linkedCalendars)
                    this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, 'month');
            }
            this.updateCalendars();
        },

        timeChanged: function(e) {

            var cal = $(e.target).closest('.calendar'),
                isLeft = cal.hasClass('left');

            var hour = parseInt(cal.find('.hourselect').val(), 10);
            var minute = parseInt(cal.find('.minuteselect').val(), 10);
            var second = this.timePickerSeconds ? parseInt(cal.find('.secondselect').val(), 10) : 0;

            if (!this.timePicker24Hour) {
                var ampm = cal.find('.ampmselect').val();
                if (ampm === 'PM' && hour < 12)
                    hour += 12;
                if (ampm === 'AM' && hour === 12)
                    hour = 0;
            }

            if (isLeft) {
                var start = this.startDate.clone();
                start.hour(hour);
                start.minute(minute);
                start.second(second);
                this.setStartDate(start);
                if (this.singleDatePicker) {
                    this.endDate = this.startDate.clone();
                } else if (this.endDate && this.endDate.format('YYYY-MM-DD') == start.format('YYYY-MM-DD') && this.endDate.isBefore(start)) {
                    this.setEndDate(start.clone());
                }
            } else if (this.endDate) {
                var end = this.endDate.clone();
                end.hour(hour);
                end.minute(minute);
                end.second(second);
                this.setEndDate(end);
            }

            //update the calendars so all clickable dates reflect the new time component
            this.updateCalendars();

            //update the form inputs above the calendars with the new time
            this.updateFormInputs();

            //re-render the time pickers because changing one selection can affect what's enabled in another
            this.renderTimePicker('left');
            this.renderTimePicker('right');

        },

        formInputsChanged: function(e) {
            var isRight = $(e.target).closest('.calendar').hasClass('right');
            var start = moment(this.container.find('input[name="daterangepicker_start"]').val(), this.locale.format);
            var end = moment(this.container.find('input[name="daterangepicker_end"]').val(), this.locale.format);

            if (start.isValid() && end.isValid()) {

                if (isRight && end.isBefore(start))
                    start = end.clone();

                this.setStartDate(start);
                this.setEndDate(end);

                if (isRight) {
                    this.container.find('input[name="daterangepicker_start"]').val(this.startDate.format(this.locale.format));
                } else {
                    this.container.find('input[name="daterangepicker_end"]').val(this.endDate.format(this.locale.format));
                }

            }

            this.updateCalendars();
            if (this.timePicker) {
                this.renderTimePicker('left');
                this.renderTimePicker('right');
            }
        },

        elementChanged: function() {
            if (!this.element.is('input')) return;
            if (!this.element.val().length) return;
            if (this.element.val().length < this.locale.format.length) return;

            var dateString = this.element.val().split(this.locale.separator),
                start = null,
                end = null;

            if (dateString.length === 2) {
                start = moment(dateString[0], this.locale.format);
                end = moment(dateString[1], this.locale.format);
            }

            if (this.singleDatePicker || start === null || end === null) {
                start = moment(this.element.val(), this.locale.format);
                end = start;
            }

            if (!start.isValid() || !end.isValid()) return;

            this.setStartDate(start);
            this.setEndDate(end);
            this.updateView();
        },

        keydown: function(e) {
            //hide on tab or enter
            if ((e.keyCode === 9) || (e.keyCode === 13)) {
                this.hide();
            }
        },

        updateElement: function() {
            if (this.element.is('input') && !this.singleDatePicker && this.autoUpdateInput) {
                this.element.val(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format));
                this.element.trigger('change');
            } else if (this.element.is('input') && this.autoUpdateInput) {
                this.element.val(this.startDate.format(this.locale.format));
                this.element.trigger('change');
            }
        },

        remove: function() {
            this.container.remove();
            this.element.off('.daterangepicker');
            this.element.removeData();
        }

    };

    $.fn.daterangepicker = function(options, callback) {
        this.each(function() {
            var el = $(this);
            if (el.data('daterangepicker'))
                el.data('daterangepicker').remove();
            el.data('daterangepicker', new DateRangePicker(el, options, callback));
        });
        return this;
    };

}));

var eventServices = angular.module('eventServices', ['ngResource']);

eventServices.factory('Event', ['$resource',
	function($resource){
		return $resource('/api', {}, {
		query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
	});
}]);
/*!
 * FullCalendar v3.1.0
 * Docs & License: http://fullcalendar.io/
 * (c) 2016 Adam Shaw
 */
!function(t){"function"==typeof define&&define.amd?define(["jquery","moment"],t):"object"==typeof exports?module.exports=t(require("jquery"),require("moment")):t(jQuery,moment)}(function(t,e){function n(t){return q(t,$t)}function i(t,e){e.left&&t.css({"border-left-width":1,"margin-left":e.left-1}),e.right&&t.css({"border-right-width":1,"margin-right":e.right-1})}function r(t){t.css({"margin-left":"","margin-right":"","border-left-width":"","border-right-width":""})}function s(){t("body").addClass("fc-not-allowed")}function o(){t("body").removeClass("fc-not-allowed")}function l(e,n,i){var r=Math.floor(n/e.length),s=Math.floor(n-r*(e.length-1)),o=[],l=[],u=[],c=0;a(e),e.each(function(n,i){var a=n===e.length-1?s:r,d=t(i).outerHeight(!0);d<a?(o.push(i),l.push(d),u.push(t(i).height())):c+=d}),i&&(n-=c,r=Math.floor(n/o.length),s=Math.floor(n-r*(o.length-1))),t(o).each(function(e,n){var i=e===o.length-1?s:r,a=l[e],c=u[e],d=i-(a-c);a<i&&t(n).height(d)})}function a(t){t.height("")}function u(e){var n=0;return e.find("> *").each(function(e,i){var r=t(i).outerWidth();r>n&&(n=r)}),n++,e.width(n),n}function c(t,e){var n,i=t.add(e);return i.css({position:"relative",left:-1}),n=t.outerHeight()-e.outerHeight(),i.css({position:"",left:""}),n}function d(e){var n=e.css("position"),i=e.parents().filter(function(){var e=t(this);return/(auto|scroll)/.test(e.css("overflow")+e.css("overflow-y")+e.css("overflow-x"))}).eq(0);return"fixed"!==n&&i.length?i:t(e[0].ownerDocument||document)}function h(t,e){var n=t.offset(),i=n.left-(e?e.left:0),r=n.top-(e?e.top:0);return{left:i,right:i+t.outerWidth(),top:r,bottom:r+t.outerHeight()}}function f(t,e){var n=t.offset(),i=p(t),r=n.left+y(t,"border-left-width")+i.left-(e?e.left:0),s=n.top+y(t,"border-top-width")+i.top-(e?e.top:0);return{left:r,right:r+t[0].clientWidth,top:s,bottom:s+t[0].clientHeight}}function g(t,e){var n=t.offset(),i=n.left+y(t,"border-left-width")+y(t,"padding-left")-(e?e.left:0),r=n.top+y(t,"border-top-width")+y(t,"padding-top")-(e?e.top:0);return{left:i,right:i+t.width(),top:r,bottom:r+t.height()}}function p(t){var e=t.innerWidth()-t[0].clientWidth,n={left:0,right:0,top:0,bottom:t.innerHeight()-t[0].clientHeight};return v()&&"rtl"==t.css("direction")?n.left=e:n.right=e,n}function v(){return null===Qt&&(Qt=m()),Qt}function m(){var e=t("<div><div/></div>").css({position:"absolute",top:-1e3,left:0,border:0,padding:0,overflow:"scroll",direction:"rtl"}).appendTo("body"),n=e.children(),i=n.offset().left>e.offset().left;return e.remove(),i}function y(t,e){return parseFloat(t.css(e))||0}function S(t){return 1==t.which&&!t.ctrlKey}function w(t){if(void 0!==t.pageX)return t.pageX;var e=t.originalEvent.touches;return e?e[0].pageX:void 0}function E(t){if(void 0!==t.pageY)return t.pageY;var e=t.originalEvent.touches;return e?e[0].pageY:void 0}function b(t){return/^touch/.test(t.type)}function D(t){t.addClass("fc-unselectable").on("selectstart",T)}function T(t){t.preventDefault()}function C(t){return!!window.addEventListener&&(window.addEventListener("scroll",t,!0),!0)}function H(t){return!!window.removeEventListener&&(window.removeEventListener("scroll",t,!0),!0)}function R(t,e){var n={left:Math.max(t.left,e.left),right:Math.min(t.right,e.right),top:Math.max(t.top,e.top),bottom:Math.min(t.bottom,e.bottom)};return n.left<n.right&&n.top<n.bottom&&n}function x(t,e){return{left:Math.min(Math.max(t.left,e.left),e.right),top:Math.min(Math.max(t.top,e.top),e.bottom)}}function I(t){return{left:(t.left+t.right)/2,top:(t.top+t.bottom)/2}}function k(t,e){return{left:t.left-e.left,top:t.top-e.top}}function L(e){var n,i,r=[],s=[];for("string"==typeof e?s=e.split(/\s*,\s*/):"function"==typeof e?s=[e]:t.isArray(e)&&(s=e),n=0;n<s.length;n++)i=s[n],"string"==typeof i?r.push("-"==i.charAt(0)?{field:i.substring(1),order:-1}:{field:i,order:1}):"function"==typeof i&&r.push({func:i});return r}function M(t,e,n){var i,r;for(i=0;i<n.length;i++)if(r=B(t,e,n[i]))return r;return 0}function B(t,e,n){return n.func?n.func(t,e):z(t[n.field],e[n.field])*(n.order||1)}function z(e,n){return e||n?null==n?-1:null==e?1:"string"===t.type(e)||"string"===t.type(n)?String(e).localeCompare(String(n)):e-n:0}function F(t,e){var n,i,r,s,o=t.start,l=t.end,a=e.start,u=e.end;if(l>a&&o<u)return o>=a?(n=o.clone(),r=!0):(n=a.clone(),r=!1),l<=u?(i=l.clone(),s=!0):(i=u.clone(),s=!1),{start:n,end:i,isStart:r,isEnd:s}}function N(t,n){return e.duration({days:t.clone().stripTime().diff(n.clone().stripTime(),"days"),ms:t.time()-n.time()})}function G(t,n){return e.duration({days:t.clone().stripTime().diff(n.clone().stripTime(),"days")})}function O(t,n,i){return e.duration(Math.round(t.diff(n,i,!0)),i)}function A(t,e){var n,i,r;for(n=0;n<Kt.length&&(i=Kt[n],r=V(i,t,e),!(r>=1&&ot(r)));n++);return i}function V(t,n,i){return null!=i?i.diff(n,t,!0):e.isDuration(n)?n.as(t):n.end.diff(n.start,t,!0)}function P(t,e,n){var i;return W(n)?(e-t)/n:(i=n.asMonths(),Math.abs(i)>=1&&ot(i)?e.diff(t,"months",!0)/i:e.diff(t,"days",!0)/n.asDays())}function _(t,e){var n,i;return W(t)||W(e)?t/e:(n=t.asMonths(),i=e.asMonths(),Math.abs(n)>=1&&ot(n)&&Math.abs(i)>=1&&ot(i)?n/i:t.asDays()/e.asDays())}function Y(t,n){var i;return W(t)?e.duration(t*n):(i=t.asMonths(),Math.abs(i)>=1&&ot(i)?e.duration({months:i*n}):e.duration({days:t.asDays()*n}))}function W(t){return Boolean(t.hours()||t.minutes()||t.seconds()||t.milliseconds())}function U(t){return"[object Date]"===Object.prototype.toString.call(t)||t instanceof Date}function j(t){return/^\d+\:\d+(?:\:\d+\.?(?:\d{3})?)?$/.test(t)}function q(t,e){var n,i,r,s,o,l,a={};if(e)for(n=0;n<e.length;n++){for(i=e[n],r=[],s=t.length-1;s>=0;s--)if(o=t[s][i],"object"==typeof o)r.unshift(o);else if(void 0!==o){a[i]=o;break}r.length&&(a[i]=q(r))}for(n=t.length-1;n>=0;n--){l=t[n];for(i in l)i in a||(a[i]=l[i])}return a}function Z(t){var e=function(){};return e.prototype=t,new e}function $(t,e){for(var n in t)Q(t,n)&&(e[n]=t[n])}function Q(t,e){return Jt.call(t,e)}function X(e){return/undefined|null|boolean|number|string/.test(t.type(e))}function K(e,n,i){if(t.isFunction(e)&&(e=[e]),e){var r,s;for(r=0;r<e.length;r++)s=e[r].apply(n,i)||s;return s}}function J(){for(var t=0;t<arguments.length;t++)if(void 0!==arguments[t])return arguments[t]}function tt(t){return(t+"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#039;").replace(/"/g,"&quot;").replace(/\n/g,"<br />")}function et(t){return t.replace(/&.*?;/g,"")}function nt(e){var n=[];return t.each(e,function(t,e){null!=e&&n.push(t+":"+e)}),n.join(";")}function it(e){var n=[];return t.each(e,function(t,e){null!=e&&n.push(t+'="'+tt(e)+'"')}),n.join(" ")}function rt(t){return t.charAt(0).toUpperCase()+t.slice(1)}function st(t,e){return t-e}function ot(t){return t%1===0}function lt(t,e){var n=t[e];return function(){return n.apply(t,arguments)}}function at(t,e,n){var i,r,s,o,l,a=function(){var u=+new Date-o;u<e?i=setTimeout(a,e-u):(i=null,n||(l=t.apply(s,r),s=r=null))};return function(){s=this,r=arguments,o=+new Date;var u=n&&!i;return i||(i=setTimeout(a,e)),u&&(l=t.apply(s,r),s=r=null),l}}function ut(n,i,r){var s,o,l,a,u=n[0],c=1==n.length&&"string"==typeof u;return e.isMoment(u)||U(u)||void 0===u?a=e.apply(null,n):(s=!1,o=!1,c?te.test(u)?(u+="-01",n=[u],s=!0,o=!0):(l=ee.exec(u))&&(s=!l[5],o=!0):t.isArray(u)&&(o=!0),a=i||s?e.utc.apply(e,n):e.apply(null,n),s?(a._ambigTime=!0,a._ambigZone=!0):r&&(o?a._ambigZone=!0:c&&a.utcOffset(u))),a._fullCalendar=!0,a}function ct(t,e){return ie.format.call(t,e)}function dt(t,e){return ht(t,mt(e))}function ht(t,e){var n,i="";for(n=0;n<e.length;n++)i+=ft(t,e[n]);return i}function ft(t,e){var n,i;return"string"==typeof e?e:(n=e.token)?se[n]?se[n](t):ct(t,n):e.maybe&&(i=ht(t,e.maybe),i.match(/[1-9]/))?i:""}function gt(t,e,n,i,r){var s;return t=qt.moment.parseZone(t),e=qt.moment.parseZone(e),s=t.localeData(),n=s.longDateFormat(n)||n,i=i||" - ",pt(t,e,mt(n),i,r)}function pt(t,e,n,i,r){var s,o,l,a,u=t.clone().stripZone(),c=e.clone().stripZone(),d="",h="",f="",g="",p="";for(o=0;o<n.length&&(s=vt(t,e,u,c,n[o]),s!==!1);o++)d+=s;for(l=n.length-1;l>o&&(s=vt(t,e,u,c,n[l]),s!==!1);l--)h=s+h;for(a=o;a<=l;a++)f+=ft(t,n[a]),g+=ft(e,n[a]);return(f||g)&&(p=r?g+i+f:f+i+g),d+p+h}function vt(t,e,n,i,r){var s,o;return"string"==typeof r?r:!!((s=r.token)&&(o=oe[s.charAt(0)],o&&n.isSame(i,o)))&&ct(t,s)}function mt(t){return t in le?le[t]:le[t]=yt(t)}function yt(t){for(var e,n=[],i=/\[([^\]]*)\]|\(([^\)]*)\)|(LTS|LT|(\w)\4*o?)|([^\w\[\(]+)/g;e=i.exec(t);)e[1]?n.push(e[1]):e[2]?n.push({maybe:yt(e[2])}):e[3]?n.push({token:e[3]}):e[5]&&n.push(e[5]);return n}function St(){}function wt(t,e){var n;return Q(e,"constructor")&&(n=e.constructor),"function"!=typeof n&&(n=e.constructor=function(){t.apply(this,arguments)}),n.prototype=Z(t.prototype),$(e,n.prototype),$(t,n),n}function Et(t,e){$(e,t.prototype)}function bt(e){var n=t.Deferred(),i=n.promise();if("function"==typeof e&&e(function(t){bt.immediate&&(i._value=t),n.resolve(t)},function(){n.reject()}),bt.immediate){var r=i.then;i.then=function(t,e){var n=i.state();if("resolved"===n){if("function"==typeof t)return bt.resolve(t(i._value))}else if("rejected"===n&&"function"==typeof e)return e(),i;return r.call(i,t,e)}}return i}function Dt(t){function e(t){return new bt(function(e){var i=function(){bt.resolve(t()).then(e).then(function(){n.shift(),n.length&&n[0]()})};n.push(i),1===n.length&&i()})}var n=[];this.add="number"==typeof t?at(e,t):e,this.addQuickly=e}function Tt(t,e){return!t&&!e||!(!t||!e)&&(t.component===e.component&&Ct(t,e)&&Ct(e,t))}function Ct(t,e){for(var n in t)if(!/^(component|left|right|top|bottom)$/.test(n)&&t[n]!==e[n])return!1;return!0}function Ht(t){return{start:t.start.clone(),end:t.end?t.end.clone():null,allDay:t.allDay}}function Rt(t){var e=It(t);return"background"===e||"inverse-background"===e}function xt(t){return"inverse-background"===It(t)}function It(t){return J((t.source||{}).rendering,t.rendering)}function kt(t){var e,n,i={};for(e=0;e<t.length;e++)n=t[e],(i[n._id]||(i[n._id]=[])).push(n);return i}function Lt(t,e){return t.start-e.start}function Mt(n){var i,r,s,o,l=qt.dataAttrPrefix;return l&&(l+="-"),i=n.data(l+"event")||null,i&&(i="object"==typeof i?t.extend({},i):{},r=i.start,null==r&&(r=i.time),s=i.duration,o=i.stick,delete i.start,delete i.time,delete i.duration,delete i.stick),null==r&&(r=n.data(l+"start")),null==r&&(r=n.data(l+"time")),null==s&&(s=n.data(l+"duration")),null==o&&(o=n.data(l+"stick")),r=null!=r?e.duration(r):null,s=null!=s?e.duration(s):null,o=Boolean(o),{eventProps:i,startTime:r,duration:s,stick:o}}function Bt(t,e){var n,i;for(n=0;n<e.length;n++)if(i=e[n],i.leftCol<=t.rightCol&&i.rightCol>=t.leftCol)return!0;return!1}function zt(t,e){return t.leftCol-e.leftCol}function Ft(t){var e,n,i,r=[];for(e=0;e<t.length;e++){for(n=t[e],i=0;i<r.length&&Ot(n,r[i]).length;i++);n.level=i,(r[i]||(r[i]=[])).push(n)}return r}function Nt(t){var e,n,i,r,s;for(e=0;e<t.length;e++)for(n=t[e],i=0;i<n.length;i++)for(r=n[i],r.forwardSegs=[],s=e+1;s<t.length;s++)Ot(r,t[s],r.forwardSegs)}function Gt(t){var e,n,i=t.forwardSegs,r=0;if(void 0===t.forwardPressure){for(e=0;e<i.length;e++)n=i[e],Gt(n),r=Math.max(r,1+n.forwardPressure);t.forwardPressure=r}}function Ot(t,e,n){n=n||[];for(var i=0;i<e.length;i++)At(t,e[i])&&n.push(e[i]);return n}function At(t,e){return t.bottom>e.top&&t.top<e.bottom}function Vt(t){this.items=t||[]}function Pt(e,n){function i(t){n=t}function r(){var i=n.layout;p=e.options.theme?"ui":"fc",i?(g?g.empty():g=this.el=t("<div class='fc-toolbar "+n.extraClasses+"'/>"),g.append(o("left")).append(o("right")).append(o("center")).append('<div class="fc-clear"/>')):s()}function s(){g&&(g.remove(),g=f.el=null)}function o(i){var r=t('<div class="fc-'+i+'"/>'),s=n.layout[i];return s&&t.each(s.split(" "),function(n){var i,s=t(),o=!0;t.each(this.split(","),function(n,i){var r,l,a,u,c,d,h,f,g,m;"title"==i?(s=s.add(t("<h2>&nbsp;</h2>")),o=!1):((r=(e.options.customButtons||{})[i])?(a=function(t){r.click&&r.click.call(m[0],t)},u="",c=r.text):(l=e.getViewSpec(i))?(a=function(){e.changeView(i)},v.push(i),u=l.buttonTextOverride,c=l.buttonTextDefault):e[i]&&(a=function(){e[i]()},u=(e.overrides.buttonText||{})[i],c=e.options.buttonText[i]),a&&(d=r?r.themeIcon:e.options.themeButtonIcons[i],h=r?r.icon:e.options.buttonIcons[i],f=u?tt(u):d&&e.options.theme?"<span class='ui-icon ui-icon-"+d+"'></span>":h&&!e.options.theme?"<span class='fc-icon fc-icon-"+h+"'></span>":tt(c),g=["fc-"+i+"-button",p+"-button",p+"-state-default"],m=t('<button type="button" class="'+g.join(" ")+'">'+f+"</button>").click(function(t){m.hasClass(p+"-state-disabled")||(a(t),(m.hasClass(p+"-state-active")||m.hasClass(p+"-state-disabled"))&&m.removeClass(p+"-state-hover"))}).mousedown(function(){m.not("."+p+"-state-active").not("."+p+"-state-disabled").addClass(p+"-state-down")}).mouseup(function(){m.removeClass(p+"-state-down")}).hover(function(){m.not("."+p+"-state-active").not("."+p+"-state-disabled").addClass(p+"-state-hover")},function(){m.removeClass(p+"-state-hover").removeClass(p+"-state-down")}),s=s.add(m)))}),o&&s.first().addClass(p+"-corner-left").end().last().addClass(p+"-corner-right").end(),s.length>1?(i=t("<div/>"),o&&i.addClass("fc-button-group"),i.append(s),r.append(i)):r.append(s)}),r}function l(t){g&&g.find("h2").text(t)}function a(t){g&&g.find(".fc-"+t+"-button").addClass(p+"-state-active")}function u(t){g&&g.find(".fc-"+t+"-button").removeClass(p+"-state-active")}function c(t){g&&g.find(".fc-"+t+"-button").prop("disabled",!0).addClass(p+"-state-disabled")}function d(t){g&&g.find(".fc-"+t+"-button").prop("disabled",!1).removeClass(p+"-state-disabled")}function h(){return v}var f=this;f.setToolbarOptions=i,f.render=r,f.removeElement=s,f.updateTitle=l,f.activateButton=a,f.deactivateButton=u,f.disableButton=c,f.enableButton=d,f.getViewsWithButtons=h,f.el=null;var g,p,v=[]}function _t(n,i){function r(t){t._locale=Y}function s(){q?a()&&(f(),u()):o()}function o(){n.addClass("fc"),n.on("click.fc","a[data-goto]",function(e){var n=t(this),i=n.data("goto"),r=_.moment(i.date),s=i.type,o=Q.opt("navLink"+rt(s)+"Click");"function"==typeof o?o(r,e):("string"==typeof o&&(s=o),B(r,s))}),_.bindOption("theme",function(t){$=t?"ui":"fc",n.toggleClass("ui-widget",t),n.toggleClass("fc-unthemed",!t)}),_.bindOptions(["isRTL","locale"],function(t){n.toggleClass("fc-ltr",!t),n.toggleClass("fc-rtl",t)}),q=t("<div class='fc-view-container'/>").prependTo(n);var e=y();W=new Vt(e),U=_.header=e[0],j=_.footer=e[1],E(),b(),u(_.options.defaultView),_.options.handleWindowResize&&(K=at(v,_.options.windowResizeDelay),t(window).resize(K))}function l(){Q&&Q.removeElement(),W.proxyCall("removeElement"),q.remove(),n.removeClass("fc fc-ltr fc-rtl fc-unthemed ui-widget"),n.off(".fc"),K&&t(window).unbind("resize",K)}function a(){return n.is(":visible")}function u(e,n){nt++;var i=Q&&e&&Q.type!==e;i&&(F(),c()),!Q&&e&&(Q=_.view=et[e]||(et[e]=_.instantiateView(e)),Q.setElement(t("<div class='fc-view fc-"+e+"-view' />").appendTo(q)),W.proxyCall("activateButton",e)),Q&&(J=Q.massageCurrentDate(J),Q.isDateSet&&J>=Q.intervalStart&&J<Q.intervalEnd||a()&&(n&&Q.captureInitialScroll(n),Q.setDate(J,n),n&&Q.releaseScroll(),D())),i&&N(),nt--}function c(){W.proxyCall("deactivateButton",Q.type),Q.removeElement(),Q=_.view=null}function d(){nt++,F();var t=Q.type,e=Q.queryScroll();c(),f(),u(t,e),N(),nt--}function h(t){if(a())return t&&g(),nt++,Q.updateSize(!0),nt--,!0}function f(){a()&&g()}function g(){var t=_.options.contentHeight,e=_.options.height;X="number"==typeof t?t:"function"==typeof t?t():"number"==typeof e?e-p():"function"==typeof e?e()-p():"parent"===e?n.parent().height()-p():Math.round(q.width()/Math.max(_.options.aspectRatio,.5))}function p(){return W.items.reduce(function(t,e){var n=e.el?e.el.outerHeight(!0):0;return t+n},0)}function v(t){!nt&&t.target===window&&Q.start&&h(!0)&&Q.publiclyTrigger("windowResize",tt)}function m(){a()&&_.reportEventChange()}function y(){return[new Pt(_,S()),new Pt(_,w())]}function S(){return{extraClasses:"fc-header-toolbar",layout:_.options.header}}function w(){return{extraClasses:"fc-footer-toolbar",layout:_.options.footer}}function E(){U.setToolbarOptions(S()),U.render(),U.el&&n.prepend(U.el)}function b(){j.setToolbarOptions(w()),j.render(),j.el&&n.append(j.el)}function D(){var t=_.getNow();t>=Q.intervalStart&&t<Q.intervalEnd?W.proxyCall("disableButton","today"):W.proxyCall("enableButton","today")}function T(t,e){Q.select(_.buildSelectSpan.apply(_,arguments))}function C(){Q&&Q.unselect()}function H(){J=Q.computePrevDate(J),u()}function R(){J=Q.computeNextDate(J),u()}function x(){J.add(-1,"years"),u()}function I(){J.add(1,"years"),u()}function k(){J=_.getNow(),u()}function L(t){J=_.moment(t).stripZone(),u()}function M(t){J.add(e.duration(t)),u()}function B(t,e){var n;e=e||"day",n=_.getViewSpec(e)||_.getUnitViewSpec(e),J=t.clone(),u(n?n.type:null)}function z(){return _.applyTimezone(J)}function F(){it++||q.css({width:"100%",height:q.height(),overflow:"hidden"})}function N(){--it||q.css({width:"",height:"",overflow:""})}function G(){return _}function O(){return Q}function A(t,e){var n;if("string"==typeof t){if(void 0===e)return _.options[t];n={},n[t]=e,V(n)}else"object"==typeof t&&V(t)}function V(t){var e,n=0;for(e in t)_.dynamicOverrides[e]=t[e];_.viewSpecCache={},_.populateOptionsHash();for(e in t)_.triggerOptionHandlers(e),n++;if(1===n){if("height"===e||"contentHeight"===e||"aspectRatio"===e)return void h(!0);if("defaultDate"===e)return;if("businessHours"===e)return void(Q&&(Q.unrenderBusinessHours(),Q.renderBusinessHours()));if("timezone"===e)return _.rezoneArrayEventSources(),void _.refetchEvents()}E(),b(),et={},d()}function P(t,e){var n=Array.prototype.slice.call(arguments,2);if(e=e||tt,this.triggerWith(t,e,n),_.options[t])return _.options[t].apply(e,n)}var _=this;_.render=s,_.destroy=l,_.rerenderEvents=m,_.changeView=u,_.select=T,_.unselect=C,_.prev=H,_.next=R,_.prevYear=x,_.nextYear=I,_.today=k,_.gotoDate=L,_.incrementDate=M,_.zoomTo=B,_.getDate=z,_.getCalendar=G,_.getView=O,_.option=A,_.publiclyTrigger=P,_.dynamicOverrides={},_.viewSpecCache={},_.optionHandlers={},_.overrides=t.extend({},i),_.populateOptionsHash();var Y;_.bindOptions(["locale","monthNames","monthNamesShort","dayNames","dayNamesShort","firstDay","weekNumberCalculation"],function(t,e,n,i,s,o,l){if("iso"===l&&(l="ISO"),Y=Z(Wt(t)),e&&(Y._months=e),n&&(Y._monthsShort=n),i&&(Y._weekdays=i),s&&(Y._weekdaysShort=s),null==o&&"ISO"===l&&(o=1),null!=o){var a=Z(Y._week);a.dow=o,Y._week=a}"ISO"!==l&&"local"!==l&&"function"!=typeof l||(Y._fullCalendar_weekCalc=l),J&&r(J)}),_.defaultAllDayEventDuration=e.duration(_.options.defaultAllDayEventDuration),_.defaultTimedEventDuration=e.duration(_.options.defaultTimedEventDuration),_.moment=function(){var t;return"local"===_.options.timezone?(t=qt.moment.apply(null,arguments),t.hasTime()&&t.local()):t="UTC"===_.options.timezone?qt.moment.utc.apply(null,arguments):qt.moment.parseZone.apply(null,arguments),r(t),t},_.localizeMoment=r,_.getIsAmbigTimezone=function(){return"local"!==_.options.timezone&&"UTC"!==_.options.timezone},_.applyTimezone=function(t){if(!t.hasTime())return t.clone();var e,n=_.moment(t.toArray()),i=t.time()-n.time();return i&&(e=n.clone().add(i),t.time()-e.time()===0&&(n=e)),n},_.getNow=function(){var t=_.options.now;return"function"==typeof t&&(t=t()),_.moment(t).stripZone()},_.getEventEnd=function(t){return t.end?t.end.clone():_.getDefaultEventEnd(t.allDay,t.start)},_.getDefaultEventEnd=function(t,e){var n=e.clone();return t?n.stripTime().add(_.defaultAllDayEventDuration):n.add(_.defaultTimedEventDuration),_.getIsAmbigTimezone()&&n.stripZone(),n},_.humanizeDuration=function(t){return t.locale(_.options.locale).humanize()},Ut.call(_);var W,U,j,q,$,Q,X,K,J,tt=n[0],et={},nt=0;J=null!=_.options.defaultDate?_.moment(_.options.defaultDate).stripZone():_.getNow(),_.getSuggestedViewHeight=function(){return void 0===X&&f(),X},_.isHeightAuto=function(){return"auto"===_.options.contentHeight||"auto"===_.options.height},_.setToolbarsTitle=function(t){W.proxyCall("updateTitle",t)},_.freezeContentHeight=F,_.thawContentHeight=N;var it=0;_.initialize()}function Yt(e){t.each(Re,function(t,n){null==e[t]&&(e[t]=n(e))})}function Wt(t){return e.localeData(t)||e.localeData("en")}function Ut(){function n(t,e){return!U.options.lazyFetching||s(t,e)?o(t,e):bt.resolve($)}function i(){$=r(nt),U.trigger("eventsReset",$)}function r(t){var e,n,i=[];for(e=0;e<t.length;e++)n=t[e],n.start.clone().stripZone()<Z&&U.getEventEnd(n).stripZone()>q&&i.push(n);return i}function s(t,e){return!q||t<q||e>Z}function o(t,e){return q=t,Z=e,l()}function l(){return u(tt,"reset")}function a(t){return u(E(t))}function u(t,e){var n,i;for("reset"===e?nt=[]:"add"!==e&&(nt=C(nt,t)),n=0;n<t.length;n++)i=t[n],"pending"!==i._status&&et++,i._fetchId=(i._fetchId||0)+1,i._status="pending";for(n=0;n<t.length;n++)i=t[n],c(i,i._fetchId);return et?new bt(function(t){U.one("eventsReceived",t)}):bt.resolve($)}function c(e,n){f(e,function(i){var r,s,o,l=t.isArray(e.events);if(n===e._fetchId&&"rejected"!==e._status){if(e._status="resolved",i)for(r=0;r<i.length;r++)s=i[r],o=l?s:F(s,e),o&&nt.push.apply(nt,_(o));h()}})}function d(t){var e="pending"===t._status;t._status="rejected",e&&h()}function h(){et--,et||(i(nt),U.trigger("eventsReceived",$))}function f(e,n){var i,r,s=qt.sourceFetchers;for(i=0;i<s.length;i++){if(r=s[i].call(U,e,q.clone(),Z.clone(),U.options.timezone,n),r===!0)return;if("object"==typeof r)return void f(r,n)}var o=e.events;if(o)t.isFunction(o)?(U.pushLoading(),o.call(U,q.clone(),Z.clone(),U.options.timezone,function(t){n(t),U.popLoading()})):t.isArray(o)?n(o):n();else{var l=e.url;if(l){var a,u=e.success,c=e.error,d=e.complete;a=t.isFunction(e.data)?e.data():e.data;var h=t.extend({},a||{}),g=J(e.startParam,U.options.startParam),p=J(e.endParam,U.options.endParam),v=J(e.timezoneParam,U.options.timezoneParam);g&&(h[g]=q.format()),p&&(h[p]=Z.format()),U.options.timezone&&"local"!=U.options.timezone&&(h[v]=U.options.timezone),U.pushLoading(),t.ajax(t.extend({},xe,e,{data:h,success:function(e){e=e||[];var i=K(u,this,arguments);t.isArray(i)&&(e=i),n(e)},error:function(){K(c,this,arguments),n()},complete:function(){K(d,this,arguments),U.popLoading()}}))}else n()}}function g(t){var e=p(t);e&&(tt.push(e),u([e],"add"))}function p(e){var n,i,r=qt.sourceNormalizers;if(t.isFunction(e)||t.isArray(e)?n={events:e}:"string"==typeof e?n={url:e}:"object"==typeof e&&(n=t.extend({},e)),n){for(n.className?"string"==typeof n.className&&(n.className=n.className.split(/\s+/)):n.className=[],t.isArray(n.events)&&(n.origArray=n.events,n.events=t.map(n.events,function(t){return F(t,n)})),i=0;i<r.length;i++)r[i].call(U,n);return n}}function v(t){y(b(t))}function m(t){null==t?y(tt,!0):y(E(t))}function y(e,n){var r;for(r=0;r<e.length;r++)d(e[r]);n?(tt=[],nt=[]):(tt=t.grep(tt,function(t){for(r=0;r<e.length;r++)if(t===e[r])return!1;return!0}),nt=C(nt,e)),i()}function S(){return tt.slice(1)}function w(e){return t.grep(tt,function(t){return t.id&&t.id===e})[0]}function E(e){e?t.isArray(e)||(e=[e]):e=[];var n,i=[];for(n=0;n<e.length;n++)i.push.apply(i,b(e[n]));return i}function b(e){var n,i;for(n=0;n<tt.length;n++)if(i=tt[n],i===e)return[i];return i=w(e),i?[i]:t.grep(tt,function(t){return D(e,t)})}function D(t,e){return t&&e&&T(t)==T(e)}function T(t){return("object"==typeof t?t.origArray||t.googleCalendarId||t.url||t.events:null)||t}function C(e,n){return t.grep(e,function(t){for(var e=0;e<n.length;e++)if(t.source===n[e])return!1;return!0})}function H(t){R([t])}function R(t){var e,n;for(e=0;e<t.length;e++)n=t[e],n.start=U.moment(n.start),n.end?n.end=U.moment(n.end):n.end=null,Y(n,x(n));i()}function x(e){var n={};return t.each(e,function(t,e){I(t)&&void 0!==e&&X(e)&&(n[t]=e)}),n}function I(t){return!/^_|^(id|allDay|start|end)$/.test(t)}function k(t,e){return L([t],e)}function L(t,e){var n,r,s,o,l,a=[];for(s=0;s<t.length;s++)if(r=F(t[s])){for(n=_(r),o=0;o<n.length;o++)l=n[o],l.source||(e&&(Q.events.push(l),l.source=Q),nt.push(l));a=a.concat(n)}return a.length&&i(),a}function M(e){var n,r;for(null==e?e=function(){return!0}:t.isFunction(e)||(n=e+"",e=function(t){return t._id==n}),nt=t.grep(nt,e,!0),r=0;r<tt.length;r++)t.isArray(tt[r].events)&&(tt[r].events=t.grep(tt[r].events,e,!0));i()}function B(e){return t.isFunction(e)?t.grep(nt,e):null!=e?(e+="",t.grep(nt,function(t){return t._id==e})):nt}function z(t){t.start=U.moment(t.start),t.end&&(t.end=U.moment(t.end)),jt(t)}function F(n,i){var r,s,o,l={};if(U.options.eventDataTransform&&(n=U.options.eventDataTransform(n)),i&&i.eventDataTransform&&(n=i.eventDataTransform(n)),t.extend(l,n),i&&(l.source=i),l._id=n._id||(void 0===n.id?"_fc"+Ie++:n.id+""),n.className?"string"==typeof n.className?l.className=n.className.split(/\s+/):l.className=n.className:l.className=[],r=n.start||n.date,s=n.end,j(r)&&(r=e.duration(r)),j(s)&&(s=e.duration(s)),n.dow||e.isDuration(r)||e.isDuration(s))l.start=r?e.duration(r):null,l.end=s?e.duration(s):null,l._recurring=!0;else{if(r&&(r=U.moment(r),!r.isValid()))return!1;s&&(s=U.moment(s),s.isValid()||(s=null)),o=n.allDay,void 0===o&&(o=J(i?i.allDayDefault:void 0,U.options.allDayDefault)),A(r,s,o,l)}return U.normalizeEvent(l),l}function A(t,e,n,i){i.start=t,i.end=e,i.allDay=n,V(i),jt(i)}function V(t){P(t),t.end&&!t.end.isAfter(t.start)&&(t.end=null),t.end||(U.options.forceEventDuration?t.end=U.getDefaultEventEnd(t.allDay,t.start):t.end=null)}function P(t){null==t.allDay&&(t.allDay=!(t.start.hasTime()||t.end&&t.end.hasTime())),t.allDay?(t.start.stripTime(),t.end&&t.end.stripTime()):(t.start.hasTime()||(t.start=U.applyTimezone(t.start.time(0))),t.end&&!t.end.hasTime()&&(t.end=U.applyTimezone(t.end.time(0))))}function _(e,n,i){var r,s,o,l,a,u,c,d,h,f=[];if(n=n||q,i=i||Z,e)if(e._recurring){if(s=e.dow)for(r={},o=0;o<s.length;o++)r[s[o]]=!0;for(l=n.clone().stripTime();l.isBefore(i);)r&&!r[l.day()]||(a=e.start,u=e.end,c=l.clone(),d=null,a&&(c=c.time(a)),u&&(d=l.clone().time(u)),h=t.extend({},e),A(c,d,!a&&!u,h),f.push(h)),l.add(1,"days")}else f.push(e);return f}function Y(e,n,i){function r(t,e){return i?O(t,e,i):n.allDay?G(t,e):N(t,e)}var s,o,l,a,u,c,d={};return n=n||{},n.start||(n.start=e.start.clone()),void 0===n.end&&(n.end=e.end?e.end.clone():null),null==n.allDay&&(n.allDay=e.allDay),V(n),s={start:e._start.clone(),end:e._end?e._end.clone():U.getDefaultEventEnd(e._allDay,e._start),allDay:n.allDay},V(s),o=null!==e._end&&null===n.end,l=r(n.start,s.start),n.end?(a=r(n.end,s.end),u=a.subtract(l)):u=null,t.each(n,function(t,e){I(t)&&void 0!==e&&(d[t]=e)}),c=W(B(e._id),o,n.allDay,l,u,d),{dateDelta:l,durationDelta:u,undo:c}}function W(e,n,i,r,s,o){var l=U.getIsAmbigTimezone(),a=[];return r&&!r.valueOf()&&(r=null),s&&!s.valueOf()&&(s=null),t.each(e,function(e,u){var c,d;c={start:u.start.clone(),end:u.end?u.end.clone():null,allDay:u.allDay},t.each(o,function(t){c[t]=u[t]}),d={start:u._start,end:u._end,allDay:i},V(d),n?d.end=null:s&&!d.end&&(d.end=U.getDefaultEventEnd(d.allDay,d.start)),r&&(d.start.add(r),d.end&&d.end.add(r)),s&&d.end.add(s),l&&!d.allDay&&(r||s)&&(d.start.stripZone(),d.end&&d.end.stripZone()),t.extend(u,o,d),jt(u),a.push(function(){t.extend(u,c),jt(u)})}),function(){for(var t=0;t<a.length;t++)a[t]()}}var U=this;U.requestEvents=n,U.reportEventChange=i,U.isFetchNeeded=s,U.fetchEvents=o,U.fetchEventSources=u,U.refetchEvents=l,U.refetchEventSources=a,U.getEventSources=S,U.getEventSourceById=w,U.addEventSource=g,U.removeEventSource=v,U.removeEventSources=m,U.updateEvent=H,U.updateEvents=R,U.renderEvent=k,U.renderEvents=L,U.removeEvents=M,U.clientEvents=B,U.mutateEvent=Y,U.normalizeEventDates=V,U.normalizeEventTimes=P;var q,Z,$,Q={events:[]},tt=[Q],et=0,nt=[];t.each((U.options.events?[U.options.events]:[]).concat(U.options.eventSources||[]),function(t,e){var n=p(e);n&&tt.push(n)}),U.getEventCache=function(){return nt},U.getPrunedEventCache=function(){return $},U.rezoneArrayEventSources=function(){var e,n,i;for(e=0;e<tt.length;e++)if(n=tt[e].events,t.isArray(n))for(i=0;i<n.length;i++)z(n[i])},U.buildEventFromInput=F,U.expandEvent=_}function jt(t){t._allDay=t.allDay,t._start=t.start.clone(),t._end=t.end?t.end.clone():null}var qt=t.fullCalendar={version:"3.1.0",internalApiVersion:7},Zt=qt.views={};t.fn.fullCalendar=function(e){var n=Array.prototype.slice.call(arguments,1),i=this;return this.each(function(r,s){var o,l=t(s),a=l.data("fullCalendar");"string"==typeof e?a&&t.isFunction(a[e])&&(o=a[e].apply(a,n),r||(i=o),"destroy"===e&&l.removeData("fullCalendar")):a||(a=new De(l,e),l.data("fullCalendar",a),a.render())}),i};var $t=["header","footer","buttonText","buttonIcons","themeButtonIcons"];qt.intersectRanges=F,qt.applyAll=K,qt.debounce=at,qt.isInt=ot,qt.htmlEscape=tt,qt.cssToStr=nt,qt.proxy=lt,qt.capitaliseFirstLetter=rt,qt.getOuterRect=h,qt.getClientRect=f,qt.getContentRect=g,qt.getScrollbarWidths=p;var Qt=null;qt.preventDefault=T,qt.intersectRects=R,qt.parseFieldSpecs=L,qt.compareByFieldSpecs=M,qt.compareByFieldSpec=B,qt.flexibleCompare=z,qt.computeIntervalUnit=A,qt.divideRangeByDuration=P,qt.divideDurationByDuration=_,qt.multiplyDuration=Y,qt.durationHasTime=W;var Xt=["sun","mon","tue","wed","thu","fri","sat"],Kt=["year","month","week","day","hour","minute","second","millisecond"];qt.log=function(){var t=window.console;if(t&&t.log)return t.log.apply(t,arguments)},qt.warn=function(){var t=window.console;return t&&t.warn?t.warn.apply(t,arguments):qt.log.apply(qt,arguments)};var Jt={}.hasOwnProperty;qt.createObject=Z;var te=/^\s*\d{4}-\d\d$/,ee=/^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?)?$/,ne=e.fn,ie=t.extend({},ne),re=e.momentProperties;re.push("_fullCalendar"),re.push("_ambigTime"),re.push("_ambigZone"),qt.moment=function(){return ut(arguments)},qt.moment.utc=function(){var t=ut(arguments,!0);return t.hasTime()&&t.utc(),t},qt.moment.parseZone=function(){return ut(arguments,!0,!0)},ne.week=ne.weeks=function(t){var e=this._locale._fullCalendar_weekCalc;return null==t&&"function"==typeof e?e(this):"ISO"===e?ie.isoWeek.apply(this,arguments):ie.week.apply(this,arguments)},ne.time=function(t){if(!this._fullCalendar)return ie.time.apply(this,arguments);if(null==t)return e.duration({hours:this.hours(),minutes:this.minutes(),seconds:this.seconds(),milliseconds:this.milliseconds()});this._ambigTime=!1,e.isDuration(t)||e.isMoment(t)||(t=e.duration(t));var n=0;return e.isDuration(t)&&(n=24*Math.floor(t.asDays())),this.hours(n+t.hours()).minutes(t.minutes()).seconds(t.seconds()).milliseconds(t.milliseconds())},ne.stripTime=function(){return this._ambigTime||(this.utc(!0),this.set({hours:0,minutes:0,seconds:0,ms:0}),this._ambigTime=!0,this._ambigZone=!0),this},ne.hasTime=function(){return!this._ambigTime},ne.stripZone=function(){var t;return this._ambigZone||(t=this._ambigTime,this.utc(!0),this._ambigTime=t||!1,this._ambigZone=!0),this},ne.hasZone=function(){return!this._ambigZone},ne.local=function(t){return ie.local.call(this,this._ambigZone||t),this._ambigTime=!1,this._ambigZone=!1,this},ne.utc=function(t){return ie.utc.call(this,t),this._ambigTime=!1,this._ambigZone=!1,this},ne.utcOffset=function(t){return null!=t&&(this._ambigTime=!1,this._ambigZone=!1),ie.utcOffset.apply(this,arguments)},ne.format=function(){return this._fullCalendar&&arguments[0]?dt(this,arguments[0]):this._ambigTime?ct(this,"YYYY-MM-DD"):this._ambigZone?ct(this,"YYYY-MM-DD[T]HH:mm:ss"):ie.format.apply(this,arguments)},ne.toISOString=function(){return this._ambigTime?ct(this,"YYYY-MM-DD"):this._ambigZone?ct(this,"YYYY-MM-DD[T]HH:mm:ss"):ie.toISOString.apply(this,arguments)};var se={t:function(t){return ct(t,"a").charAt(0)},T:function(t){return ct(t,"A").charAt(0)}};qt.formatRange=gt;var oe={Y:"year",M:"month",D:"day",d:"day",A:"second",a:"second",T:"second",t:"second",H:"second",h:"second",m:"second",s:"second"},le={},ae={Y:{value:1,unit:"year"},M:{value:2,unit:"month"},W:{value:3,unit:"week"},w:{value:3,unit:"week"},D:{value:4,unit:"day"},d:{value:4,unit:"day"}};qt.queryMostGranularFormatUnit=function(t){
var e,n,i,r,s=mt(t);for(e=0;e<s.length;e++)n=s[e],n.token&&(i=ae[n.token.charAt(0)],i&&(!r||i.value>r.value)&&(r=i));return r?r.unit:null},qt.Class=St,St.extend=function(){var t,e,n=arguments.length;for(t=0;t<n;t++)e=arguments[t],t<n-1&&Et(this,e);return wt(this,e||{})},St.mixin=function(t){Et(this,t)},qt.Promise=bt,bt.immediate=!0,bt.resolve=function(e){if(e&&"function"==typeof e.resolve)return e.promise();if(e&&"function"==typeof e.then)return e;var n=t.Deferred().resolve(e),i=n.promise();if(bt.immediate){var r=i.then;i._value=e,i.then=function(t,n){return"function"==typeof t?bt.resolve(t(e)):r.call(i,t,n)}}return i},bt.reject=function(){return t.Deferred().reject().promise()},bt.all=function(e){var n,i,r,s=!1;if(bt.immediate)for(s=!0,n=[],i=0;i<e.length;i++)if(r=e[i],r&&"function"==typeof r.state&&"resolved"===r.state()&&"_value"in r)n.push(r._value);else{if(r&&"function"==typeof r.then){s=!1;break}n.push(r)}return s?bt.resolve(n):t.when.apply(t.when,e).then(function(){return t.when(t.makeArray(arguments))})},qt.TaskQueue=Dt;var ue=qt.EmitterMixin={on:function(e,n){return t(this).on(e,this._prepareIntercept(n)),this},one:function(e,n){return t(this).one(e,this._prepareIntercept(n)),this},_prepareIntercept:function(e){var n=function(t,n){return e.apply(n.context||this,n.args||[])};return e.guid||(e.guid=t.guid++),n.guid=e.guid,n},off:function(e,n){return t(this).off(e,n),this},trigger:function(e){var n=Array.prototype.slice.call(arguments,1);return t(this).triggerHandler(e,{args:n}),this},triggerWith:function(e,n,i){return t(this).triggerHandler(e,{context:n,args:i}),this}},ce=qt.ListenerMixin=function(){var e=0,n={listenerId:null,listenTo:function(e,n,i){if("object"==typeof n)for(var r in n)n.hasOwnProperty(r)&&this.listenTo(e,r,n[r]);else"string"==typeof n&&e.on(n+"."+this.getListenerNamespace(),t.proxy(i,this))},stopListeningTo:function(t,e){t.off((e||"")+"."+this.getListenerNamespace())},getListenerNamespace:function(){return null==this.listenerId&&(this.listenerId=e++),"_listener"+this.listenerId}};return n}(),de={isIgnoringMouse:!1,delayUnignoreMouse:null,initMouseIgnoring:function(t){this.delayUnignoreMouse=at(lt(this,"unignoreMouse"),t||1e3)},tempIgnoreMouse:function(){this.isIgnoringMouse=!0,this.delayUnignoreMouse()},unignoreMouse:function(){this.isIgnoringMouse=!1}},he=St.extend(ce,{isHidden:!0,options:null,el:null,margin:10,constructor:function(t){this.options=t||{}},show:function(){this.isHidden&&(this.el||this.render(),this.el.show(),this.position(),this.isHidden=!1,this.trigger("show"))},hide:function(){this.isHidden||(this.el.hide(),this.isHidden=!0,this.trigger("hide"))},render:function(){var e=this,n=this.options;this.el=t('<div class="fc-popover"/>').addClass(n.className||"").css({top:0,left:0}).append(n.content).appendTo(n.parentEl),this.el.on("click",".fc-close",function(){e.hide()}),n.autoHide&&this.listenTo(t(document),"mousedown",this.documentMousedown)},documentMousedown:function(e){this.el&&!t(e.target).closest(this.el).length&&this.hide()},removeElement:function(){this.hide(),this.el&&(this.el.remove(),this.el=null),this.stopListeningTo(t(document),"mousedown")},position:function(){var e,n,i,r,s,o=this.options,l=this.el.offsetParent().offset(),a=this.el.outerWidth(),u=this.el.outerHeight(),c=t(window),h=d(this.el);r=o.top||0,s=void 0!==o.left?o.left:void 0!==o.right?o.right-a:0,h.is(window)||h.is(document)?(h=c,e=0,n=0):(i=h.offset(),e=i.top,n=i.left),e+=c.scrollTop(),n+=c.scrollLeft(),o.viewportConstrain!==!1&&(r=Math.min(r,e+h.outerHeight()-u-this.margin),r=Math.max(r,e+this.margin),s=Math.min(s,n+h.outerWidth()-a-this.margin),s=Math.max(s,n+this.margin)),this.el.css({top:r-l.top,left:s-l.left})},trigger:function(t){this.options[t]&&this.options[t].apply(this,Array.prototype.slice.call(arguments,1))}}),fe=qt.CoordCache=St.extend({els:null,forcedOffsetParentEl:null,origin:null,boundingRect:null,isHorizontal:!1,isVertical:!1,lefts:null,rights:null,tops:null,bottoms:null,constructor:function(e){this.els=t(e.els),this.isHorizontal=e.isHorizontal,this.isVertical=e.isVertical,this.forcedOffsetParentEl=e.offsetParent?t(e.offsetParent):null},build:function(){var t=this.forcedOffsetParentEl;!t&&this.els.length>0&&(t=this.els.eq(0).offsetParent()),this.origin=t?t.offset():null,this.boundingRect=this.queryBoundingRect(),this.isHorizontal&&this.buildElHorizontals(),this.isVertical&&this.buildElVerticals()},clear:function(){this.origin=null,this.boundingRect=null,this.lefts=null,this.rights=null,this.tops=null,this.bottoms=null},ensureBuilt:function(){this.origin||this.build()},buildElHorizontals:function(){var e=[],n=[];this.els.each(function(i,r){var s=t(r),o=s.offset().left,l=s.outerWidth();e.push(o),n.push(o+l)}),this.lefts=e,this.rights=n},buildElVerticals:function(){var e=[],n=[];this.els.each(function(i,r){var s=t(r),o=s.offset().top,l=s.outerHeight();e.push(o),n.push(o+l)}),this.tops=e,this.bottoms=n},getHorizontalIndex:function(t){this.ensureBuilt();var e,n=this.lefts,i=this.rights,r=n.length;for(e=0;e<r;e++)if(t>=n[e]&&t<i[e])return e},getVerticalIndex:function(t){this.ensureBuilt();var e,n=this.tops,i=this.bottoms,r=n.length;for(e=0;e<r;e++)if(t>=n[e]&&t<i[e])return e},getLeftOffset:function(t){return this.ensureBuilt(),this.lefts[t]},getLeftPosition:function(t){return this.ensureBuilt(),this.lefts[t]-this.origin.left},getRightOffset:function(t){return this.ensureBuilt(),this.rights[t]},getRightPosition:function(t){return this.ensureBuilt(),this.rights[t]-this.origin.left},getWidth:function(t){return this.ensureBuilt(),this.rights[t]-this.lefts[t]},getTopOffset:function(t){return this.ensureBuilt(),this.tops[t]},getTopPosition:function(t){return this.ensureBuilt(),this.tops[t]-this.origin.top},getBottomOffset:function(t){return this.ensureBuilt(),this.bottoms[t]},getBottomPosition:function(t){return this.ensureBuilt(),this.bottoms[t]-this.origin.top},getHeight:function(t){return this.ensureBuilt(),this.bottoms[t]-this.tops[t]},queryBoundingRect:function(){var t;return this.els.length>0&&(t=d(this.els.eq(0)),!t.is(document))?f(t):null},isPointInBounds:function(t,e){return this.isLeftInBounds(t)&&this.isTopInBounds(e)},isLeftInBounds:function(t){return!this.boundingRect||t>=this.boundingRect.left&&t<this.boundingRect.right},isTopInBounds:function(t){return!this.boundingRect||t>=this.boundingRect.top&&t<this.boundingRect.bottom}}),ge=qt.DragListener=St.extend(ce,de,{options:null,subjectEl:null,originX:null,originY:null,scrollEl:null,isInteracting:!1,isDistanceSurpassed:!1,isDelayEnded:!1,isDragging:!1,isTouch:!1,delay:null,delayTimeoutId:null,minDistance:null,handleTouchScrollProxy:null,constructor:function(t){this.options=t||{},this.handleTouchScrollProxy=lt(this,"handleTouchScroll"),this.initMouseIgnoring(500)},startInteraction:function(e,n){var i=b(e);if("mousedown"===e.type){if(this.isIgnoringMouse)return;if(!S(e))return;e.preventDefault()}this.isInteracting||(n=n||{},this.delay=J(n.delay,this.options.delay,0),this.minDistance=J(n.distance,this.options.distance,0),this.subjectEl=this.options.subjectEl,this.isInteracting=!0,this.isTouch=i,this.isDelayEnded=!1,this.isDistanceSurpassed=!1,this.originX=w(e),this.originY=E(e),this.scrollEl=d(t(e.target)),this.bindHandlers(),this.initAutoScroll(),this.handleInteractionStart(e),this.startDelay(e),this.minDistance||this.handleDistanceSurpassed(e))},handleInteractionStart:function(t){this.trigger("interactionStart",t)},endInteraction:function(t,e){this.isInteracting&&(this.endDrag(t),this.delayTimeoutId&&(clearTimeout(this.delayTimeoutId),this.delayTimeoutId=null),this.destroyAutoScroll(),this.unbindHandlers(),this.isInteracting=!1,this.handleInteractionEnd(t,e),this.isTouch&&this.tempIgnoreMouse())},handleInteractionEnd:function(t,e){this.trigger("interactionEnd",t,e||!1)},bindHandlers:function(){var e=this,n=1;this.isTouch?(this.listenTo(t(document),{touchmove:this.handleTouchMove,touchend:this.endInteraction,touchcancel:this.endInteraction,touchstart:function(t){n?n--:e.endInteraction(t,!0)}}),!C(this.handleTouchScrollProxy)&&this.scrollEl&&this.listenTo(this.scrollEl,"scroll",this.handleTouchScroll)):this.listenTo(t(document),{mousemove:this.handleMouseMove,mouseup:this.endInteraction}),this.listenTo(t(document),{selectstart:T,contextmenu:T})},unbindHandlers:function(){this.stopListeningTo(t(document)),H(this.handleTouchScrollProxy),this.scrollEl&&this.stopListeningTo(this.scrollEl,"scroll")},startDrag:function(t,e){this.startInteraction(t,e),this.isDragging||(this.isDragging=!0,this.handleDragStart(t))},handleDragStart:function(t){this.trigger("dragStart",t)},handleMove:function(t){var e,n=w(t)-this.originX,i=E(t)-this.originY,r=this.minDistance;this.isDistanceSurpassed||(e=n*n+i*i,e>=r*r&&this.handleDistanceSurpassed(t)),this.isDragging&&this.handleDrag(n,i,t)},handleDrag:function(t,e,n){this.trigger("drag",t,e,n),this.updateAutoScroll(n)},endDrag:function(t){this.isDragging&&(this.isDragging=!1,this.handleDragEnd(t))},handleDragEnd:function(t){this.trigger("dragEnd",t)},startDelay:function(t){var e=this;this.delay?this.delayTimeoutId=setTimeout(function(){e.handleDelayEnd(t)},this.delay):this.handleDelayEnd(t)},handleDelayEnd:function(t){this.isDelayEnded=!0,this.isDistanceSurpassed&&this.startDrag(t)},handleDistanceSurpassed:function(t){this.isDistanceSurpassed=!0,this.isDelayEnded&&this.startDrag(t)},handleTouchMove:function(t){this.isDragging&&t.preventDefault(),this.handleMove(t)},handleMouseMove:function(t){this.handleMove(t)},handleTouchScroll:function(t){this.isDragging||this.endInteraction(t,!0)},trigger:function(t){this.options[t]&&this.options[t].apply(this,Array.prototype.slice.call(arguments,1)),this["_"+t]&&this["_"+t].apply(this,Array.prototype.slice.call(arguments,1))}});ge.mixin({isAutoScroll:!1,scrollBounds:null,scrollTopVel:null,scrollLeftVel:null,scrollIntervalId:null,scrollSensitivity:30,scrollSpeed:200,scrollIntervalMs:50,initAutoScroll:function(){var t=this.scrollEl;this.isAutoScroll=this.options.scroll&&t&&!t.is(window)&&!t.is(document),this.isAutoScroll&&this.listenTo(t,"scroll",at(this.handleDebouncedScroll,100))},destroyAutoScroll:function(){this.endAutoScroll(),this.isAutoScroll&&this.stopListeningTo(this.scrollEl,"scroll")},computeScrollBounds:function(){this.isAutoScroll&&(this.scrollBounds=h(this.scrollEl))},updateAutoScroll:function(t){var e,n,i,r,s=this.scrollSensitivity,o=this.scrollBounds,l=0,a=0;o&&(e=(s-(E(t)-o.top))/s,n=(s-(o.bottom-E(t)))/s,i=(s-(w(t)-o.left))/s,r=(s-(o.right-w(t)))/s,e>=0&&e<=1?l=e*this.scrollSpeed*-1:n>=0&&n<=1&&(l=n*this.scrollSpeed),i>=0&&i<=1?a=i*this.scrollSpeed*-1:r>=0&&r<=1&&(a=r*this.scrollSpeed)),this.setScrollVel(l,a)},setScrollVel:function(t,e){this.scrollTopVel=t,this.scrollLeftVel=e,this.constrainScrollVel(),!this.scrollTopVel&&!this.scrollLeftVel||this.scrollIntervalId||(this.scrollIntervalId=setInterval(lt(this,"scrollIntervalFunc"),this.scrollIntervalMs))},constrainScrollVel:function(){var t=this.scrollEl;this.scrollTopVel<0?t.scrollTop()<=0&&(this.scrollTopVel=0):this.scrollTopVel>0&&t.scrollTop()+t[0].clientHeight>=t[0].scrollHeight&&(this.scrollTopVel=0),this.scrollLeftVel<0?t.scrollLeft()<=0&&(this.scrollLeftVel=0):this.scrollLeftVel>0&&t.scrollLeft()+t[0].clientWidth>=t[0].scrollWidth&&(this.scrollLeftVel=0)},scrollIntervalFunc:function(){var t=this.scrollEl,e=this.scrollIntervalMs/1e3;this.scrollTopVel&&t.scrollTop(t.scrollTop()+this.scrollTopVel*e),this.scrollLeftVel&&t.scrollLeft(t.scrollLeft()+this.scrollLeftVel*e),this.constrainScrollVel(),this.scrollTopVel||this.scrollLeftVel||this.endAutoScroll()},endAutoScroll:function(){this.scrollIntervalId&&(clearInterval(this.scrollIntervalId),this.scrollIntervalId=null,this.handleScrollEnd())},handleDebouncedScroll:function(){this.scrollIntervalId||this.handleScrollEnd()},handleScrollEnd:function(){}});var pe=ge.extend({component:null,origHit:null,hit:null,coordAdjust:null,constructor:function(t,e){ge.call(this,e),this.component=t},handleInteractionStart:function(t){var e,n,i,r=this.subjectEl;this.computeCoords(),t?(n={left:w(t),top:E(t)},i=n,r&&(e=h(r),i=x(i,e)),this.origHit=this.queryHit(i.left,i.top),r&&this.options.subjectCenter&&(this.origHit&&(e=R(this.origHit,e)||e),i=I(e)),this.coordAdjust=k(i,n)):(this.origHit=null,this.coordAdjust=null),ge.prototype.handleInteractionStart.apply(this,arguments)},computeCoords:function(){this.component.prepareHits(),this.computeScrollBounds()},handleDragStart:function(t){var e;ge.prototype.handleDragStart.apply(this,arguments),e=this.queryHit(w(t),E(t)),e&&this.handleHitOver(e)},handleDrag:function(t,e,n){var i;ge.prototype.handleDrag.apply(this,arguments),i=this.queryHit(w(n),E(n)),Tt(i,this.hit)||(this.hit&&this.handleHitOut(),i&&this.handleHitOver(i))},handleDragEnd:function(){this.handleHitDone(),ge.prototype.handleDragEnd.apply(this,arguments)},handleHitOver:function(t){var e=Tt(t,this.origHit);this.hit=t,this.trigger("hitOver",this.hit,e,this.origHit)},handleHitOut:function(){this.hit&&(this.trigger("hitOut",this.hit),this.handleHitDone(),this.hit=null)},handleHitDone:function(){this.hit&&this.trigger("hitDone",this.hit)},handleInteractionEnd:function(){ge.prototype.handleInteractionEnd.apply(this,arguments),this.origHit=null,this.hit=null,this.component.releaseHits()},handleScrollEnd:function(){ge.prototype.handleScrollEnd.apply(this,arguments),this.computeCoords()},queryHit:function(t,e){return this.coordAdjust&&(t+=this.coordAdjust.left,e+=this.coordAdjust.top),this.component.queryHit(t,e)}}),ve=St.extend(ce,{options:null,sourceEl:null,el:null,parentEl:null,top0:null,left0:null,y0:null,x0:null,topDelta:null,leftDelta:null,isFollowing:!1,isHidden:!1,isAnimating:!1,constructor:function(e,n){this.options=n=n||{},this.sourceEl=e,this.parentEl=n.parentEl?t(n.parentEl):e.parent()},start:function(e){this.isFollowing||(this.isFollowing=!0,this.y0=E(e),this.x0=w(e),this.topDelta=0,this.leftDelta=0,this.isHidden||this.updatePosition(),b(e)?this.listenTo(t(document),"touchmove",this.handleMove):this.listenTo(t(document),"mousemove",this.handleMove))},stop:function(e,n){function i(){r.isAnimating=!1,r.removeElement(),r.top0=r.left0=null,n&&n()}var r=this,s=this.options.revertDuration;this.isFollowing&&!this.isAnimating&&(this.isFollowing=!1,this.stopListeningTo(t(document)),e&&s&&!this.isHidden?(this.isAnimating=!0,this.el.animate({top:this.top0,left:this.left0},{duration:s,complete:i})):i())},getEl:function(){var t=this.el;return t||(t=this.el=this.sourceEl.clone().addClass(this.options.additionalClass||"").css({position:"absolute",visibility:"",display:this.isHidden?"none":"",margin:0,right:"auto",bottom:"auto",width:this.sourceEl.width(),height:this.sourceEl.height(),opacity:this.options.opacity||"",zIndex:this.options.zIndex}),t.addClass("fc-unselectable"),t.appendTo(this.parentEl)),t},removeElement:function(){this.el&&(this.el.remove(),this.el=null)},updatePosition:function(){var t,e;this.getEl(),null===this.top0&&(t=this.sourceEl.offset(),e=this.el.offsetParent().offset(),this.top0=t.top-e.top,this.left0=t.left-e.left),this.el.css({top:this.top0+this.topDelta,left:this.left0+this.leftDelta})},handleMove:function(t){this.topDelta=E(t)-this.y0,this.leftDelta=w(t)-this.x0,this.isHidden||this.updatePosition()},hide:function(){this.isHidden||(this.isHidden=!0,this.el&&this.el.hide())},show:function(){this.isHidden&&(this.isHidden=!1,this.updatePosition(),this.getEl().show())}}),me=qt.Grid=St.extend(ce,de,{hasDayInteractions:!0,view:null,isRTL:null,start:null,end:null,el:null,elsByFill:null,eventTimeFormat:null,displayEventTime:null,displayEventEnd:null,minResizeDuration:null,largeUnit:null,dayDragListener:null,segDragListener:null,segResizeListener:null,externalDragListener:null,constructor:function(t){this.view=t,this.isRTL=t.opt("isRTL"),this.elsByFill={},this.dayDragListener=this.buildDayDragListener(),this.initMouseIgnoring()},computeEventTimeFormat:function(){return this.view.opt("smallTimeFormat")},computeDisplayEventTime:function(){return!0},computeDisplayEventEnd:function(){return!0},setRange:function(t){this.start=t.start.clone(),this.end=t.end.clone(),this.rangeUpdated(),this.processRangeOptions()},rangeUpdated:function(){},processRangeOptions:function(){var t,e,n=this.view;this.eventTimeFormat=n.opt("eventTimeFormat")||n.opt("timeFormat")||this.computeEventTimeFormat(),t=n.opt("displayEventTime"),null==t&&(t=this.computeDisplayEventTime()),e=n.opt("displayEventEnd"),null==e&&(e=this.computeDisplayEventEnd()),this.displayEventTime=t,this.displayEventEnd=e},spanToSegs:function(t){},diffDates:function(t,e){return this.largeUnit?O(t,e,this.largeUnit):N(t,e)},prepareHits:function(){},releaseHits:function(){},queryHit:function(t,e){},getHitSpan:function(t){},getHitEl:function(t){},setElement:function(t){this.el=t,this.hasDayInteractions&&(D(t),this.bindDayHandler("touchstart",this.dayTouchStart),this.bindDayHandler("mousedown",this.dayMousedown)),this.bindSegHandlers(),this.bindGlobalHandlers()},bindDayHandler:function(e,n){var i=this;this.el.on(e,function(e){if(!t(e.target).is(i.segSelector+","+i.segSelector+" *,.fc-more,a[data-goto]"))return n.call(i,e)})},removeElement:function(){this.unbindGlobalHandlers(),this.clearDragListeners(),this.el.remove()},renderSkeleton:function(){},renderDates:function(){},unrenderDates:function(){},bindGlobalHandlers:function(){this.listenTo(t(document),{dragstart:this.externalDragStart,sortstart:this.externalDragStart})},unbindGlobalHandlers:function(){this.stopListeningTo(t(document))},dayMousedown:function(t){this.isIgnoringMouse||this.dayDragListener.startInteraction(t,{})},dayTouchStart:function(t){var e=this.view,n=e.opt("selectLongPressDelay");(e.isSelected||e.selectedEvent)&&this.tempIgnoreMouse(),null==n&&(n=e.opt("longPressDelay")),this.dayDragListener.startInteraction(t,{delay:n})},buildDayDragListener:function(){var t,e,n=this,i=this.view,r=i.opt("selectable"),l=new pe(this,{scroll:i.opt("dragScroll"),interactionStart:function(){t=l.origHit,e=null},dragStart:function(){i.unselect()},hitOver:function(i,o,l){l&&(o||(t=null),r&&(e=n.computeSelection(n.getHitSpan(l),n.getHitSpan(i)),e?n.renderSelection(e):e===!1&&s()))},hitOut:function(){t=null,e=null,n.unrenderSelection()},hitDone:function(){o()},interactionEnd:function(r,s){s||(t&&!n.isIgnoringMouse&&i.triggerDayClick(n.getHitSpan(t),n.getHitEl(t),r),e&&i.reportSelection(e,r))}});return l},clearDragListeners:function(){this.dayDragListener.endInteraction(),this.segDragListener&&this.segDragListener.endInteraction(),this.segResizeListener&&this.segResizeListener.endInteraction(),this.externalDragListener&&this.externalDragListener.endInteraction()},renderEventLocationHelper:function(t,e){var n=this.fabricateHelperEvent(t,e);return this.renderHelper(n,e)},fabricateHelperEvent:function(t,e){var n=e?Z(e.event):{};return n.start=t.start.clone(),n.end=t.end?t.end.clone():null,n.allDay=null,this.view.calendar.normalizeEventDates(n),n.className=(n.className||[]).concat("fc-helper"),e||(n.editable=!1),n},renderHelper:function(t,e){},unrenderHelper:function(){},renderSelection:function(t){this.renderHighlight(t)},unrenderSelection:function(){this.unrenderHighlight()},computeSelection:function(t,e){var n=this.computeSelectionSpan(t,e);return!(n&&!this.view.calendar.isSelectionSpanAllowed(n))&&n},computeSelectionSpan:function(t,e){var n=[t.start,t.end,e.start,e.end];return n.sort(st),{start:n[0].clone(),end:n[3].clone()}},renderHighlight:function(t){this.renderFill("highlight",this.spanToSegs(t))},unrenderHighlight:function(){this.unrenderFill("highlight")},highlightSegClasses:function(){return["fc-highlight"]},renderBusinessHours:function(){},unrenderBusinessHours:function(){},getNowIndicatorUnit:function(){},renderNowIndicator:function(t){},unrenderNowIndicator:function(){},renderFill:function(t,e){},unrenderFill:function(t){var e=this.elsByFill[t];e&&(e.remove(),delete this.elsByFill[t])},renderFillSegEls:function(e,n){var i,r=this,s=this[e+"SegEl"],o="",l=[];if(n.length){for(i=0;i<n.length;i++)o+=this.fillSegHtml(e,n[i]);t(o).each(function(e,i){var o=n[e],a=t(i);s&&(a=s.call(r,o,a)),a&&(a=t(a),a.is(r.fillSegTag)&&(o.el=a,l.push(o)))})}return l},fillSegTag:"div",fillSegHtml:function(t,e){var n=this[t+"SegClasses"],i=this[t+"SegCss"],r=n?n.call(this,e):[],s=nt(i?i.call(this,e):{});return"<"+this.fillSegTag+(r.length?' class="'+r.join(" ")+'"':"")+(s?' style="'+s+'"':"")+" />"},getDayClasses:function(t,e){var n=this.view,i=n.calendar.getNow(),r=["fc-"+Xt[t.day()]];return 1==n.intervalDuration.as("months")&&t.month()!=n.intervalStart.month()&&r.push("fc-other-month"),t.isSame(i,"day")?(r.push("fc-today"),e!==!0&&r.push(n.highlightStateClass)):t<i?r.push("fc-past"):r.push("fc-future"),r}});me.mixin({segSelector:".fc-event-container > *",mousedOverSeg:null,isDraggingSeg:!1,isResizingSeg:!1,isDraggingExternal:!1,segs:null,renderEvents:function(t){var e,n=[],i=[];for(e=0;e<t.length;e++)(Rt(t[e])?n:i).push(t[e]);this.segs=[].concat(this.renderBgEvents(n),this.renderFgEvents(i))},renderBgEvents:function(t){var e=this.eventsToSegs(t);return this.renderBgSegs(e)||e},renderFgEvents:function(t){var e=this.eventsToSegs(t);return this.renderFgSegs(e)||e},unrenderEvents:function(){this.handleSegMouseout(),this.clearDragListeners(),this.unrenderFgSegs(),this.unrenderBgSegs(),this.segs=null},getEventSegs:function(){return this.segs||[]},renderFgSegs:function(t){},unrenderFgSegs:function(){},renderFgSegEls:function(e,n){var i,r=this.view,s="",o=[];if(e.length){for(i=0;i<e.length;i++)s+=this.fgSegHtml(e[i],n);t(s).each(function(n,i){var s=e[n],l=r.resolveEventEl(s.event,t(i));l&&(l.data("fc-seg",s),s.el=l,o.push(s))})}return o},fgSegHtml:function(t,e){},renderBgSegs:function(t){return this.renderFill("bgEvent",t)},unrenderBgSegs:function(){this.unrenderFill("bgEvent")},bgEventSegEl:function(t,e){return this.view.resolveEventEl(t.event,e)},bgEventSegClasses:function(t){var e=t.event,n=e.source||{};return["fc-bgevent"].concat(e.className,n.className||[])},bgEventSegCss:function(t){return{"background-color":this.getSegSkinCss(t)["background-color"]}},businessHoursSegClasses:function(t){return["fc-nonbusiness","fc-bgevent"]},buildBusinessHourSegs:function(t,e){return this.eventsToSegs(this.buildBusinessHourEvents(t,e))},buildBusinessHourEvents:function(e,n){var i,r=this.view.calendar;return null==n&&(n=r.options.businessHours),i=r.computeBusinessHourEvents(e,n),!i.length&&n&&(i=[t.extend({},ke,{start:this.view.end,end:this.view.end,dow:null})]),i},bindSegHandlers:function(){this.bindSegHandlersToEl(this.el)},bindSegHandlersToEl:function(t){this.bindSegHandlerToEl(t,"touchstart",this.handleSegTouchStart),this.bindSegHandlerToEl(t,"touchend",this.handleSegTouchEnd),this.bindSegHandlerToEl(t,"mouseenter",this.handleSegMouseover),this.bindSegHandlerToEl(t,"mouseleave",this.handleSegMouseout),this.bindSegHandlerToEl(t,"mousedown",this.handleSegMousedown),this.bindSegHandlerToEl(t,"click",this.handleSegClick)},bindSegHandlerToEl:function(e,n,i){var r=this;e.on(n,this.segSelector,function(e){var n=t(this).data("fc-seg");if(n&&!r.isDraggingSeg&&!r.isResizingSeg)return i.call(r,n,e)})},handleSegClick:function(t,e){var n=this.view.publiclyTrigger("eventClick",t.el[0],t.event,e);n===!1&&e.preventDefault()},handleSegMouseover:function(t,e){this.isIgnoringMouse||this.mousedOverSeg||(this.mousedOverSeg=t,this.view.isEventResizable(t.event)&&t.el.addClass("fc-allow-mouse-resize"),this.view.publiclyTrigger("eventMouseover",t.el[0],t.event,e))},handleSegMouseout:function(t,e){e=e||{},this.mousedOverSeg&&(t=t||this.mousedOverSeg,this.mousedOverSeg=null,this.view.isEventResizable(t.event)&&t.el.removeClass("fc-allow-mouse-resize"),this.view.publiclyTrigger("eventMouseout",t.el[0],t.event,e))},handleSegMousedown:function(t,e){var n=this.startSegResize(t,e,{distance:5});!n&&this.view.isEventDraggable(t.event)&&this.buildSegDragListener(t).startInteraction(e,{distance:5})},handleSegTouchStart:function(t,e){var n,i,r=this.view,s=t.event,o=r.isEventSelected(s),l=r.isEventDraggable(s),a=r.isEventResizable(s),u=!1;o&&a&&(u=this.startSegResize(t,e)),u||!l&&!a||(i=r.opt("eventLongPressDelay"),null==i&&(i=r.opt("longPressDelay")),n=l?this.buildSegDragListener(t):this.buildSegSelectListener(t),n.startInteraction(e,{delay:o?0:i})),this.tempIgnoreMouse()},handleSegTouchEnd:function(t,e){this.tempIgnoreMouse()},startSegResize:function(e,n,i){return!!t(n.target).is(".fc-resizer")&&(this.buildSegResizeListener(e,t(n.target).is(".fc-start-resizer")).startInteraction(n,i),!0)},buildSegDragListener:function(t){var e,n,i,r=this,l=this.view,a=l.calendar,u=t.el,c=t.event;if(this.segDragListener)return this.segDragListener;var d=this.segDragListener=new pe(l,{scroll:l.opt("dragScroll"),subjectEl:u,subjectCenter:!0,interactionStart:function(i){t.component=r,e=!1,n=new ve(t.el,{additionalClass:"fc-dragging",parentEl:l.el,opacity:d.isTouch?null:l.opt("dragOpacity"),revertDuration:l.opt("dragRevertDuration"),zIndex:2}),n.hide(),n.start(i)},dragStart:function(n){d.isTouch&&!l.isEventSelected(c)&&l.selectEvent(c),e=!0,r.handleSegMouseout(t,n),r.segDragStart(t,n),l.hideEvent(c)},hitOver:function(e,o,u){var h;t.hit&&(u=t.hit),i=r.computeEventDrop(u.component.getHitSpan(u),e.component.getHitSpan(e),c),i&&!a.isEventSpanAllowed(r.eventToSpan(i),c)&&(s(),i=null),i&&(h=l.renderDrag(i,t))?(h.addClass("fc-dragging"),d.isTouch||r.applyDragOpacity(h),n.hide()):n.show(),o&&(i=null)},hitOut:function(){l.unrenderDrag(),n.show(),i=null},hitDone:function(){o()},interactionEnd:function(s){delete t.component,n.stop(!i,function(){e&&(l.unrenderDrag(),r.segDragStop(t,s)),i?l.reportEventDrop(c,i,r.largeUnit,u,s):l.showEvent(c)}),r.segDragListener=null}});return d},buildSegSelectListener:function(t){var e=this,n=this.view,i=t.event;if(this.segDragListener)return this.segDragListener;var r=this.segDragListener=new ge({dragStart:function(t){r.isTouch&&!n.isEventSelected(i)&&n.selectEvent(i)},interactionEnd:function(t){e.segDragListener=null}});return r},segDragStart:function(t,e){this.isDraggingSeg=!0,this.view.publiclyTrigger("eventDragStart",t.el[0],t.event,e,{})},segDragStop:function(t,e){this.isDraggingSeg=!1,this.view.publiclyTrigger("eventDragStop",t.el[0],t.event,e,{})},computeEventDrop:function(t,e,n){var i,r,s=this.view.calendar,o=t.start,l=e.start;return o.hasTime()===l.hasTime()?(i=this.diffDates(l,o),n.allDay&&W(i)?(r={start:n.start.clone(),end:s.getEventEnd(n),allDay:!1},s.normalizeEventTimes(r)):r=Ht(n),r.start.add(i),r.end&&r.end.add(i)):r={start:l.clone(),end:null,allDay:!l.hasTime()},r},applyDragOpacity:function(t){var e=this.view.opt("dragOpacity");null!=e&&t.css("opacity",e)},externalDragStart:function(e,n){var i,r,s=this.view;s.opt("droppable")&&(i=t((n?n.item:null)||e.target),r=s.opt("dropAccept"),(t.isFunction(r)?r.call(i[0],i):i.is(r))&&(this.isDraggingExternal||this.listenToExternalDrag(i,e,n)))},listenToExternalDrag:function(t,e,n){var i,r=this,l=this.view.calendar,a=Mt(t),u=r.externalDragListener=new pe(this,{interactionStart:function(){r.isDraggingExternal=!0},hitOver:function(t){i=r.computeExternalDrop(t.component.getHitSpan(t),a),i&&!l.isExternalSpanAllowed(r.eventToSpan(i),i,a.eventProps)&&(s(),i=null),i&&r.renderDrag(i)},hitOut:function(){i=null},hitDone:function(){o(),r.unrenderDrag()},interactionEnd:function(e){i&&r.view.reportExternalDrop(a,i,t,e,n),r.isDraggingExternal=!1,r.externalDragListener=null}});u.startDrag(e)},computeExternalDrop:function(t,e){var n=this.view.calendar,i={start:n.applyTimezone(t.start),end:null};return e.startTime&&!i.start.hasTime()&&i.start.time(e.startTime),e.duration&&(i.end=i.start.clone().add(e.duration)),i},renderDrag:function(t,e){},unrenderDrag:function(){},buildSegResizeListener:function(t,e){var n,i,r=this,l=this.view,a=l.calendar,u=t.el,c=t.event,d=a.getEventEnd(c),h=this.segResizeListener=new pe(this,{scroll:l.opt("dragScroll"),subjectEl:u,interactionStart:function(){n=!1},dragStart:function(e){n=!0,r.handleSegMouseout(t,e),r.segResizeStart(t,e)},hitOver:function(n,o,u){var h=r.getHitSpan(u),f=r.getHitSpan(n);i=e?r.computeEventStartResize(h,f,c):r.computeEventEndResize(h,f,c),i&&(a.isEventSpanAllowed(r.eventToSpan(i),c)?i.start.isSame(c.start.clone().stripZone())&&i.end.isSame(d.clone().stripZone())&&(i=null):(s(),i=null)),i&&(l.hideEvent(c),r.renderEventResize(i,t))},hitOut:function(){i=null,l.showEvent(c)},hitDone:function(){r.unrenderEventResize(),o()},interactionEnd:function(e){n&&r.segResizeStop(t,e),i?l.reportEventResize(c,i,r.largeUnit,u,e):l.showEvent(c),r.segResizeListener=null}});return h},segResizeStart:function(t,e){this.isResizingSeg=!0,this.view.publiclyTrigger("eventResizeStart",t.el[0],t.event,e,{})},segResizeStop:function(t,e){this.isResizingSeg=!1,this.view.publiclyTrigger("eventResizeStop",t.el[0],t.event,e,{})},computeEventStartResize:function(t,e,n){return this.computeEventResize("start",t,e,n)},computeEventEndResize:function(t,e,n){return this.computeEventResize("end",t,e,n)},computeEventResize:function(t,e,n,i){var r,s,o=this.view.calendar,l=this.diffDates(n[t],e[t]);return r={start:i.start.clone(),end:o.getEventEnd(i),allDay:i.allDay},r.allDay&&W(l)&&(r.allDay=!1,o.normalizeEventTimes(r)),r[t].add(l),r.start.isBefore(r.end)||(s=this.minResizeDuration||(i.allDay?o.defaultAllDayEventDuration:o.defaultTimedEventDuration),"start"==t?r.start=r.end.clone().subtract(s):r.end=r.start.clone().add(s)),r},renderEventResize:function(t,e){},unrenderEventResize:function(){},getEventTimeText:function(t,e,n){return null==e&&(e=this.eventTimeFormat),null==n&&(n=this.displayEventEnd),this.displayEventTime&&t.start.hasTime()?n&&t.end?this.view.formatRange(t,e):t.start.format(e):""},getSegClasses:function(t,e,n){var i=this.view,r=["fc-event",t.isStart?"fc-start":"fc-not-start",t.isEnd?"fc-end":"fc-not-end"].concat(this.getSegCustomClasses(t));return e&&r.push("fc-draggable"),n&&r.push("fc-resizable"),i.isEventSelected(t.event)&&r.push("fc-selected"),r},getSegCustomClasses:function(t){var e=t.event;return[].concat(e.className,e.source?e.source.className:[])},getSegSkinCss:function(t){return{"background-color":this.getSegBackgroundColor(t),"border-color":this.getSegBorderColor(t),color:this.getSegTextColor(t)}},getSegBackgroundColor:function(t){return t.event.backgroundColor||t.event.color||this.getSegDefaultBackgroundColor(t)},getSegDefaultBackgroundColor:function(t){var e=t.event.source||{};return e.backgroundColor||e.color||this.view.opt("eventBackgroundColor")||this.view.opt("eventColor")},getSegBorderColor:function(t){return t.event.borderColor||t.event.color||this.getSegDefaultBorderColor(t)},getSegDefaultBorderColor:function(t){var e=t.event.source||{};return e.borderColor||e.color||this.view.opt("eventBorderColor")||this.view.opt("eventColor")},getSegTextColor:function(t){return t.event.textColor||this.getSegDefaultTextColor(t)},getSegDefaultTextColor:function(t){var e=t.event.source||{};return e.textColor||this.view.opt("eventTextColor")},eventToSegs:function(t){return this.eventsToSegs([t])},eventToSpan:function(t){return this.eventToSpans(t)[0]},eventToSpans:function(t){var e=this.eventToRange(t);return this.eventRangeToSpans(e,t)},eventsToSegs:function(e,n){var i=this,r=kt(e),s=[];return t.each(r,function(t,e){var r,o=[];for(r=0;r<e.length;r++)o.push(i.eventToRange(e[r]));if(xt(e[0]))for(o=i.invertRanges(o),r=0;r<o.length;r++)s.push.apply(s,i.eventRangeToSegs(o[r],e[0],n));else for(r=0;r<o.length;r++)s.push.apply(s,i.eventRangeToSegs(o[r],e[r],n))}),s},eventToRange:function(t){var e=this.view.calendar,n=t.start.clone().stripZone(),i=(t.end?t.end.clone():e.getDefaultEventEnd(null!=t.allDay?t.allDay:!t.start.hasTime(),t.start)).stripZone();return e.localizeMoment(n),e.localizeMoment(i),{start:n,end:i}},eventRangeToSegs:function(t,e,n){var i,r=this.eventRangeToSpans(t,e),s=[];for(i=0;i<r.length;i++)s.push.apply(s,this.eventSpanToSegs(r[i],e,n));return s},eventRangeToSpans:function(e,n){return[t.extend({},e)]},eventSpanToSegs:function(t,e,n){var i,r,s=n?n(t):this.spanToSegs(t);
for(i=0;i<s.length;i++)r=s[i],r.event=e,r.eventStartMS=+t.start,r.eventDurationMS=t.end-t.start;return s},invertRanges:function(t){var e,n,i=this.view,r=i.start.clone(),s=i.end.clone(),o=[],l=r;for(t.sort(Lt),e=0;e<t.length;e++)n=t[e],n.start>l&&o.push({start:l,end:n.start}),l=n.end;return l<s&&o.push({start:l,end:s}),o},sortEventSegs:function(t){t.sort(lt(this,"compareEventSegs"))},compareEventSegs:function(t,e){return t.eventStartMS-e.eventStartMS||e.eventDurationMS-t.eventDurationMS||e.event.allDay-t.event.allDay||M(t.event,e.event,this.view.eventOrderSpecs)}}),qt.pluckEventDateProps=Ht,qt.isBgEvent=Rt,qt.dataAttrPrefix="";var ye=qt.DayTableMixin={breakOnWeeks:!1,dayDates:null,dayIndices:null,daysPerRow:null,rowCnt:null,colCnt:null,colHeadFormat:null,updateDayTable:function(){for(var t,e,n,i=this.view,r=this.start.clone(),s=-1,o=[],l=[];r.isBefore(this.end);)i.isHiddenDay(r)?o.push(s+.5):(s++,o.push(s),l.push(r.clone())),r.add(1,"days");if(this.breakOnWeeks){for(e=l[0].day(),t=1;t<l.length&&l[t].day()!=e;t++);n=Math.ceil(l.length/t)}else n=1,t=l.length;this.dayDates=l,this.dayIndices=o,this.daysPerRow=t,this.rowCnt=n,this.updateDayTableCols()},updateDayTableCols:function(){this.colCnt=this.computeColCnt(),this.colHeadFormat=this.view.opt("columnFormat")||this.computeColHeadFormat()},computeColCnt:function(){return this.daysPerRow},getCellDate:function(t,e){return this.dayDates[this.getCellDayIndex(t,e)].clone()},getCellRange:function(t,e){var n=this.getCellDate(t,e),i=n.clone().add(1,"days");return{start:n,end:i}},getCellDayIndex:function(t,e){return t*this.daysPerRow+this.getColDayIndex(e)},getColDayIndex:function(t){return this.isRTL?this.colCnt-1-t:t},getDateDayIndex:function(t){var e=this.dayIndices,n=t.diff(this.start,"days");return n<0?e[0]-1:n>=e.length?e[e.length-1]+1:e[n]},computeColHeadFormat:function(){return this.rowCnt>1||this.colCnt>10?"ddd":this.colCnt>1?this.view.opt("dayOfMonthFormat"):"dddd"},sliceRangeByRow:function(t){var e,n,i,r,s,o=this.daysPerRow,l=this.view.computeDayRange(t),a=this.getDateDayIndex(l.start),u=this.getDateDayIndex(l.end.clone().subtract(1,"days")),c=[];for(e=0;e<this.rowCnt;e++)n=e*o,i=n+o-1,r=Math.max(a,n),s=Math.min(u,i),r=Math.ceil(r),s=Math.floor(s),r<=s&&c.push({row:e,firstRowDayIndex:r-n,lastRowDayIndex:s-n,isStart:r===a,isEnd:s===u});return c},sliceRangeByDay:function(t){var e,n,i,r,s,o,l=this.daysPerRow,a=this.view.computeDayRange(t),u=this.getDateDayIndex(a.start),c=this.getDateDayIndex(a.end.clone().subtract(1,"days")),d=[];for(e=0;e<this.rowCnt;e++)for(n=e*l,i=n+l-1,r=n;r<=i;r++)s=Math.max(u,r),o=Math.min(c,r),s=Math.ceil(s),o=Math.floor(o),s<=o&&d.push({row:e,firstRowDayIndex:s-n,lastRowDayIndex:o-n,isStart:s===u,isEnd:o===c});return d},renderHeadHtml:function(){var t=this.view;return'<div class="fc-row '+t.widgetHeaderClass+'"><table><thead>'+this.renderHeadTrHtml()+"</thead></table></div>"},renderHeadIntroHtml:function(){return this.renderIntroHtml()},renderHeadTrHtml:function(){return"<tr>"+(this.isRTL?"":this.renderHeadIntroHtml())+this.renderHeadDateCellsHtml()+(this.isRTL?this.renderHeadIntroHtml():"")+"</tr>"},renderHeadDateCellsHtml:function(){var t,e,n=[];for(t=0;t<this.colCnt;t++)e=this.getCellDate(0,t),n.push(this.renderHeadDateCellHtml(e));return n.join("")},renderHeadDateCellHtml:function(t,e,n){var i=this.view,r=["fc-day-header",i.widgetHeaderClass];return 1===this.rowCnt?r=r.concat(this.getDayClasses(t,!0)):r.push("fc-"+Xt[t.day()]),'<th class="'+r.join(" ")+'"'+(1===this.rowCnt?' data-date="'+t.format("YYYY-MM-DD")+'"':"")+(e>1?' colspan="'+e+'"':"")+(n?" "+n:"")+">"+i.buildGotoAnchorHtml({date:t,forceOff:this.rowCnt>1||1===this.colCnt},tt(t.format(this.colHeadFormat)))+"</th>"},renderBgTrHtml:function(t){return"<tr>"+(this.isRTL?"":this.renderBgIntroHtml(t))+this.renderBgCellsHtml(t)+(this.isRTL?this.renderBgIntroHtml(t):"")+"</tr>"},renderBgIntroHtml:function(t){return this.renderIntroHtml()},renderBgCellsHtml:function(t){var e,n,i=[];for(e=0;e<this.colCnt;e++)n=this.getCellDate(t,e),i.push(this.renderBgCellHtml(n));return i.join("")},renderBgCellHtml:function(t,e){var n=this.view,i=this.getDayClasses(t);return i.unshift("fc-day",n.widgetContentClass),'<td class="'+i.join(" ")+'" data-date="'+t.format("YYYY-MM-DD")+'"'+(e?" "+e:"")+"></td>"},renderIntroHtml:function(){},bookendCells:function(t){var e=this.renderIntroHtml();e&&(this.isRTL?t.append(e):t.prepend(e))}},Se=qt.DayGrid=me.extend(ye,{numbersVisible:!1,bottomCoordPadding:0,rowEls:null,cellEls:null,helperEls:null,rowCoordCache:null,colCoordCache:null,renderDates:function(t){var e,n,i=this.view,r=this.rowCnt,s=this.colCnt,o="";for(e=0;e<r;e++)o+=this.renderDayRowHtml(e,t);for(this.el.html(o),this.rowEls=this.el.find(".fc-row"),this.cellEls=this.el.find(".fc-day"),this.rowCoordCache=new fe({els:this.rowEls,isVertical:!0}),this.colCoordCache=new fe({els:this.cellEls.slice(0,this.colCnt),isHorizontal:!0}),e=0;e<r;e++)for(n=0;n<s;n++)i.publiclyTrigger("dayRender",null,this.getCellDate(e,n),this.getCellEl(e,n))},unrenderDates:function(){this.removeSegPopover()},renderBusinessHours:function(){var t=this.buildBusinessHourSegs(!0);this.renderFill("businessHours",t,"bgevent")},unrenderBusinessHours:function(){this.unrenderFill("businessHours")},renderDayRowHtml:function(t,e){var n=this.view,i=["fc-row","fc-week",n.widgetContentClass];return e&&i.push("fc-rigid"),'<div class="'+i.join(" ")+'"><div class="fc-bg"><table>'+this.renderBgTrHtml(t)+'</table></div><div class="fc-content-skeleton"><table>'+(this.numbersVisible?"<thead>"+this.renderNumberTrHtml(t)+"</thead>":"")+"</table></div></div>"},renderNumberTrHtml:function(t){return"<tr>"+(this.isRTL?"":this.renderNumberIntroHtml(t))+this.renderNumberCellsHtml(t)+(this.isRTL?this.renderNumberIntroHtml(t):"")+"</tr>"},renderNumberIntroHtml:function(t){return this.renderIntroHtml()},renderNumberCellsHtml:function(t){var e,n,i=[];for(e=0;e<this.colCnt;e++)n=this.getCellDate(t,e),i.push(this.renderNumberCellHtml(n));return i.join("")},renderNumberCellHtml:function(t){var e,n,i="";return this.view.dayNumbersVisible||this.view.cellWeekNumbersVisible?(e=this.getDayClasses(t),e.unshift("fc-day-top"),this.view.cellWeekNumbersVisible&&(n="ISO"===t._locale._fullCalendar_weekCalc?1:t._locale.firstDayOfWeek()),i+='<td class="'+e.join(" ")+'" data-date="'+t.format()+'">',this.view.cellWeekNumbersVisible&&t.day()==n&&(i+=this.view.buildGotoAnchorHtml({date:t,type:"week"},{class:"fc-week-number"},t.format("w"))),this.view.dayNumbersVisible&&(i+=this.view.buildGotoAnchorHtml(t,{class:"fc-day-number"},t.date())),i+="</td>"):"<td/>"},computeEventTimeFormat:function(){return this.view.opt("extraSmallTimeFormat")},computeDisplayEventEnd:function(){return 1==this.colCnt},rangeUpdated:function(){this.updateDayTable()},spanToSegs:function(t){var e,n,i=this.sliceRangeByRow(t);for(e=0;e<i.length;e++)n=i[e],this.isRTL?(n.leftCol=this.daysPerRow-1-n.lastRowDayIndex,n.rightCol=this.daysPerRow-1-n.firstRowDayIndex):(n.leftCol=n.firstRowDayIndex,n.rightCol=n.lastRowDayIndex);return i},prepareHits:function(){this.colCoordCache.build(),this.rowCoordCache.build(),this.rowCoordCache.bottoms[this.rowCnt-1]+=this.bottomCoordPadding},releaseHits:function(){this.colCoordCache.clear(),this.rowCoordCache.clear()},queryHit:function(t,e){if(this.colCoordCache.isLeftInBounds(t)&&this.rowCoordCache.isTopInBounds(e)){var n=this.colCoordCache.getHorizontalIndex(t),i=this.rowCoordCache.getVerticalIndex(e);if(null!=i&&null!=n)return this.getCellHit(i,n)}},getHitSpan:function(t){return this.getCellRange(t.row,t.col)},getHitEl:function(t){return this.getCellEl(t.row,t.col)},getCellHit:function(t,e){return{row:t,col:e,component:this,left:this.colCoordCache.getLeftOffset(e),right:this.colCoordCache.getRightOffset(e),top:this.rowCoordCache.getTopOffset(t),bottom:this.rowCoordCache.getBottomOffset(t)}},getCellEl:function(t,e){return this.cellEls.eq(t*this.colCnt+e)},renderDrag:function(t,e){if(this.renderHighlight(this.eventToSpan(t)),e&&e.component!==this)return this.renderEventLocationHelper(t,e)},unrenderDrag:function(){this.unrenderHighlight(),this.unrenderHelper()},renderEventResize:function(t,e){return this.renderHighlight(this.eventToSpan(t)),this.renderEventLocationHelper(t,e)},unrenderEventResize:function(){this.unrenderHighlight(),this.unrenderHelper()},renderHelper:function(e,n){var i,r=[],s=this.eventToSegs(e);return s=this.renderFgSegEls(s),i=this.renderSegRows(s),this.rowEls.each(function(e,s){var o,l=t(s),a=t('<div class="fc-helper-skeleton"><table/></div>');o=n&&n.row===e?n.el.position().top:l.find(".fc-content-skeleton tbody").position().top,a.css("top",o).find("table").append(i[e].tbodyEl),l.append(a),r.push(a[0])}),this.helperEls=t(r)},unrenderHelper:function(){this.helperEls&&(this.helperEls.remove(),this.helperEls=null)},fillSegTag:"td",renderFill:function(e,n,i){var r,s,o,l=[];for(n=this.renderFillSegEls(e,n),r=0;r<n.length;r++)s=n[r],o=this.renderFillRow(e,s,i),this.rowEls.eq(s.row).append(o),l.push(o[0]);return this.elsByFill[e]=t(l),n},renderFillRow:function(e,n,i){var r,s,o=this.colCnt,l=n.leftCol,a=n.rightCol+1;return i=i||e.toLowerCase(),r=t('<div class="fc-'+i+'-skeleton"><table><tr/></table></div>'),s=r.find("tr"),l>0&&s.append('<td colspan="'+l+'"/>'),s.append(n.el.attr("colspan",a-l)),a<o&&s.append('<td colspan="'+(o-a)+'"/>'),this.bookendCells(s),r}});Se.mixin({rowStructs:null,unrenderEvents:function(){this.removeSegPopover(),me.prototype.unrenderEvents.apply(this,arguments)},getEventSegs:function(){return me.prototype.getEventSegs.call(this).concat(this.popoverSegs||[])},renderBgSegs:function(e){var n=t.grep(e,function(t){return t.event.allDay});return me.prototype.renderBgSegs.call(this,n)},renderFgSegs:function(e){var n;return e=this.renderFgSegEls(e),n=this.rowStructs=this.renderSegRows(e),this.rowEls.each(function(e,i){t(i).find(".fc-content-skeleton > table").append(n[e].tbodyEl)}),e},unrenderFgSegs:function(){for(var t,e=this.rowStructs||[];t=e.pop();)t.tbodyEl.remove();this.rowStructs=null},renderSegRows:function(t){var e,n,i=[];for(e=this.groupSegRows(t),n=0;n<e.length;n++)i.push(this.renderSegRow(n,e[n]));return i},fgSegHtml:function(t,e){var n,i,r=this.view,s=t.event,o=r.isEventDraggable(s),l=!e&&s.allDay&&t.isStart&&r.isEventResizableFromStart(s),a=!e&&s.allDay&&t.isEnd&&r.isEventResizableFromEnd(s),u=this.getSegClasses(t,o,l||a),c=nt(this.getSegSkinCss(t)),d="";return u.unshift("fc-day-grid-event","fc-h-event"),t.isStart&&(n=this.getEventTimeText(s),n&&(d='<span class="fc-time">'+tt(n)+"</span>")),i='<span class="fc-title">'+(tt(s.title||"")||"&nbsp;")+"</span>",'<a class="'+u.join(" ")+'"'+(s.url?' href="'+tt(s.url)+'"':"")+(c?' style="'+c+'"':"")+'><div class="fc-content">'+(this.isRTL?i+" "+d:d+" "+i)+"</div>"+(l?'<div class="fc-resizer fc-start-resizer" />':"")+(a?'<div class="fc-resizer fc-end-resizer" />':"")+"</a>"},renderSegRow:function(e,n){function i(e){for(;o<e;)c=(m[r-1]||[])[o],c?c.attr("rowspan",parseInt(c.attr("rowspan")||1,10)+1):(c=t("<td/>"),l.append(c)),v[r][o]=c,m[r][o]=c,o++}var r,s,o,l,a,u,c,d=this.colCnt,h=this.buildSegLevels(n),f=Math.max(1,h.length),g=t("<tbody/>"),p=[],v=[],m=[];for(r=0;r<f;r++){if(s=h[r],o=0,l=t("<tr/>"),p.push([]),v.push([]),m.push([]),s)for(a=0;a<s.length;a++){for(u=s[a],i(u.leftCol),c=t('<td class="fc-event-container"/>').append(u.el),u.leftCol!=u.rightCol?c.attr("colspan",u.rightCol-u.leftCol+1):m[r][o]=c;o<=u.rightCol;)v[r][o]=c,p[r][o]=u,o++;l.append(c)}i(d),this.bookendCells(l),g.append(l)}return{row:e,tbodyEl:g,cellMatrix:v,segMatrix:p,segLevels:h,segs:n}},buildSegLevels:function(t){var e,n,i,r=[];for(this.sortEventSegs(t),e=0;e<t.length;e++){for(n=t[e],i=0;i<r.length&&Bt(n,r[i]);i++);n.level=i,(r[i]||(r[i]=[])).push(n)}for(i=0;i<r.length;i++)r[i].sort(zt);return r},groupSegRows:function(t){var e,n=[];for(e=0;e<this.rowCnt;e++)n.push([]);for(e=0;e<t.length;e++)n[t[e].row].push(t[e]);return n}}),Se.mixin({segPopover:null,popoverSegs:null,removeSegPopover:function(){this.segPopover&&this.segPopover.hide()},limitRows:function(t){var e,n,i=this.rowStructs||[];for(e=0;e<i.length;e++)this.unlimitRow(e),n=!!t&&("number"==typeof t?t:this.computeRowLevelLimit(e)),n!==!1&&this.limitRow(e,n)},computeRowLevelLimit:function(e){function n(e,n){s=Math.max(s,t(n).outerHeight())}var i,r,s,o=this.rowEls.eq(e),l=o.height(),a=this.rowStructs[e].tbodyEl.children();for(i=0;i<a.length;i++)if(r=a.eq(i).removeClass("fc-limited"),s=0,r.find("> td > :first-child").each(n),r.position().top+s>l)return i;return!1},limitRow:function(e,n){function i(i){for(;b<i;)u=S.getCellSegs(e,b,n),u.length&&(h=s[n-1][b],y=S.renderMoreLink(e,b,u),m=t("<div/>").append(y),h.append(m),E.push(m[0])),b++}var r,s,o,l,a,u,c,d,h,f,g,p,v,m,y,S=this,w=this.rowStructs[e],E=[],b=0;if(n&&n<w.segLevels.length){for(r=w.segLevels[n-1],s=w.cellMatrix,o=w.tbodyEl.children().slice(n).addClass("fc-limited").get(),l=0;l<r.length;l++){for(a=r[l],i(a.leftCol),d=[],c=0;b<=a.rightCol;)u=this.getCellSegs(e,b,n),d.push(u),c+=u.length,b++;if(c){for(h=s[n-1][a.leftCol],f=h.attr("rowspan")||1,g=[],p=0;p<d.length;p++)v=t('<td class="fc-more-cell"/>').attr("rowspan",f),u=d[p],y=this.renderMoreLink(e,a.leftCol+p,[a].concat(u)),m=t("<div/>").append(y),v.append(m),g.push(v[0]),E.push(v[0]);h.addClass("fc-limited").after(t(g)),o.push(h[0])}}i(this.colCnt),w.moreEls=t(E),w.limitedEls=t(o)}},unlimitRow:function(t){var e=this.rowStructs[t];e.moreEls&&(e.moreEls.remove(),e.moreEls=null),e.limitedEls&&(e.limitedEls.removeClass("fc-limited"),e.limitedEls=null)},renderMoreLink:function(e,n,i){var r=this,s=this.view;return t('<a class="fc-more"/>').text(this.getMoreLinkText(i.length)).on("click",function(o){var l=s.opt("eventLimitClick"),a=r.getCellDate(e,n),u=t(this),c=r.getCellEl(e,n),d=r.getCellSegs(e,n),h=r.resliceDaySegs(d,a),f=r.resliceDaySegs(i,a);"function"==typeof l&&(l=s.publiclyTrigger("eventLimitClick",null,{date:a,dayEl:c,moreEl:u,segs:h,hiddenSegs:f},o)),"popover"===l?r.showSegPopover(e,n,u,h):"string"==typeof l&&s.calendar.zoomTo(a,l)})},showSegPopover:function(t,e,n,i){var r,s,o=this,l=this.view,a=n.parent();r=1==this.rowCnt?l.el:this.rowEls.eq(t),s={className:"fc-more-popover",content:this.renderSegPopoverContent(t,e,i),parentEl:this.view.el,top:r.offset().top,autoHide:!0,viewportConstrain:l.opt("popoverViewportConstrain"),hide:function(){if(o.popoverSegs)for(var t,e=0;e<o.popoverSegs.length;++e)t=o.popoverSegs[e],l.publiclyTrigger("eventDestroy",t.event,t.event,t.el);o.segPopover.removeElement(),o.segPopover=null,o.popoverSegs=null}},this.isRTL?s.right=a.offset().left+a.outerWidth()+1:s.left=a.offset().left-1,this.segPopover=new he(s),this.segPopover.show(),this.bindSegHandlersToEl(this.segPopover.el)},renderSegPopoverContent:function(e,n,i){var r,s=this.view,o=s.opt("theme"),l=this.getCellDate(e,n).format(s.opt("dayPopoverFormat")),a=t('<div class="fc-header '+s.widgetHeaderClass+'"><span class="fc-close '+(o?"ui-icon ui-icon-closethick":"fc-icon fc-icon-x")+'"></span><span class="fc-title">'+tt(l)+'</span><div class="fc-clear"/></div><div class="fc-body '+s.widgetContentClass+'"><div class="fc-event-container"></div></div>'),u=a.find(".fc-event-container");for(i=this.renderFgSegEls(i,!0),this.popoverSegs=i,r=0;r<i.length;r++)this.prepareHits(),i[r].hit=this.getCellHit(e,n),this.releaseHits(),u.append(i[r].el);return a},resliceDaySegs:function(e,n){var i=t.map(e,function(t){return t.event}),r=n.clone(),s=r.clone().add(1,"days"),o={start:r,end:s};return e=this.eventsToSegs(i,function(t){var e=F(t,o);return e?[e]:[]}),this.sortEventSegs(e),e},getMoreLinkText:function(t){var e=this.view.opt("eventLimitText");return"function"==typeof e?e(t):"+"+t+" "+e},getCellSegs:function(t,e,n){for(var i,r=this.rowStructs[t].segMatrix,s=n||0,o=[];s<r.length;)i=r[s][e],i&&o.push(i),s++;return o}});var we=qt.TimeGrid=me.extend(ye,{slotDuration:null,snapDuration:null,snapsPerSlot:null,minTime:null,maxTime:null,labelFormat:null,labelInterval:null,colEls:null,slatContainerEl:null,slatEls:null,nowIndicatorEls:null,colCoordCache:null,slatCoordCache:null,constructor:function(){me.apply(this,arguments),this.processOptions()},renderDates:function(){this.el.html(this.renderHtml()),this.colEls=this.el.find(".fc-day"),this.slatContainerEl=this.el.find(".fc-slats"),this.slatEls=this.slatContainerEl.find("tr"),this.colCoordCache=new fe({els:this.colEls,isHorizontal:!0}),this.slatCoordCache=new fe({els:this.slatEls,isVertical:!0}),this.renderContentSkeleton()},renderHtml:function(){return'<div class="fc-bg"><table>'+this.renderBgTrHtml(0)+'</table></div><div class="fc-slats"><table>'+this.renderSlatRowHtml()+"</table></div>"},renderSlatRowHtml:function(){for(var t,n,i,r=this.view,s=this.isRTL,o="",l=e.duration(+this.minTime);l<this.maxTime;)t=this.start.clone().time(l),n=ot(_(l,this.labelInterval)),i='<td class="fc-axis fc-time '+r.widgetContentClass+'" '+r.axisStyleAttr()+">"+(n?"<span>"+tt(t.format(this.labelFormat))+"</span>":"")+"</td>",o+='<tr data-time="'+t.format("HH:mm:ss")+'"'+(n?"":' class="fc-minor"')+">"+(s?"":i)+'<td class="'+r.widgetContentClass+'"/>'+(s?i:"")+"</tr>",l.add(this.slotDuration);return o},processOptions:function(){var n,i=this.view,r=i.opt("slotDuration"),s=i.opt("snapDuration");r=e.duration(r),s=s?e.duration(s):r,this.slotDuration=r,this.snapDuration=s,this.snapsPerSlot=r/s,this.minResizeDuration=s,this.minTime=e.duration(i.opt("minTime")),this.maxTime=e.duration(i.opt("maxTime")),n=i.opt("slotLabelFormat"),t.isArray(n)&&(n=n[n.length-1]),this.labelFormat=n||i.opt("smallTimeFormat"),n=i.opt("slotLabelInterval"),this.labelInterval=n?e.duration(n):this.computeLabelInterval(r)},computeLabelInterval:function(t){var n,i,r;for(n=Oe.length-1;n>=0;n--)if(i=e.duration(Oe[n]),r=_(i,t),ot(r)&&r>1)return i;return e.duration(t)},computeEventTimeFormat:function(){return this.view.opt("noMeridiemTimeFormat")},computeDisplayEventEnd:function(){return!0},prepareHits:function(){this.colCoordCache.build(),this.slatCoordCache.build()},releaseHits:function(){this.colCoordCache.clear()},queryHit:function(t,e){var n=this.snapsPerSlot,i=this.colCoordCache,r=this.slatCoordCache;if(i.isLeftInBounds(t)&&r.isTopInBounds(e)){var s=i.getHorizontalIndex(t),o=r.getVerticalIndex(e);if(null!=s&&null!=o){var l=r.getTopOffset(o),a=r.getHeight(o),u=(e-l)/a,c=Math.floor(u*n),d=o*n+c,h=l+c/n*a,f=l+(c+1)/n*a;return{col:s,snap:d,component:this,left:i.getLeftOffset(s),right:i.getRightOffset(s),top:h,bottom:f}}}},getHitSpan:function(t){var e,n=this.getCellDate(0,t.col),i=this.computeSnapTime(t.snap);return n.time(i),e=n.clone().add(this.snapDuration),{start:n,end:e}},getHitEl:function(t){return this.colEls.eq(t.col)},rangeUpdated:function(){this.updateDayTable()},computeSnapTime:function(t){return e.duration(this.minTime+this.snapDuration*t)},spanToSegs:function(t){var e,n=this.sliceRangeByTimes(t);for(e=0;e<n.length;e++)this.isRTL?n[e].col=this.daysPerRow-1-n[e].dayIndex:n[e].col=n[e].dayIndex;return n},sliceRangeByTimes:function(t){var e,n,i,r,s=[];for(n=0;n<this.daysPerRow;n++)i=this.dayDates[n].clone(),r={start:i.clone().time(this.minTime),end:i.clone().time(this.maxTime)},e=F(t,r),e&&(e.dayIndex=n,s.push(e));return s},updateSize:function(t){this.slatCoordCache.build(),t&&this.updateSegVerticals([].concat(this.fgSegs||[],this.bgSegs||[],this.businessSegs||[]))},getTotalSlatHeight:function(){return this.slatContainerEl.outerHeight()},computeDateTop:function(t,n){return this.computeTimeTop(e.duration(t-n.clone().stripTime()))},computeTimeTop:function(t){var e,n,i=this.slatEls.length,r=(t-this.minTime)/this.slotDuration;return r=Math.max(0,r),r=Math.min(i,r),e=Math.floor(r),e=Math.min(e,i-1),n=r-e,this.slatCoordCache.getTopPosition(e)+this.slatCoordCache.getHeight(e)*n},renderDrag:function(t,e){return e?this.renderEventLocationHelper(t,e):void this.renderHighlight(this.eventToSpan(t))},unrenderDrag:function(){this.unrenderHelper(),this.unrenderHighlight()},renderEventResize:function(t,e){return this.renderEventLocationHelper(t,e)},unrenderEventResize:function(){this.unrenderHelper()},renderHelper:function(t,e){return this.renderHelperSegs(this.eventToSegs(t),e)},unrenderHelper:function(){this.unrenderHelperSegs()},renderBusinessHours:function(){this.renderBusinessSegs(this.buildBusinessHourSegs())},unrenderBusinessHours:function(){this.unrenderBusinessSegs()},getNowIndicatorUnit:function(){return"minute"},renderNowIndicator:function(e){var n,i=this.spanToSegs({start:e,end:e}),r=this.computeDateTop(e,e),s=[];for(n=0;n<i.length;n++)s.push(t('<div class="fc-now-indicator fc-now-indicator-line"></div>').css("top",r).appendTo(this.colContainerEls.eq(i[n].col))[0]);i.length>0&&s.push(t('<div class="fc-now-indicator fc-now-indicator-arrow"></div>').css("top",r).appendTo(this.el.find(".fc-content-skeleton"))[0]),this.nowIndicatorEls=t(s)},unrenderNowIndicator:function(){this.nowIndicatorEls&&(this.nowIndicatorEls.remove(),this.nowIndicatorEls=null)},renderSelection:function(t){this.view.opt("selectHelper")?this.renderEventLocationHelper(t):this.renderHighlight(t)},unrenderSelection:function(){this.unrenderHelper(),this.unrenderHighlight()},renderHighlight:function(t){this.renderHighlightSegs(this.spanToSegs(t))},unrenderHighlight:function(){this.unrenderHighlightSegs()}});we.mixin({colContainerEls:null,fgContainerEls:null,bgContainerEls:null,helperContainerEls:null,highlightContainerEls:null,businessContainerEls:null,fgSegs:null,bgSegs:null,helperSegs:null,highlightSegs:null,businessSegs:null,renderContentSkeleton:function(){var e,n,i="";for(e=0;e<this.colCnt;e++)i+='<td><div class="fc-content-col"><div class="fc-event-container fc-helper-container"></div><div class="fc-event-container"></div><div class="fc-highlight-container"></div><div class="fc-bgevent-container"></div><div class="fc-business-container"></div></div></td>';n=t('<div class="fc-content-skeleton"><table><tr>'+i+"</tr></table></div>"),this.colContainerEls=n.find(".fc-content-col"),this.helperContainerEls=n.find(".fc-helper-container"),this.fgContainerEls=n.find(".fc-event-container:not(.fc-helper-container)"),this.bgContainerEls=n.find(".fc-bgevent-container"),this.highlightContainerEls=n.find(".fc-highlight-container"),this.businessContainerEls=n.find(".fc-business-container"),this.bookendCells(n.find("tr")),this.el.append(n)},renderFgSegs:function(t){return t=this.renderFgSegsIntoContainers(t,this.fgContainerEls),this.fgSegs=t,t},unrenderFgSegs:function(){this.unrenderNamedSegs("fgSegs")},renderHelperSegs:function(e,n){var i,r,s,o=[];for(e=this.renderFgSegsIntoContainers(e,this.helperContainerEls),i=0;i<e.length;i++)r=e[i],n&&n.col===r.col&&(s=n.el,r.el.css({left:s.css("left"),right:s.css("right"),"margin-left":s.css("margin-left"),"margin-right":s.css("margin-right")})),o.push(r.el[0]);return this.helperSegs=e,t(o)},unrenderHelperSegs:function(){this.unrenderNamedSegs("helperSegs")},renderBgSegs:function(t){return t=this.renderFillSegEls("bgEvent",t),this.updateSegVerticals(t),this.attachSegsByCol(this.groupSegsByCol(t),this.bgContainerEls),this.bgSegs=t,t},unrenderBgSegs:function(){this.unrenderNamedSegs("bgSegs")},renderHighlightSegs:function(t){t=this.renderFillSegEls("highlight",t),this.updateSegVerticals(t),this.attachSegsByCol(this.groupSegsByCol(t),this.highlightContainerEls),this.highlightSegs=t},unrenderHighlightSegs:function(){this.unrenderNamedSegs("highlightSegs")},renderBusinessSegs:function(t){t=this.renderFillSegEls("businessHours",t),this.updateSegVerticals(t),this.attachSegsByCol(this.groupSegsByCol(t),this.businessContainerEls),this.businessSegs=t},unrenderBusinessSegs:function(){this.unrenderNamedSegs("businessSegs")},groupSegsByCol:function(t){var e,n=[];for(e=0;e<this.colCnt;e++)n.push([]);for(e=0;e<t.length;e++)n[t[e].col].push(t[e]);return n},attachSegsByCol:function(t,e){var n,i,r;for(n=0;n<this.colCnt;n++)for(i=t[n],r=0;r<i.length;r++)e.eq(n).append(i[r].el)},unrenderNamedSegs:function(t){var e,n=this[t];if(n){for(e=0;e<n.length;e++)n[e].el.remove();this[t]=null}},renderFgSegsIntoContainers:function(t,e){var n,i;for(t=this.renderFgSegEls(t),n=this.groupSegsByCol(t),i=0;i<this.colCnt;i++)this.updateFgSegCoords(n[i]);return this.attachSegsByCol(n,e),t},fgSegHtml:function(t,e){var n,i,r,s=this.view,o=t.event,l=s.isEventDraggable(o),a=!e&&t.isStart&&s.isEventResizableFromStart(o),u=!e&&t.isEnd&&s.isEventResizableFromEnd(o),c=this.getSegClasses(t,l,a||u),d=nt(this.getSegSkinCss(t));return c.unshift("fc-time-grid-event","fc-v-event"),s.isMultiDayEvent(o)?(t.isStart||t.isEnd)&&(n=this.getEventTimeText(t),i=this.getEventTimeText(t,"LT"),r=this.getEventTimeText(t,null,!1)):(n=this.getEventTimeText(o),i=this.getEventTimeText(o,"LT"),r=this.getEventTimeText(o,null,!1)),'<a class="'+c.join(" ")+'"'+(o.url?' href="'+tt(o.url)+'"':"")+(d?' style="'+d+'"':"")+'><div class="fc-content">'+(n?'<div class="fc-time" data-start="'+tt(r)+'" data-full="'+tt(i)+'"><span>'+tt(n)+"</span></div>":"")+(o.title?'<div class="fc-title">'+tt(o.title)+"</div>":"")+'</div><div class="fc-bg"/>'+(u?'<div class="fc-resizer fc-end-resizer" />':"")+"</a>"},updateSegVerticals:function(t){this.computeSegVerticals(t),this.assignSegVerticals(t)},computeSegVerticals:function(t){var e,n;for(e=0;e<t.length;e++)n=t[e],n.top=this.computeDateTop(n.start,n.start),n.bottom=this.computeDateTop(n.end,n.start)},assignSegVerticals:function(t){var e,n;for(e=0;e<t.length;e++)n=t[e],n.el.css(this.generateSegVerticalCss(n))},generateSegVerticalCss:function(t){return{top:t.top,bottom:-t.bottom}},updateFgSegCoords:function(t){this.computeSegVerticals(t),this.computeFgSegHorizontals(t),this.assignSegVerticals(t),this.assignFgSegHorizontals(t)},computeFgSegHorizontals:function(t){var e,n,i;if(this.sortEventSegs(t),e=Ft(t),Nt(e),n=e[0]){for(i=0;i<n.length;i++)Gt(n[i]);for(i=0;i<n.length;i++)this.computeFgSegForwardBack(n[i],0,0)}},computeFgSegForwardBack:function(t,e,n){var i,r=t.forwardSegs;if(void 0===t.forwardCoord)for(r.length?(this.sortForwardSegs(r),this.computeFgSegForwardBack(r[0],e+1,n),t.forwardCoord=r[0].backwardCoord):t.forwardCoord=1,t.backwardCoord=t.forwardCoord-(t.forwardCoord-n)/(e+1),i=0;i<r.length;i++)this.computeFgSegForwardBack(r[i],0,t.forwardCoord)},sortForwardSegs:function(t){t.sort(lt(this,"compareForwardSegs"))},compareForwardSegs:function(t,e){return e.forwardPressure-t.forwardPressure||(t.backwardCoord||0)-(e.backwardCoord||0)||this.compareEventSegs(t,e)},assignFgSegHorizontals:function(t){var e,n;for(e=0;e<t.length;e++)n=t[e],n.el.css(this.generateFgSegHorizontalCss(n)),n.bottom-n.top<30&&n.el.addClass("fc-short")},generateFgSegHorizontalCss:function(t){var e,n,i=this.view.opt("slotEventOverlap"),r=t.backwardCoord,s=t.forwardCoord,o=this.generateSegVerticalCss(t);return i&&(s=Math.min(1,r+2*(s-r))),this.isRTL?(e=1-s,n=r):(e=r,n=1-s),o.zIndex=t.level+1,o.left=100*e+"%",o.right=100*n+"%",i&&t.forwardPressure&&(o[this.isRTL?"marginLeft":"marginRight"]=20),o}});var Ee=qt.View=St.extend(ue,ce,{type:null,name:null,title:null,calendar:null,options:null,el:null,isDateSet:!1,isDateRendered:!1,dateRenderQueue:null,isEventsBound:!1,isEventsSet:!1,isEventsRendered:!1,eventRenderQueue:null,start:null,end:null,intervalStart:null,intervalEnd:null,intervalDuration:null,intervalUnit:null,isRTL:!1,isSelected:!1,selectedEvent:null,eventOrderSpecs:null,widgetHeaderClass:null,widgetContentClass:null,highlightStateClass:null,nextDayThreshold:null,isHiddenDayHash:null,isNowIndicatorRendered:null,initialNowDate:null,initialNowQueriedMs:null,nowIndicatorTimeoutID:null,nowIndicatorIntervalID:null,constructor:function(t,n,i,r){this.calendar=t,this.type=this.name=n,this.options=i,this.intervalDuration=r||e.duration(1,"day"),this.nextDayThreshold=e.duration(this.opt("nextDayThreshold")),this.initThemingProps(),this.initHiddenDays(),this.isRTL=this.opt("isRTL"),this.eventOrderSpecs=L(this.opt("eventOrder")),this.dateRenderQueue=new Dt,this.eventRenderQueue=new Dt(this.opt("eventRenderWait")),this.initialize()},initialize:function(){},opt:function(t){return this.options[t]},publiclyTrigger:function(t,e){var n=this.calendar;return n.publiclyTrigger.apply(n,[t,e||this].concat(Array.prototype.slice.call(arguments,2),[this]))},rejectOn:function(t,e){var n=this;return new bt(function(i,r){function s(){n.off(t,r)}n.one(t,r),e.then(function(t){s(),i(t)},function(){s(),r()})})},setRange:function(e){t.extend(this,e),this.updateTitle()},computeRange:function(t){var e,n,i=A(this.intervalDuration),r=t.clone().startOf(i),s=r.clone().add(this.intervalDuration);return/year|month|week|day/.test(i)?(r.stripTime(),s.stripTime()):(r.hasTime()||(r=this.calendar.time(0)),s.hasTime()||(s=this.calendar.time(0))),e=r.clone(),e=this.skipHiddenDays(e),n=s.clone(),n=this.skipHiddenDays(n,-1,!0),{intervalUnit:i,intervalStart:r,intervalEnd:s,start:e,end:n}},computePrevDate:function(t){return this.massageCurrentDate(t.clone().startOf(this.intervalUnit).subtract(this.intervalDuration),-1)},computeNextDate:function(t){return this.massageCurrentDate(t.clone().startOf(this.intervalUnit).add(this.intervalDuration))},massageCurrentDate:function(t,e){return this.intervalDuration.as("days")<=1&&this.isHiddenDay(t)&&(t=this.skipHiddenDays(t,e),t.startOf("day")),t},updateTitle:function(){this.title=this.computeTitle(),this.calendar.setToolbarsTitle(this.title)},computeTitle:function(){return this.formatRange({start:this.calendar.applyTimezone(this.intervalStart),end:this.calendar.applyTimezone(this.intervalEnd)},this.opt("titleFormat")||this.computeTitleFormat(),this.opt("titleRangeSeparator"))},computeTitleFormat:function(){return"year"==this.intervalUnit?"YYYY":"month"==this.intervalUnit?this.opt("monthYearFormat"):this.intervalDuration.as("days")>1?"ll":"LL"},formatRange:function(t,e,n){var i=t.end;return i.hasTime()||(i=i.clone().subtract(1)),gt(t.start,i,e,n,this.opt("isRTL"))},getAllDayHtml:function(){return this.opt("allDayHtml")||tt(this.opt("allDayText"))},buildGotoAnchorHtml:function(e,n,i){var r,s,o,l;return t.isPlainObject(e)?(r=e.date,s=e.type,o=e.forceOff):r=e,r=qt.moment(r),l={date:r.format("YYYY-MM-DD"),type:s||"day"},"string"==typeof n&&(i=n,n=null),n=n?" "+it(n):"",i=i||"",!o&&this.opt("navLinks")?"<a"+n+' data-goto="'+tt(JSON.stringify(l))+'">'+i+"</a>":"<span"+n+">"+i+"</span>"},setElement:function(t){this.el=t,this.bindGlobalHandlers(),this.renderSkeleton()},removeElement:function(){this.unsetDate(),this.unrenderSkeleton(),this.unbindGlobalHandlers(),this.el.remove()},renderSkeleton:function(){},unrenderSkeleton:function(){},setDate:function(t){var e=this.isDateSet;this.isDateSet=!0,this.handleDate(t,e),this.trigger(e?"dateReset":"dateSet",t)},unsetDate:function(){this.isDateSet&&(this.isDateSet=!1,this.handleDateUnset(),this.trigger("dateUnset"))},handleDate:function(t,e){var n=this;this.unbindEvents(),this.requestDateRender(t).then(function(){n.bindEvents()})},handleDateUnset:function(){this.unbindEvents(),this.requestDateUnrender()},requestDateRender:function(t){var e=this;return this.dateRenderQueue.add(function(){return e.executeDateRender(t)})},requestDateUnrender:function(){var t=this;return this.dateRenderQueue.add(function(){return t.executeDateUnrender()})},executeDateRender:function(t){var e=this;return t?this.captureInitialScroll():this.captureScroll(),this.freezeHeight(),this.executeDateUnrender().then(function(){t&&e.setRange(e.computeRange(t)),e.render&&e.render(),e.renderDates(),e.updateSize(),e.renderBusinessHours(),e.startNowIndicator(),e.thawHeight(),e.releaseScroll(),e.isDateRendered=!0,e.onDateRender(),e.trigger("dateRender")})},executeDateUnrender:function(){var t=this;return t.isDateRendered?this.requestEventsUnrender().then(function(){t.unselect(),t.stopNowIndicator(),t.triggerUnrender(),t.unrenderBusinessHours(),t.unrenderDates(),t.destroy&&t.destroy(),t.isDateRendered=!1,t.trigger("dateUnrender")}):bt.resolve()},onDateRender:function(){this.triggerRender()},renderDates:function(){},unrenderDates:function(){},triggerRender:function(){this.publiclyTrigger("viewRender",this,this,this.el);
},triggerUnrender:function(){this.publiclyTrigger("viewDestroy",this,this,this.el)},bindGlobalHandlers:function(){this.listenTo(t(document),"mousedown",this.handleDocumentMousedown),this.listenTo(t(document),"touchstart",this.processUnselect)},unbindGlobalHandlers:function(){this.stopListeningTo(t(document))},initThemingProps:function(){var t=this.opt("theme")?"ui":"fc";this.widgetHeaderClass=t+"-widget-header",this.widgetContentClass=t+"-widget-content",this.highlightStateClass=t+"-state-highlight"},renderBusinessHours:function(){},unrenderBusinessHours:function(){},startNowIndicator:function(){var t,n,i,r=this;this.opt("nowIndicator")&&(t=this.getNowIndicatorUnit(),t&&(n=lt(this,"updateNowIndicator"),this.initialNowDate=this.calendar.getNow(),this.initialNowQueriedMs=+new Date,this.renderNowIndicator(this.initialNowDate),this.isNowIndicatorRendered=!0,i=this.initialNowDate.clone().startOf(t).add(1,t)-this.initialNowDate,this.nowIndicatorTimeoutID=setTimeout(function(){r.nowIndicatorTimeoutID=null,n(),i=+e.duration(1,t),i=Math.max(100,i),r.nowIndicatorIntervalID=setInterval(n,i)},i)))},updateNowIndicator:function(){this.isNowIndicatorRendered&&(this.unrenderNowIndicator(),this.renderNowIndicator(this.initialNowDate.clone().add(new Date-this.initialNowQueriedMs)))},stopNowIndicator:function(){this.isNowIndicatorRendered&&(this.nowIndicatorTimeoutID&&(clearTimeout(this.nowIndicatorTimeoutID),this.nowIndicatorTimeoutID=null),this.nowIndicatorIntervalID&&(clearTimeout(this.nowIndicatorIntervalID),this.nowIndicatorIntervalID=null),this.unrenderNowIndicator(),this.isNowIndicatorRendered=!1)},getNowIndicatorUnit:function(){},renderNowIndicator:function(t){},unrenderNowIndicator:function(){},updateSize:function(t){t&&this.captureScroll(),this.updateHeight(t),this.updateWidth(t),this.updateNowIndicator(),t&&this.releaseScroll()},updateWidth:function(t){},updateHeight:function(t){var e=this.calendar;this.setHeight(e.getSuggestedViewHeight(),e.isHeightAuto())},setHeight:function(t,e){},capturedScroll:null,capturedScrollDepth:0,captureScroll:function(){return!this.capturedScrollDepth++&&(this.capturedScroll=this.isDateRendered?this.queryScroll():{},!0)},captureInitialScroll:function(e){this.captureScroll()&&(this.capturedScroll.isInitial=!0,e?t.extend(this.capturedScroll,e):this.capturedScroll.isComputed=!0)},releaseScroll:function(){var e=this.capturedScroll,n=this.discardScroll();e.isComputed&&(n?t.extend(e,this.computeInitialScroll()):e=null),e&&(e.isInitial?this.hardSetScroll(e):this.setScroll(e))},discardScroll:function(){return!--this.capturedScrollDepth&&(this.capturedScroll=null,!0)},computeInitialScroll:function(){return{}},queryScroll:function(){return{}},hardSetScroll:function(t){var e=this,n=function(){e.setScroll(t)};n(),setTimeout(n,0)},setScroll:function(t){},freezeHeight:function(){this.calendar.freezeContentHeight()},thawHeight:function(){this.calendar.thawContentHeight()},bindEvents:function(){var t=this;this.isEventsBound||(this.isEventsBound=!0,this.rejectOn("eventsUnbind",this.requestEvents()).then(function(e){t.listenTo(t.calendar,"eventsReset",t.setEvents),t.setEvents(e)}))},unbindEvents:function(){this.isEventsBound&&(this.isEventsBound=!1,this.stopListeningTo(this.calendar,"eventsReset"),this.unsetEvents(),this.trigger("eventsUnbind"))},setEvents:function(t){var e=this.isEventSet;this.isEventsSet=!0,this.handleEvents(t,e),this.trigger(e?"eventsReset":"eventsSet",t)},unsetEvents:function(){this.isEventsSet&&(this.isEventsSet=!1,this.handleEventsUnset(),this.trigger("eventsUnset"))},whenEventsSet:function(){var t=this;return this.isEventsSet?bt.resolve(this.getCurrentEvents()):new bt(function(e){t.one("eventsSet",e)})},handleEvents:function(t,e){this.requestEventsRender(t)},handleEventsUnset:function(){this.requestEventsUnrender()},requestEventsRender:function(t){var e=this;return this.eventRenderQueue.add(function(){return e.executeEventsRender(t)})},requestEventsUnrender:function(){var t=this;return this.isEventsRendered?this.eventRenderQueue.addQuickly(function(){return t.executeEventsUnrender()}):bt.resolve()},requestCurrentEventsRender:function(){return this.isEventsSet?void this.requestEventsRender(this.getCurrentEvents()):bt.reject()},executeEventsRender:function(t){var e=this;return this.captureScroll(),this.freezeHeight(),this.executeEventsUnrender().then(function(){e.renderEvents(t),e.thawHeight(),e.releaseScroll(),e.isEventsRendered=!0,e.onEventsRender(),e.trigger("eventsRender")})},executeEventsUnrender:function(){return this.isEventsRendered&&(this.onBeforeEventsUnrender(),this.captureScroll(),this.freezeHeight(),this.destroyEvents&&this.destroyEvents(),this.unrenderEvents(),this.thawHeight(),this.releaseScroll(),this.isEventsRendered=!1,this.trigger("eventsUnrender")),bt.resolve()},onEventsRender:function(){this.renderedEventSegEach(function(t){this.publiclyTrigger("eventAfterRender",t.event,t.event,t.el)}),this.publiclyTrigger("eventAfterAllRender")},onBeforeEventsUnrender:function(){this.renderedEventSegEach(function(t){this.publiclyTrigger("eventDestroy",t.event,t.event,t.el)})},renderEvents:function(t){},unrenderEvents:function(){},requestEvents:function(){return this.calendar.requestEvents(this.start,this.end)},getCurrentEvents:function(){return this.calendar.getPrunedEventCache()},resolveEventEl:function(e,n){var i=this.publiclyTrigger("eventRender",e,e,n);return i===!1?n=null:i&&i!==!0&&(n=t(i)),n},showEvent:function(t){this.renderedEventSegEach(function(t){t.el.css("visibility","")},t)},hideEvent:function(t){this.renderedEventSegEach(function(t){t.el.css("visibility","hidden")},t)},renderedEventSegEach:function(t,e){var n,i=this.getEventSegs();for(n=0;n<i.length;n++)e&&i[n].event._id!==e._id||i[n].el&&t.call(this,i[n])},getEventSegs:function(){return[]},isEventDraggable:function(t){return this.isEventStartEditable(t)},isEventStartEditable:function(t){return J(t.startEditable,(t.source||{}).startEditable,this.opt("eventStartEditable"),this.isEventGenerallyEditable(t))},isEventGenerallyEditable:function(t){return J(t.editable,(t.source||{}).editable,this.opt("editable"))},reportEventDrop:function(t,e,n,i,r){var s=this.calendar,o=s.mutateEvent(t,e,n),l=function(){o.undo(),s.reportEventChange()};this.triggerEventDrop(t,o.dateDelta,l,i,r),s.reportEventChange()},triggerEventDrop:function(t,e,n,i,r){this.publiclyTrigger("eventDrop",i[0],t,e,n,r,{})},reportExternalDrop:function(e,n,i,r,s){var o,l,a=e.eventProps;a&&(o=t.extend({},a,n),l=this.calendar.renderEvent(o,e.stick)[0]),this.triggerExternalDrop(l,n,i,r,s)},triggerExternalDrop:function(t,e,n,i,r){this.publiclyTrigger("drop",n[0],e.start,i,r),t&&this.publiclyTrigger("eventReceive",null,t)},renderDrag:function(t,e){},unrenderDrag:function(){},isEventResizableFromStart:function(t){return this.opt("eventResizableFromStart")&&this.isEventResizable(t)},isEventResizableFromEnd:function(t){return this.isEventResizable(t)},isEventResizable:function(t){var e=t.source||{};return J(t.durationEditable,e.durationEditable,this.opt("eventDurationEditable"),t.editable,e.editable,this.opt("editable"))},reportEventResize:function(t,e,n,i,r){var s=this.calendar,o=s.mutateEvent(t,e,n),l=function(){o.undo(),s.reportEventChange()};this.triggerEventResize(t,o.durationDelta,l,i,r),s.reportEventChange()},triggerEventResize:function(t,e,n,i,r){this.publiclyTrigger("eventResize",i[0],t,e,n,r,{})},select:function(t,e){this.unselect(e),this.renderSelection(t),this.reportSelection(t,e)},renderSelection:function(t){},reportSelection:function(t,e){this.isSelected=!0,this.triggerSelect(t,e)},triggerSelect:function(t,e){this.publiclyTrigger("select",null,this.calendar.applyTimezone(t.start),this.calendar.applyTimezone(t.end),e)},unselect:function(t){this.isSelected&&(this.isSelected=!1,this.destroySelection&&this.destroySelection(),this.unrenderSelection(),this.publiclyTrigger("unselect",null,t))},unrenderSelection:function(){},selectEvent:function(t){this.selectedEvent&&this.selectedEvent===t||(this.unselectEvent(),this.renderedEventSegEach(function(t){t.el.addClass("fc-selected")},t),this.selectedEvent=t)},unselectEvent:function(){this.selectedEvent&&(this.renderedEventSegEach(function(t){t.el.removeClass("fc-selected")},this.selectedEvent),this.selectedEvent=null)},isEventSelected:function(t){return this.selectedEvent&&this.selectedEvent._id===t._id},handleDocumentMousedown:function(t){S(t)&&this.processUnselect(t)},processUnselect:function(t){this.processRangeUnselect(t),this.processEventUnselect(t)},processRangeUnselect:function(e){var n;this.isSelected&&this.opt("unselectAuto")&&(n=this.opt("unselectCancel"),n&&t(e.target).closest(n).length||this.unselect(e))},processEventUnselect:function(e){this.selectedEvent&&(t(e.target).closest(".fc-selected").length||this.unselectEvent())},triggerDayClick:function(t,e,n){this.publiclyTrigger("dayClick",e,this.calendar.applyTimezone(t.start),n)},initHiddenDays:function(){var e,n=this.opt("hiddenDays")||[],i=[],r=0;for(this.opt("weekends")===!1&&n.push(0,6),e=0;e<7;e++)(i[e]=t.inArray(e,n)!==-1)||r++;if(!r)throw"invalid hiddenDays";this.isHiddenDayHash=i},isHiddenDay:function(t){return e.isMoment(t)&&(t=t.day()),this.isHiddenDayHash[t]},skipHiddenDays:function(t,e,n){var i=t.clone();for(e=e||1;this.isHiddenDayHash[(i.day()+(n?e:0)+7)%7];)i.add(e,"days");return i},computeDayRange:function(t){var e,n=t.start.clone().stripTime(),i=t.end,r=null;return i&&(r=i.clone().stripTime(),e=+i.time(),e&&e>=this.nextDayThreshold&&r.add(1,"days")),(!i||r<=n)&&(r=n.clone().add(1,"days")),{start:n,end:r}},isMultiDayEvent:function(t){var e=this.computeDayRange(t);return e.end.diff(e.start,"days")>1}}),be=qt.Scroller=St.extend({el:null,scrollEl:null,overflowX:null,overflowY:null,constructor:function(t){t=t||{},this.overflowX=t.overflowX||t.overflow||"auto",this.overflowY=t.overflowY||t.overflow||"auto"},render:function(){this.el=this.renderEl(),this.applyOverflow()},renderEl:function(){return this.scrollEl=t('<div class="fc-scroller"></div>')},clear:function(){this.setHeight("auto"),this.applyOverflow()},destroy:function(){this.el.remove()},applyOverflow:function(){this.scrollEl.css({"overflow-x":this.overflowX,"overflow-y":this.overflowY})},lockOverflow:function(t){var e=this.overflowX,n=this.overflowY;t=t||this.getScrollbarWidths(),"auto"===e&&(e=t.top||t.bottom||this.scrollEl[0].scrollWidth-1>this.scrollEl[0].clientWidth?"scroll":"hidden"),"auto"===n&&(n=t.left||t.right||this.scrollEl[0].scrollHeight-1>this.scrollEl[0].clientHeight?"scroll":"hidden"),this.scrollEl.css({"overflow-x":e,"overflow-y":n})},setHeight:function(t){this.scrollEl.height(t)},getScrollTop:function(){return this.scrollEl.scrollTop()},setScrollTop:function(t){this.scrollEl.scrollTop(t)},getClientWidth:function(){return this.scrollEl[0].clientWidth},getClientHeight:function(){return this.scrollEl[0].clientHeight},getScrollbarWidths:function(){return p(this.scrollEl)}});Vt.prototype.proxyCall=function(t){var e=Array.prototype.slice.call(arguments,1),n=[];return this.items.forEach(function(i){n.push(i[t].apply(i,e))}),n};var De=qt.Calendar=St.extend({dirDefaults:null,localeDefaults:null,overrides:null,dynamicOverrides:null,options:null,viewSpecCache:null,view:null,header:null,footer:null,loadingLevel:0,constructor:_t,initialize:function(){},populateOptionsHash:function(){var t,e,i,r;t=J(this.dynamicOverrides.locale,this.overrides.locale),e=Te[t],e||(t=De.defaults.locale,e=Te[t]||{}),i=J(this.dynamicOverrides.isRTL,this.overrides.isRTL,e.isRTL,De.defaults.isRTL),r=i?De.rtlDefaults:{},this.dirDefaults=r,this.localeDefaults=e,this.options=n([De.defaults,r,e,this.overrides,this.dynamicOverrides]),Yt(this.options)},getViewSpec:function(t){var e=this.viewSpecCache;return e[t]||(e[t]=this.buildViewSpec(t))},getUnitViewSpec:function(e){var n,i,r;if(t.inArray(e,Kt)!=-1)for(n=this.header.getViewsWithButtons(),t.each(qt.views,function(t){n.push(t)}),i=0;i<n.length;i++)if(r=this.getViewSpec(n[i]),r&&r.singleUnit==e)return r},buildViewSpec:function(t){for(var i,r,s,o,l=this.overrides.views||{},a=[],u=[],c=[],d=t;d;)i=Zt[d],r=l[d],d=null,"function"==typeof i&&(i={class:i}),i&&(a.unshift(i),u.unshift(i.defaults||{}),s=s||i.duration,d=d||i.type),r&&(c.unshift(r),s=s||r.duration,d=d||r.type);return i=q(a),i.type=t,!!i.class&&(s&&(s=e.duration(s),s.valueOf()&&(i.duration=s,o=A(s),1===s.as(o)&&(i.singleUnit=o,c.unshift(l[o]||{})))),i.defaults=n(u),i.overrides=n(c),this.buildViewSpecOptions(i),this.buildViewSpecButtonText(i,t),i)},buildViewSpecOptions:function(t){t.options=n([De.defaults,t.defaults,this.dirDefaults,this.localeDefaults,this.overrides,t.overrides,this.dynamicOverrides]),Yt(t.options)},buildViewSpecButtonText:function(t,e){function n(n){var i=n.buttonText||{};return i[e]||(t.buttonTextKey?i[t.buttonTextKey]:null)||(t.singleUnit?i[t.singleUnit]:null)}t.buttonTextOverride=n(this.dynamicOverrides)||n(this.overrides)||t.overrides.buttonText,t.buttonTextDefault=n(this.localeDefaults)||n(this.dirDefaults)||t.defaults.buttonText||n(De.defaults)||(t.duration?this.humanizeDuration(t.duration):null)||e},instantiateView:function(t){var e=this.getViewSpec(t);return new e.class(this,t,e.options,e.duration)},isValidViewType:function(t){return Boolean(this.getViewSpec(t))},pushLoading:function(){this.loadingLevel++||this.publiclyTrigger("loading",null,!0,this.view)},popLoading:function(){--this.loadingLevel||this.publiclyTrigger("loading",null,!1,this.view)},buildSelectSpan:function(t,e){var n,i=this.moment(t).stripZone();return n=e?this.moment(e).stripZone():i.hasTime()?i.clone().add(this.defaultTimedEventDuration):i.clone().add(this.defaultAllDayEventDuration),{start:i,end:n}}});De.mixin(ue),De.mixin({optionHandlers:null,bindOption:function(t,e){this.bindOptions([t],e)},bindOptions:function(t,e){var n,i={func:e,names:t};for(n=0;n<t.length;n++)this.registerOptionHandlerObj(t[n],i);this.triggerOptionHandlerObj(i)},registerOptionHandlerObj:function(t,e){(this.optionHandlers[t]||(this.optionHandlers[t]=[])).push(e)},triggerOptionHandlers:function(t){var e,n=this.optionHandlers[t]||[];for(e=0;e<n.length;e++)this.triggerOptionHandlerObj(n[e])},triggerOptionHandlerObj:function(t){var e,n=t.names,i=[];for(e=0;e<n.length;e++)i.push(this.options[n[e]]);t.func.apply(this,i)}}),De.defaults={titleRangeSeparator:" – ",monthYearFormat:"MMMM YYYY",defaultTimedEventDuration:"02:00:00",defaultAllDayEventDuration:{days:1},forceEventDuration:!1,nextDayThreshold:"09:00:00",defaultView:"month",aspectRatio:1.35,header:{left:"title",center:"",right:"today prev,next"},weekends:!0,weekNumbers:!1,weekNumberTitle:"W",weekNumberCalculation:"local",scrollTime:"06:00:00",lazyFetching:!0,startParam:"start",endParam:"end",timezoneParam:"timezone",timezone:!1,isRTL:!1,buttonText:{prev:"prev",next:"next",prevYear:"prev year",nextYear:"next year",year:"year",today:"today",month:"month",week:"week",day:"day"},buttonIcons:{prev:"left-single-arrow",next:"right-single-arrow",prevYear:"left-double-arrow",nextYear:"right-double-arrow"},allDayText:"all-day",theme:!1,themeButtonIcons:{prev:"circle-triangle-w",next:"circle-triangle-e",prevYear:"seek-prev",nextYear:"seek-next"},dragOpacity:.75,dragRevertDuration:500,dragScroll:!0,unselectAuto:!0,dropAccept:"*",eventOrder:"title",eventLimit:!1,eventLimitText:"more",eventLimitClick:"popover",dayPopoverFormat:"LL",handleWindowResize:!0,windowResizeDelay:100,longPressDelay:1e3},De.englishDefaults={dayPopoverFormat:"dddd, MMMM D"},De.rtlDefaults={header:{left:"next,prev today",center:"",right:"title"},buttonIcons:{prev:"right-single-arrow",next:"left-single-arrow",prevYear:"right-double-arrow",nextYear:"left-double-arrow"},themeButtonIcons:{prev:"circle-triangle-e",next:"circle-triangle-w",nextYear:"seek-prev",prevYear:"seek-next"}};var Te=qt.locales={};qt.datepickerLocale=function(e,n,i){var r=Te[e]||(Te[e]={});r.isRTL=i.isRTL,r.weekNumberTitle=i.weekHeader,t.each(Ce,function(t,e){r[t]=e(i)}),t.datepicker&&(t.datepicker.regional[n]=t.datepicker.regional[e]=i,t.datepicker.regional.en=t.datepicker.regional[""],t.datepicker.setDefaults(i))},qt.locale=function(e,i){var r,s;r=Te[e]||(Te[e]={}),i&&(r=Te[e]=n([r,i])),s=Wt(e),t.each(He,function(t,e){null==r[t]&&(r[t]=e(s,r))}),De.defaults.locale=e};var Ce={buttonText:function(t){return{prev:et(t.prevText),next:et(t.nextText),today:et(t.currentText)}},monthYearFormat:function(t){return t.showMonthAfterYear?"YYYY["+t.yearSuffix+"] MMMM":"MMMM YYYY["+t.yearSuffix+"]"}},He={dayOfMonthFormat:function(t,e){var n=t.longDateFormat("l");return n=n.replace(/^Y+[^\w\s]*|[^\w\s]*Y+$/g,""),e.isRTL?n+=" ddd":n="ddd "+n,n},mediumTimeFormat:function(t){return t.longDateFormat("LT").replace(/\s*a$/i,"a")},smallTimeFormat:function(t){return t.longDateFormat("LT").replace(":mm","(:mm)").replace(/(\Wmm)$/,"($1)").replace(/\s*a$/i,"a")},extraSmallTimeFormat:function(t){return t.longDateFormat("LT").replace(":mm","(:mm)").replace(/(\Wmm)$/,"($1)").replace(/\s*a$/i,"t")},hourFormat:function(t){return t.longDateFormat("LT").replace(":mm","").replace(/(\Wmm)$/,"").replace(/\s*a$/i,"a")},noMeridiemTimeFormat:function(t){return t.longDateFormat("LT").replace(/\s*a$/i,"")}},Re={smallDayDateFormat:function(t){return t.isRTL?"D dd":"dd D"},weekFormat:function(t){return t.isRTL?"w[ "+t.weekNumberTitle+"]":"["+t.weekNumberTitle+" ]w"},smallWeekFormat:function(t){return t.isRTL?"w["+t.weekNumberTitle+"]":"["+t.weekNumberTitle+"]w"}};qt.locale("en",De.englishDefaults),qt.sourceNormalizers=[],qt.sourceFetchers=[];var xe={dataType:"json",cache:!1},Ie=1;De.prototype.normalizeEvent=function(t){},De.prototype.spanContainsSpan=function(t,e){var n=t.start.clone().stripZone(),i=this.getEventEnd(t).stripZone();return e.start>=n&&e.end<=i},De.prototype.getPeerEvents=function(t,e){var n,i,r=this.getEventCache(),s=[];for(n=0;n<r.length;n++)i=r[n],e&&e._id===i._id||s.push(i);return s},De.prototype.isEventSpanAllowed=function(t,e){var n=e.source||{},i=J(e.constraint,n.constraint,this.options.eventConstraint),r=J(e.overlap,n.overlap,this.options.eventOverlap);return this.isSpanAllowed(t,i,r,e)&&(!this.options.eventAllow||this.options.eventAllow(t,e)!==!1)},De.prototype.isExternalSpanAllowed=function(e,n,i){var r,s;return i&&(r=t.extend({},i,n),s=this.expandEvent(this.buildEventFromInput(r))[0]),s?this.isEventSpanAllowed(e,s):this.isSelectionSpanAllowed(e)},De.prototype.isSelectionSpanAllowed=function(t){return this.isSpanAllowed(t,this.options.selectConstraint,this.options.selectOverlap)&&(!this.options.selectAllow||this.options.selectAllow(t)!==!1)},De.prototype.isSpanAllowed=function(t,e,n,i){var r,s,o,l,a,u;if(null!=e&&(r=this.constraintToEvents(e))){for(s=!1,l=0;l<r.length;l++)if(this.spanContainsSpan(r[l],t)){s=!0;break}if(!s)return!1}for(o=this.getPeerEvents(t,i),l=0;l<o.length;l++)if(a=o[l],this.eventIntersectsRange(a,t)){if(n===!1)return!1;if("function"==typeof n&&!n(a,i))return!1;if(i){if(u=J(a.overlap,(a.source||{}).overlap),u===!1)return!1;if("function"==typeof u&&!u(i,a))return!1}}return!0},De.prototype.constraintToEvents=function(t){return"businessHours"===t?this.getCurrentBusinessHourEvents():"object"==typeof t?null!=t.start?this.expandEvent(this.buildEventFromInput(t)):null:this.clientEvents(t)},De.prototype.eventIntersectsRange=function(t,e){var n=t.start.clone().stripZone(),i=this.getEventEnd(t).stripZone();return e.start<i&&e.end>n};var ke={id:"_fcBusinessHours",start:"09:00",end:"17:00",dow:[1,2,3,4,5],rendering:"inverse-background"};De.prototype.getCurrentBusinessHourEvents=function(t){return this.computeBusinessHourEvents(t,this.options.businessHours)},De.prototype.computeBusinessHourEvents=function(e,n){return n===!0?this.expandBusinessHourEvents(e,[{}]):t.isPlainObject(n)?this.expandBusinessHourEvents(e,[n]):t.isArray(n)?this.expandBusinessHourEvents(e,n,!0):[]},De.prototype.expandBusinessHourEvents=function(e,n,i){var r,s,o=this.getView(),l=[];for(r=0;r<n.length;r++)s=n[r],i&&!s.dow||(s=t.extend({},ke,s),e&&(s.start=null,s.end=null),l.push.apply(l,this.expandEvent(this.buildEventFromInput(s),o.start,o.end)));return l};var Le=qt.BasicView=Ee.extend({scroller:null,dayGridClass:Se,dayGrid:null,dayNumbersVisible:!1,colWeekNumbersVisible:!1,cellWeekNumbersVisible:!1,weekNumberWidth:null,headContainerEl:null,headRowEl:null,initialize:function(){this.dayGrid=this.instantiateDayGrid(),this.scroller=new be({overflowX:"hidden",overflowY:"auto"})},instantiateDayGrid:function(){var t=this.dayGridClass.extend(Me);return new t(this)},setRange:function(t){Ee.prototype.setRange.call(this,t),this.dayGrid.breakOnWeeks=/year|month|week/.test(this.intervalUnit),this.dayGrid.setRange(t)},computeRange:function(t){var e=Ee.prototype.computeRange.call(this,t);return/year|month/.test(e.intervalUnit)&&(e.start.startOf("week"),e.start=this.skipHiddenDays(e.start),e.end.weekday()&&(e.end.add(1,"week").startOf("week"),e.end=this.skipHiddenDays(e.end,-1,!0))),e},renderDates:function(){this.dayNumbersVisible=this.dayGrid.rowCnt>1,this.opt("weekNumbers")&&(this.opt("weekNumbersWithinDays")?(this.cellWeekNumbersVisible=!0,this.colWeekNumbersVisible=!1):(this.cellWeekNumbersVisible=!1,this.colWeekNumbersVisible=!0)),this.dayGrid.numbersVisible=this.dayNumbersVisible||this.cellWeekNumbersVisible||this.colWeekNumbersVisible,this.el.addClass("fc-basic-view").html(this.renderSkeletonHtml()),this.renderHead(),this.scroller.render();var e=this.scroller.el.addClass("fc-day-grid-container"),n=t('<div class="fc-day-grid" />').appendTo(e);this.el.find(".fc-body > tr > td").append(e),this.dayGrid.setElement(n),this.dayGrid.renderDates(this.hasRigidRows())},renderHead:function(){this.headContainerEl=this.el.find(".fc-head-container").html(this.dayGrid.renderHeadHtml()),this.headRowEl=this.headContainerEl.find(".fc-row")},unrenderDates:function(){this.dayGrid.unrenderDates(),this.dayGrid.removeElement(),this.scroller.destroy()},renderBusinessHours:function(){this.dayGrid.renderBusinessHours()},unrenderBusinessHours:function(){this.dayGrid.unrenderBusinessHours()},renderSkeletonHtml:function(){return'<table><thead class="fc-head"><tr><td class="fc-head-container '+this.widgetHeaderClass+'"></td></tr></thead><tbody class="fc-body"><tr><td class="'+this.widgetContentClass+'"></td></tr></tbody></table>'},weekNumberStyleAttr:function(){return null!==this.weekNumberWidth?'style="width:'+this.weekNumberWidth+'px"':""},hasRigidRows:function(){var t=this.opt("eventLimit");return t&&"number"!=typeof t},updateWidth:function(){this.colWeekNumbersVisible&&(this.weekNumberWidth=u(this.el.find(".fc-week-number")))},setHeight:function(t,e){var n,s,o=this.opt("eventLimit");this.scroller.clear(),r(this.headRowEl),this.dayGrid.removeSegPopover(),o&&"number"==typeof o&&this.dayGrid.limitRows(o),n=this.computeScrollerHeight(t),this.setGridHeight(n,e),o&&"number"!=typeof o&&this.dayGrid.limitRows(o),e||(this.scroller.setHeight(n),s=this.scroller.getScrollbarWidths(),(s.left||s.right)&&(i(this.headRowEl,s),n=this.computeScrollerHeight(t),this.scroller.setHeight(n)),this.scroller.lockOverflow(s))},computeScrollerHeight:function(t){return t-c(this.el,this.scroller.el)},setGridHeight:function(t,e){e?a(this.dayGrid.rowEls):l(this.dayGrid.rowEls,t,!0)},computeInitialScroll:function(){return{top:0}},queryScroll:function(){return{top:this.scroller.getScrollTop()}},setScroll:function(t){this.scroller.setScrollTop(t.top)},prepareHits:function(){this.dayGrid.prepareHits()},releaseHits:function(){this.dayGrid.releaseHits()},queryHit:function(t,e){return this.dayGrid.queryHit(t,e)},getHitSpan:function(t){return this.dayGrid.getHitSpan(t)},getHitEl:function(t){return this.dayGrid.getHitEl(t)},renderEvents:function(t){this.dayGrid.renderEvents(t),this.updateHeight()},getEventSegs:function(){return this.dayGrid.getEventSegs()},unrenderEvents:function(){this.dayGrid.unrenderEvents()},renderDrag:function(t,e){return this.dayGrid.renderDrag(t,e)},unrenderDrag:function(){this.dayGrid.unrenderDrag()},renderSelection:function(t){this.dayGrid.renderSelection(t)},unrenderSelection:function(){this.dayGrid.unrenderSelection()}}),Me={renderHeadIntroHtml:function(){var t=this.view;return t.colWeekNumbersVisible?'<th class="fc-week-number '+t.widgetHeaderClass+'" '+t.weekNumberStyleAttr()+"><span>"+tt(t.opt("weekNumberTitle"))+"</span></th>":""},renderNumberIntroHtml:function(t){var e=this.view,n=this.getCellDate(t,0);return e.colWeekNumbersVisible?'<td class="fc-week-number" '+e.weekNumberStyleAttr()+">"+e.buildGotoAnchorHtml({date:n,type:"week",forceOff:1===this.colCnt},n.format("w"))+"</td>":""},renderBgIntroHtml:function(){var t=this.view;return t.colWeekNumbersVisible?'<td class="fc-week-number '+t.widgetContentClass+'" '+t.weekNumberStyleAttr()+"></td>":""},renderIntroHtml:function(){var t=this.view;return t.colWeekNumbersVisible?'<td class="fc-week-number" '+t.weekNumberStyleAttr()+"></td>":""}},Be=qt.MonthView=Le.extend({computeRange:function(t){var e,n=Le.prototype.computeRange.call(this,t);return this.isFixedWeeks()&&(e=Math.ceil(n.end.diff(n.start,"weeks",!0)),n.end.add(6-e,"weeks")),n},setGridHeight:function(t,e){e&&(t*=this.rowCnt/6),l(this.dayGrid.rowEls,t,!e)},isFixedWeeks:function(){return this.opt("fixedWeekCount")}});Zt.basic={class:Le},Zt.basicDay={type:"basic",duration:{days:1}},Zt.basicWeek={type:"basic",duration:{weeks:1}},Zt.month={class:Be,duration:{months:1},defaults:{fixedWeekCount:!0}};var ze=qt.AgendaView=Ee.extend({scroller:null,timeGridClass:we,timeGrid:null,dayGridClass:Se,dayGrid:null,axisWidth:null,headContainerEl:null,noScrollRowEls:null,bottomRuleEl:null,initialize:function(){this.timeGrid=this.instantiateTimeGrid(),this.opt("allDaySlot")&&(this.dayGrid=this.instantiateDayGrid()),this.scroller=new be({overflowX:"hidden",overflowY:"auto"})},instantiateTimeGrid:function(){var t=this.timeGridClass.extend(Fe);return new t(this)},instantiateDayGrid:function(){var t=this.dayGridClass.extend(Ne);return new t(this)},setRange:function(t){Ee.prototype.setRange.call(this,t),this.timeGrid.setRange(t),this.dayGrid&&this.dayGrid.setRange(t)},renderDates:function(){this.el.addClass("fc-agenda-view").html(this.renderSkeletonHtml()),this.renderHead(),this.scroller.render();var e=this.scroller.el.addClass("fc-time-grid-container"),n=t('<div class="fc-time-grid" />').appendTo(e);this.el.find(".fc-body > tr > td").append(e),this.timeGrid.setElement(n),this.timeGrid.renderDates(),this.bottomRuleEl=t('<hr class="fc-divider '+this.widgetHeaderClass+'"/>').appendTo(this.timeGrid.el),this.dayGrid&&(this.dayGrid.setElement(this.el.find(".fc-day-grid")),this.dayGrid.renderDates(),this.dayGrid.bottomCoordPadding=this.dayGrid.el.next("hr").outerHeight()),this.noScrollRowEls=this.el.find(".fc-row:not(.fc-scroller *)")},renderHead:function(){this.headContainerEl=this.el.find(".fc-head-container").html(this.timeGrid.renderHeadHtml())},unrenderDates:function(){this.timeGrid.unrenderDates(),this.timeGrid.removeElement(),this.dayGrid&&(this.dayGrid.unrenderDates(),this.dayGrid.removeElement()),this.scroller.destroy()},renderSkeletonHtml:function(){return'<table><thead class="fc-head"><tr><td class="fc-head-container '+this.widgetHeaderClass+'"></td></tr></thead><tbody class="fc-body"><tr><td class="'+this.widgetContentClass+'">'+(this.dayGrid?'<div class="fc-day-grid"/><hr class="fc-divider '+this.widgetHeaderClass+'"/>':"")+"</td></tr></tbody></table>"},axisStyleAttr:function(){return null!==this.axisWidth?'style="width:'+this.axisWidth+'px"':""},renderBusinessHours:function(){this.timeGrid.renderBusinessHours(),this.dayGrid&&this.dayGrid.renderBusinessHours()},unrenderBusinessHours:function(){this.timeGrid.unrenderBusinessHours(),this.dayGrid&&this.dayGrid.unrenderBusinessHours()},getNowIndicatorUnit:function(){return this.timeGrid.getNowIndicatorUnit()},renderNowIndicator:function(t){this.timeGrid.renderNowIndicator(t)},unrenderNowIndicator:function(){this.timeGrid.unrenderNowIndicator()},updateSize:function(t){this.timeGrid.updateSize(t),Ee.prototype.updateSize.call(this,t)},updateWidth:function(){this.axisWidth=u(this.el.find(".fc-axis"))},setHeight:function(t,e){var n,s,o;this.bottomRuleEl.hide(),this.scroller.clear(),r(this.noScrollRowEls),this.dayGrid&&(this.dayGrid.removeSegPopover(),n=this.opt("eventLimit"),n&&"number"!=typeof n&&(n=Ge),n&&this.dayGrid.limitRows(n)),e||(s=this.computeScrollerHeight(t),this.scroller.setHeight(s),o=this.scroller.getScrollbarWidths(),(o.left||o.right)&&(i(this.noScrollRowEls,o),s=this.computeScrollerHeight(t),this.scroller.setHeight(s)),this.scroller.lockOverflow(o),this.timeGrid.getTotalSlatHeight()<s&&this.bottomRuleEl.show())},computeScrollerHeight:function(t){return t-c(this.el,this.scroller.el)},computeInitialScroll:function(){var t=e.duration(this.opt("scrollTime")),n=this.timeGrid.computeTimeTop(t);return n=Math.ceil(n),n&&n++,{top:n}},queryScroll:function(){return{top:this.scroller.getScrollTop()}},setScroll:function(t){this.scroller.setScrollTop(t.top)},prepareHits:function(){this.timeGrid.prepareHits(),this.dayGrid&&this.dayGrid.prepareHits()},releaseHits:function(){this.timeGrid.releaseHits(),this.dayGrid&&this.dayGrid.releaseHits()},queryHit:function(t,e){var n=this.timeGrid.queryHit(t,e);return!n&&this.dayGrid&&(n=this.dayGrid.queryHit(t,e)),n},getHitSpan:function(t){return t.component.getHitSpan(t)},getHitEl:function(t){return t.component.getHitEl(t)},renderEvents:function(t){var e,n,i=[],r=[],s=[];for(n=0;n<t.length;n++)t[n].allDay?i.push(t[n]):r.push(t[n]);e=this.timeGrid.renderEvents(r),this.dayGrid&&(s=this.dayGrid.renderEvents(i)),this.updateHeight()},getEventSegs:function(){return this.timeGrid.getEventSegs().concat(this.dayGrid?this.dayGrid.getEventSegs():[])},unrenderEvents:function(){this.timeGrid.unrenderEvents(),this.dayGrid&&this.dayGrid.unrenderEvents()},renderDrag:function(t,e){return t.start.hasTime()?this.timeGrid.renderDrag(t,e):this.dayGrid?this.dayGrid.renderDrag(t,e):void 0},unrenderDrag:function(){this.timeGrid.unrenderDrag(),this.dayGrid&&this.dayGrid.unrenderDrag()},renderSelection:function(t){t.start.hasTime()||t.end.hasTime()?this.timeGrid.renderSelection(t):this.dayGrid&&this.dayGrid.renderSelection(t)},unrenderSelection:function(){this.timeGrid.unrenderSelection(),this.dayGrid&&this.dayGrid.unrenderSelection()}}),Fe={renderHeadIntroHtml:function(){var t,e=this.view;return e.opt("weekNumbers")?(t=this.start.format(e.opt("smallWeekFormat")),'<th class="fc-axis fc-week-number '+e.widgetHeaderClass+'" '+e.axisStyleAttr()+">"+e.buildGotoAnchorHtml({date:this.start,type:"week",forceOff:this.colCnt>1},tt(t))+"</th>"):'<th class="fc-axis '+e.widgetHeaderClass+'" '+e.axisStyleAttr()+"></th>"},renderBgIntroHtml:function(){var t=this.view;return'<td class="fc-axis '+t.widgetContentClass+'" '+t.axisStyleAttr()+"></td>"},renderIntroHtml:function(){var t=this.view;return'<td class="fc-axis" '+t.axisStyleAttr()+"></td>"}},Ne={renderBgIntroHtml:function(){var t=this.view;return'<td class="fc-axis '+t.widgetContentClass+'" '+t.axisStyleAttr()+"><span>"+t.getAllDayHtml()+"</span></td>"},renderIntroHtml:function(){var t=this.view;return'<td class="fc-axis" '+t.axisStyleAttr()+"></td>"}},Ge=5,Oe=[{hours:1},{minutes:30},{minutes:15},{seconds:30},{seconds:15}];Zt.agenda={class:ze,defaults:{allDaySlot:!0,slotDuration:"00:30:00",minTime:"00:00:00",maxTime:"24:00:00",slotEventOverlap:!0}},Zt.agendaDay={type:"agenda",duration:{days:1}},Zt.agendaWeek={type:"agenda",duration:{weeks:1}};var Ae=Ee.extend({grid:null,scroller:null,initialize:function(){this.grid=new Ve(this),this.scroller=new be({overflowX:"hidden",overflowY:"auto"})},setRange:function(t){Ee.prototype.setRange.call(this,t),this.grid.setRange(t)},renderSkeleton:function(){this.el.addClass("fc-list-view "+this.widgetContentClass),this.scroller.render(),this.scroller.el.appendTo(this.el),this.grid.setElement(this.scroller.scrollEl)},unrenderSkeleton:function(){this.scroller.destroy()},setHeight:function(t,e){this.scroller.setHeight(this.computeScrollerHeight(t))},computeScrollerHeight:function(t){return t-c(this.el,this.scroller.el);
},renderEvents:function(t){this.grid.renderEvents(t)},unrenderEvents:function(){this.grid.unrenderEvents()},isEventResizable:function(t){return!1},isEventDraggable:function(t){return!1}}),Ve=me.extend({segSelector:".fc-list-item",hasDayInteractions:!1,spanToSegs:function(t){for(var e,n=this.view,i=n.start.clone().time(0),r=0,s=[];i<n.end;)if(e=F(t,{start:i,end:i.clone().add(1,"day")}),e&&(e.dayIndex=r,s.push(e)),i.add(1,"day"),r++,e&&!e.isEnd&&t.end.hasTime()&&t.end<i.clone().add(this.view.nextDayThreshold)){e.end=t.end.clone(),e.isEnd=!0;break}return s},computeEventTimeFormat:function(){return this.view.opt("mediumTimeFormat")},handleSegClick:function(e,n){var i;me.prototype.handleSegClick.apply(this,arguments),t(n.target).closest("a[href]").length||(i=e.event.url,i&&!n.isDefaultPrevented()&&(window.location.href=i))},renderFgSegs:function(t){return t=this.renderFgSegEls(t),t.length?this.renderSegList(t):this.renderEmptyMessage(),t},renderEmptyMessage:function(){this.el.html('<div class="fc-list-empty-wrap2"><div class="fc-list-empty-wrap1"><div class="fc-list-empty">'+tt(this.view.opt("noEventsMessage"))+"</div></div></div>")},renderSegList:function(e){var n,i,r,s=this.groupSegsByDay(e),o=t('<table class="fc-list-table"><tbody/></table>'),l=o.find("tbody");for(n=0;n<s.length;n++)if(i=s[n])for(l.append(this.dayHeaderHtml(this.view.start.clone().add(n,"days"))),this.sortEventSegs(i),r=0;r<i.length;r++)l.append(i[r].el);this.el.empty().append(o)},groupSegsByDay:function(t){var e,n,i=[];for(e=0;e<t.length;e++)n=t[e],(i[n.dayIndex]||(i[n.dayIndex]=[])).push(n);return i},dayHeaderHtml:function(t){var e=this.view,n=e.opt("listDayFormat"),i=e.opt("listDayAltFormat");return'<tr class="fc-list-heading" data-date="'+t.format("YYYY-MM-DD")+'"><td class="'+e.widgetHeaderClass+'" colspan="3">'+(n?e.buildGotoAnchorHtml(t,{class:"fc-list-heading-main"},tt(t.format(n))):"")+(i?e.buildGotoAnchorHtml(t,{class:"fc-list-heading-alt"},tt(t.format(i))):"")+"</td></tr>"},fgSegHtml:function(t){var e,n=this.view,i=["fc-list-item"].concat(this.getSegCustomClasses(t)),r=this.getSegBackgroundColor(t),s=t.event,o=s.url;return e=s.allDay?n.getAllDayHtml():n.isMultiDayEvent(s)?t.isStart||t.isEnd?tt(this.getEventTimeText(t)):n.getAllDayHtml():tt(this.getEventTimeText(s)),o&&i.push("fc-has-url"),'<tr class="'+i.join(" ")+'">'+(this.displayEventTime?'<td class="fc-list-item-time '+n.widgetContentClass+'">'+(e||"")+"</td>":"")+'<td class="fc-list-item-marker '+n.widgetContentClass+'"><span class="fc-event-dot"'+(r?' style="background-color:'+r+'"':"")+'></span></td><td class="fc-list-item-title '+n.widgetContentClass+'"><a'+(o?' href="'+tt(o)+'"':"")+">"+tt(t.event.title||"")+"</a></td></tr>"}});return Zt.list={class:Ae,buttonTextKey:"list",defaults:{buttonText:"list",listDayFormat:"LL",noEventsMessage:"No events to display"}},Zt.listDay={type:"list",duration:{days:1},defaults:{listDayFormat:"dddd"}},Zt.listWeek={type:"list",duration:{weeks:1},defaults:{listDayFormat:"dddd",listDayAltFormat:"LL"}},Zt.listMonth={type:"list",duration:{month:1},defaults:{listDayAltFormat:"dddd"}},Zt.listYear={type:"list",duration:{year:1},defaults:{listDayAltFormat:"dddd"}},qt});
//# sourceMappingURL=all.js.map
