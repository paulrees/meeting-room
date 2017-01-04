@extends('layouts.app')

@section('content')
@include('navbar')

<br>

<div class="container">
    <div class="col-md-3">
    <h1>Mettrr</h1>
    <h4>Meeting Room Booking Form</h4>
        
        <form method="POST" action="{{ url('events') }}" @submit.prevent="onSubmit">
        	{{ csrf_field() }}
        	<div class="control">
        		<label for="name">Your Name</label>
        		<input class="form-control" placeholder="Your full name" type="text" name="name" v-model="name"/>
        	</div>
        	
        	<div class="control">
        		<label for="title">Meeting Title</label>
        		<input class="form-control" placeholder="e.g. CEO update" type="text" name="title" v-model="title"/>
        	</div>
        	
        	<div class="control">
        		<label for="time">Date & Time</label>
        		<input class="form-control" type="text" name="time" v-model="time"/>
        	</div>
        	
        	<div class="control">
        		<button class="btn btn-primary">Create</button>
        	</div>
        </form>
        
  <!--      <form action="{{ url('events') }}" method="POST">-->
		<!--	{{ csrf_field() }}-->
		<!--	<div class="form-group @if($errors->has('name')) has-error has-feedback @endif">-->
		<!--		<label for="name">Your Name</label>-->
		<!--		<input type="text" class="form-control" name="name" placeholder="E.g. Pisyek" value="{{ old('name') }}">-->
		<!--		@if ($errors->has('name'))-->
		<!--			<p class="help-block"><span class="glyphicon glyphicon-exclamation-sign"></span> -->
		<!--			{{ $errors->first('name') }}-->
		<!--			</p>-->
		<!--		@endif-->
		<!--	</div>-->
		<!--	<div class="form-group @if($errors->has('title')) has-error has-feedback @endif">-->
		<!--		<label for="title">Title</label>-->
		<!--		<input type="text" class="form-control" name="title" placeholder="E.g. Meeting with CEO Seb" value="{{ old('title') }}">-->
		<!--		@if ($errors->has('title'))-->
		<!--			<p class="help-block"><span class="glyphicon glyphicon-exclamation-sign"></span> -->
		<!--			{{ $errors->first('title') }}-->
		<!--			</p>-->
		<!--		@endif-->
		<!--	</div>-->
		<!--	<div class="form-group @if($errors->has('time')) has-error @endif">-->
		<!--		<label for="time">Time</label>-->
		<!--		<div class="input-group">-->
		<!--			<input type="text" class="form-control" name="time" placeholder="Select your time" value="{{ old('time') }}">-->
		<!--			<span class="input-group-addon">-->
		<!--				<span class="glyphicon glyphicon-calendar"></span>-->
  <!--                  </span>-->
		<!--		</div>-->
		<!--		@if ($errors->has('time'))-->
		<!--			<p class="help-block"><span class="glyphicon glyphicon-exclamation-sign"></span> -->
		<!--			{{ $errors->first('time') }}-->
		<!--			</p>-->
		<!--		@endif-->
		<!--	</div>-->
		<!--	<button type="submit" class="btn btn-primary">Submit</button>-->
		<!--</form>		-->
		
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

</script>

@endsection

@endsection
