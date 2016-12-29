<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Notifications\BookingConfirmed;


class Event extends Model
{
    protected $fillable = ['title', 'calendar_id', 'host', 'location'];
    
     public function addEvent($request)
    {
        // dd($request);
        $this->title = $request->title;
        $this->location = 'Mettrr, 5-8 Crown Works, Temple Street, E2 6QQ';
        $this->host = returnUser()->name;
        $this->calendar_id = "pr@mettrr.com";
        $this->save();
       
        
        
        $dateFormatted = formatDate($request->input_date);
        
        $flashMessage = strtoupper($request->title) . ' is booked on ' . 
                        $dateFormatted . ' from ' . 
                        $request->start_time . ' to ' . $request->end_time . '.';
        
        flash($flashMessage);
        
        $user = returnUser();
        $user->notify(new BookingConfirmed($request, $dateFormatted));
        
    }
}
