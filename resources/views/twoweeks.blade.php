<table>    
    <tr>
        <th></th>
        <th>Date</th>
        <th>Time</th>
        <th>Title</th>
        <th></th>
    </tr>
    @foreach ($eventListing->getItems() as $event)
        <tr>
            <td class="smallpadding"><div class="circle _{{{ $event->colorId }}}"></div></td>
            <td>{{{ \Carbon\Carbon::parse($event->start->dateTime)->toFormattedDateString() }}}</td>
            <td>{{{ \Carbon\Carbon::parse($event->start->dateTime)->format('H:i') }}} -  
                {{{ \Carbon\Carbon::parse($event->end->dateTime)->format('H:i') }}}</td> 
            <td>{{{ $event->getSummary() }}}</td>
            
            <td>
                <form method="POST" action="/delete">
                    {{ method_field('DELETE') }}
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="eventId"  value="{{{ $event->getId() }}}">
                        <input type="hidden" name="title" value="{{{ $event->getSummary() }}}">
                    @foreach ($event->getAttendees() as $email)
                        @if (Auth::user()->email == $email['email'])
                    <span class="form-group">
                        <button type="submit" value="delete"><i class="fa fa-trash-o" aria-hidden="true"></i>
                    </span>
                        @endif
                    @endforeach
                </form>
            </td>
    @endforeach
</table>


