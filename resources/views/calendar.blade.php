
<div id='calendar'></div>

<script type="text/javascript">
  $(document).ready(function() {
  
    var base_url = '{{ url('/') }}';
    
    
    $('#calendar').fullCalendar({
      loading: function() {
        $(".sk-fading-circle").show();
      },
      eventAfterAllRender: function() {
        $(".sk-fading-circle").hide();
      },
      weekends: true,
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      },
      editable: false,
      eventLimit: true, // allow "more" link when too many events
      googleCalendarApiKey: 'AIzaSyC_wDp-mp-ubm2szTGUaFJCESk1R7WEZLo',
      eventSources: [
        {
           googleCalendarId: 'hello@mettrr.com',
           color: 'green',
           textColor: 'white'
        },
        {
           url: base_url + '/api',
           error: function() {
           alert("cannot load json");
        }
        }
      ]
        
      
    });
    
    $(".fc-center").append(loadingDiv());

    function loadingDiv() {
      return `<div class="sk-fading-circle">
              <div class="sk-circle1 sk-circle"></div>
              <div class="sk-circle2 sk-circle"></div>
              <div class="sk-circle3 sk-circle"></div>
              <div class="sk-circle4 sk-circle"></div>
              <div class="sk-circle5 sk-circle"></div>
              <div class="sk-circle6 sk-circle"></div>
              <div class="sk-circle7 sk-circle"></div>
              <div class="sk-circle8 sk-circle"></div>
              <div class="sk-circle9 sk-circle"></div>
              <div class="sk-circle10 sk-circle"></div>
              <div class="sk-circle11 sk-circle"></div>
              <div class="sk-circle12 sk-circle"></div>
            </div>`;
    };
  });
  
</script>
