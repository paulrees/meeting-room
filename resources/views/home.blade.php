@extends('layouts.app')

@section('content')

<nav class="navbar navbar-inverse navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="{{ url('/') }}">{{ config('app.name') }}</a>
        </div>
        <div id="navbar" class="collapse navbar-collapse">
          <ul class="nav navbar-nav navbar-right">
            <li><a href="{{ url('events') }}">Events List</a></li>
			<li><a href="{{ url('events/create') }}">Add new event</a></li>
			<li><a href="#">Hi : {{ Auth::user()->name }}</a></li>
			<li><a href="{{ url('/logout') }}"
                onclick="event.preventDefault();
                         document.getElementById('logout-form').submit();">Logout</li>
          </ul>
        </div><!--/.nav-collapse -->
      </div>
    </nav>
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
        
        <form method="POST" action="{{ url('events') }}">
            <!--action="/post">-->
        
            {{ csrf_field() }}
            
            
            <label for="name" class="control-label">Host Name</label>
            
            <p>
            <div class="form-group">
                <input class="field" name="name" type="text" class="form-control" value="{{ Auth::user()->name }}">
            </div>
            </p>
            
            <label for="title" class="control-label">Booking Title</label>
            
            <p>
            <div class="form-group">
                <input class="field" name="title" type="text" class="form-control">
            </div>
            </p>
            
            <label for="date" class="control-label">Date</label>
            <p>
            <div class="form-group">
                <input class="field" name="input_date" type="date" class="form-control">
            </div>
            </p>
            
            <p>
            <div class="form-group">
                <label for="start-time" class="control-label">Start Time</label>
                <input v-model="startTime" @change="returnEndTime" class="field" name="start_time" type="time" min="08:00" max="18:00" class="form-control" step="1800" required="required">
                <i class="fa fa-minus mouse-over" v-on:click="decrementStartTime" aria-hidden="true"></i>&nbsp;<i class="fa fa-plus mouse-over" v-on:click="incrementStartTime"  aria-hidden="true"></i>
            </div>
            </p>
            
            <p>
            <div class="form-group">
                <label for="end-time" class="control-label">End Time &nbsp;</label>
                <input v-model="endTime" input class="field" name="end_time" type="time" class="form-control" min="08:00" max="18:00" step="1800" required="required">
                <i class="fa fa-minus mouse-over" v-on:click="decrementEndTime" aria-hidden="true"></i>&nbsp;<i class="fa fa-plus mouse-over" v-on:click="incrementEndTime" aria-hidden="true"></i>
            </div>
            </p>
            
            <div class="form-group">
                <label for="priority" class="control-label">Priority&nbsp;</label><br>
                <input class="field mouse-over" name="priority" type="radio" value="11">&nbsp; High &nbsp; <br>
                <input class="field mouse-over" name="priority" type="radio" value="5">&nbsp; Normal &nbsp; <br>
                <input class="field mouse-over" name="priority" type="radio" value="10">&nbsp; Low &nbsp; <br>
            </div>
            
            <div class="form-group">
                <button type="submit" class="btn btn-primary ">Add Meeting</button>
            </div>
        
         </form>
         

         
        @include('flash')
        
    </div>
    <div class="col-md-9">
        
        <div class="form-group">
            <button class="btn btn-primary" v-on:click="toggle">
                <span v-if="calendar">View 2 Weeks</span>
                <span v-else>View Calendar</span>
            </button>
                <h3 v-if="calendar">Calendar View</h3>
                <h3 v-else>2 Weeks View</h3>
        </div>
        <div v-show="twoWeeks" class="responsive-twoweeks">
            @include('twoweeks')
        </div>
        <div v-show="calendar" class="responsive-iframe-container">
            @include('calendar')
        </div>
        
    </div>
        
        
        
                
</div>


@endsection
