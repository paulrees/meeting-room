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
            
            <label for="Date" class="control-label">Date</label>
            <p>
            <div class="form-group">
                <input class="field" name="date" type="date" class="form-control">
            </div>
            </p>
            
            <label for="start-time" class="control-label">Start Time</label>
            <p>
            <div class="form-group">
                <input class="field" name="start-time" type="time" value="00:00" class="form-control" step="1800">
            </div>
            </p>
            
            <label for="end-time" class="control-label">End Time</label>
            <p>
            <div class="form-group">
                <input class="field" name="end-time" type="time" value="00:00" class="form-control" step="1800">
            </div>
            </p>
            
            <div class="form-group">
                <button type="submit" class="btn btn-primary ">Add Meeting</button>
            </div>
        
        </form>
        
        
        
        
        
        
        
                
</div>
@endsection
