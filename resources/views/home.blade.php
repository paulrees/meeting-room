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
    <h1>METTRR</h1>

    <h4>Meeting Room Booking Form</h4>
        
        <h4></h4>
                
</div>
@endsection
