
<div id='calendar'></div>

<script type="text/javascript">
  $(document).ready(function() {
  
    var base_url = '{{ url('/') }}';
    
    $('#calendar').fullCalendar({
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
  });
</script>
