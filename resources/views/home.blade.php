@extends('layouts.app')

@section('content')
@include('navbar')

<br>
<div class="container">
        <ul class="nav navbar-nav navbar-right">
            Logged in as : <b>{{ Auth::user()->name }}</b> &nbsp;&nbsp;
            <a href="{{ url('/logout') }}"
                onclick="event.preventDefault();
                         document.getElementById('logout-form').submit();">
                <b>Logout</b>
            </a>

                <form id="logout-form" action="{{ url('/logout') }}" method="POST" style="display: none;">
                    {{ csrf_field() }}
                </form>
        </ul>
</div>
<div class="container">
    <div class="col-md-3">
    <h1>Mettrr</h1>
    <h4>Meeting Room Booking Form</h4>
        
        <h4></h4>
        
        <form action="{{ url('events') }}" method="POST">
			{{ csrf_field() }}
			<div class="form-group @if($errors->has('name')) has-error has-feedback @endif">
				<label for="name">Your Name</label>
				<input type="text" class="form-control" name="name" placeholder="E.g. Pisyek" value="{{ old('name') }}">
				@if ($errors->has('name'))
					<p class="help-block"><span class="glyphicon glyphicon-exclamation-sign"></span> 
					{{ $errors->first('name') }}
					</p>
				@endif
			</div>
			<div class="form-group @if($errors->has('title')) has-error has-feedback @endif">
				<label for="title">Title</label>
				<input type="text" class="form-control" name="title" placeholder="E.g. Meeting with CEO Seb" value="{{ old('title') }}">
				@if ($errors->has('title'))
					<p class="help-block"><span class="glyphicon glyphicon-exclamation-sign"></span> 
					{{ $errors->first('title') }}
					</p>
				@endif
			</div>
			<div class="form-group @if($errors->has('time')) has-error @endif">
				<label for="time">Time</label>
				<div class="input-group">
					<input type="text" class="form-control" name="time" placeholder="Select your time" value="{{ old('time') }}">
					<span class="input-group-addon">
						<span class="glyphicon glyphicon-calendar"></span>
                    </span>
				</div>
				@if ($errors->has('time'))
					<p class="help-block"><span class="glyphicon glyphicon-exclamation-sign"></span> 
					{{ $errors->first('time') }}
					</p>
				@endif
			</div>
			<button type="submit" class="btn btn-primary">Submit</button>
		</form>		
		
		<div id="clash"></div>

         
        @include('flash')
        
    </div>
    <div class="col-md-9">
        
        
        <div id="calendar" class="responsive-iframe-container">
            @include('calendar')
        </div>
        
    </div>
        
        
        
                
</div>

@section('js')
<link rel="stylesheet" href="/assets/daterangepicker/daterangepicker.css" type="text/css" />

<script type="text/javascript" src="/assets/daterangepicker/daterangepicker.js"></script>
<script type="text/javascript">
$(function () {
	$('input[name="time"]').daterangepicker({
		"minDate": moment('<?php echo date('Y-m-d G')?>'),
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

$('input[name="time"]').on('hide.daterangepicker', function(ev, picker) {
  
  var array = $('#calendar').fullCalendar('clientEvents');
    for(i in array){
        if(picker.endDate._d >= array[i].start && picker.startDate._d <= array[i].end){
            return $('#clash').text('This booking clashes with an existing meeting hosted by ' + array[i].name);
        } else {
            $('#clash').text('');
        }
    }
});
</script>

@endsection

@endsection
