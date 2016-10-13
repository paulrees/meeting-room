<table>    
    <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Title</th>
        <th></th>
    </tr>
    @foreach ($eventListing->getItems() as $event)
        <tr>
            <td>{{{ \Carbon\Carbon::parse($event->start->dateTime)->toFormattedDateString() }}}</td>
            <td>{{{ \Carbon\Carbon::parse($event->start->dateTime)->format('H:i') }}} -  
                {{{ \Carbon\Carbon::parse($event->end->dateTime)->format('H:i') }}}</td> 
            <td>{{{ $event->getSummary() }}}</td>
            
            <td>
            @foreach ($event->getAttendees() as $email)
                @if (Auth::user()->email == $email['email'])
                <span class="form-group">
                    <button type="submit"><i class="fa fa-trash-o" aria-hidden="true"></i>
                </span>
                
                @endif
            @endforeach
            </td>
    @endforeach
</table>


