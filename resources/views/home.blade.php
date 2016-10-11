@extends('layouts.app')

@section('content')

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
    <div class="col-md-4">
    <h1>Mettrr</h1>
    <h4>Meeting Room Booking Form</h4>
        
        <h4></h4>
        
        <form method="POST" action="/post"> 
        
            {{ csrf_field() }}
            
            
            <label for="name" class="control-label">Name</label>
            
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
                <input class="field" name="start_time" type="time" value="00:00" class="form-control" step="1800">
            </div>
            </p>
            
            <p>
            <div class="form-group">
                <label for="end-time" class="control-label">End Time &nbsp;</label>
                <input class="field" name="end_time" type="time" value="00:00" class="form-control" step="1800">
            </div>
            </p>
            
            <div class="form-group">
                <label for="priority" class="control-label">Priority&nbsp;</label>
                <input class="field" name="priority" type="radio" value="11">&nbsp; 1 &nbsp;
                <input class="field" name="priority" type="radio" value="5">&nbsp; 2 &nbsp;
                <input class="field" name="priority" type="radio" value="10">&nbsp; 3 &nbsp;
            </div>
            
            <div class="form-group">
                <button type="submit" class="btn btn-primary ">Add Meeting</button>
            </div>
        
         </form>
         
        @include('flash')
            
    </div>
    
    <div class="col-md-8">
        @include('calendar')
    </div>
        
        
        
        
                
</div>
@endsection
