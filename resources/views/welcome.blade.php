@extends('layouts.app')

@section('content')
<nav class="navbar navbar-default navbar-static-top">
        
    <div class="collapse navbar-collapse" id="app-navbar-collapse">
    
        <ul class="nav navbar-nav">
                        &nbsp;
                    </ul>
                    
                    <ul class="nav navbar-nav navbar-right">
                        <li><a class="top-right-link" href="{{ url('/register') }}"><b>Register</b></a></li>
                    </ul>
            </div>
        </nav>
                    
    <!--<div class="flex-center position-ref full-height">-->
        <div class="content">
                <div class="title m-b-md">
                    <b>METTRR</b>
                </div>
                <h2>MEETING ROOM</h2>
                <h4>Login</h4>
                
            <div class="container">
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
            
                <div class="panel-body">
                    <form class="form-horizontal" role="form" method="POST" action="{{ url('/login') }}">
                        {{ csrf_field() }}

                        <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">

                            <div class="col-md-6 col-md-offset-3">
                                <input id="email" type="email" class="form-control" name="email" value="{{ old('email') }}" placeholder="E-Mail" required autofocus>

                                @if ($errors->has('email'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('email') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">

                            <div class="col-md-6 col-md-offset-3">
                                <input id="password" type="password" class="form-control" name="password" placeholder="Password" required>

                                @if ($errors->has('password'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('password') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-6 col-md-offset-3">
                                
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-6 col-md-offset-3">
                                <button type="submit" class="btn btn-primary">
                                    Login
                                </button>
                            </div>
                            
                            <div class="col-md-6 col-md-offset-3">
                                <div class="checkbox">
                                    <label>
                                        <input type="checkbox" name="remember"> Remember Me
                                    </label>
                                </div>
                            </div>
                                
                            <div class="col-md-6 col-md-offset-3">
                                <a class="btn btn-link" href="{{ url('/password/reset') }}">
                                    Forgot Your Password?
                                </a>
                            </div>
                            
                        </div>
                    </form>
                </div>
        </div>
    </div>
</div>

            </div>
        </div>
    </body>
</html>
