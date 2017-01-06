
<nav class="navbar navbar-inverse navbar-relative-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="{{ url('/home') }}">{{ config('app.name') }}</a>
        </div>
        <div id="navbar" class="collapse navbar-collapse">
          <ul class="nav navbar-nav navbar-right">
            @if (Request::path() != 'events')
              <li><a href="{{ url('events') }}">2-Week View</a></li>
            @endif
        			<li><a href="#">Hi : {{ Auth::user()->name }}</a></li>
        			<li><a href="{{ url('/logout') }}"
                onclick="event.preventDefault();
                         document.getElementById('logout-form').submit();">Logout</a></li>
              <form id="logout-form" action="{{ url('/logout') }}" method="POST" style="display: none;">
                    {{ csrf_field() }}
              </form>
          </ul>
        </div>
        <!--/.nav-collapse -->
      </div>
</nav>