
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
      events: {
        url: base_url + '/api',
        error: function() {
          alert("cannot load json");
        }
      }
    });
    
  });
</script>
