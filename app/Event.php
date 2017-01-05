<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Notifications\BookingConfirmed;


class Event extends Model
{
    protected $fillable =  ['title', 'start_time', 'end_time', 'name'];
    
     public function addEvent($request)
    {
        
        $time = explode(" - ", $request->input('time'));
    
        
         $this->name = $request->input('name');
         $this->title = $request->input('title');
         $this->start_time = $time[0];
         $this->end_time = $time[1];
        
        //  $googleResponse = $calendar->postData($request);

      
        $request->session()->flash('success', 'The event was successfully saved!');
        
        // $this->title = $request->title;
        // $this->start_time = $request->input_date . ' ' . $request->start_time . ':00';
        // $this->end_time = $request->input_date . ' ' . $request->end_time . ':00';
        // $this->name = returnUser()->name;
        // $this->save();

        // $dateFormatted = formatDate($request->input_date);
        
        // $flashMessage = strtoupper($request->title) . ' is booked on ' . 
        //                 $dateFormatted . ' from ' . 
        //                 $request->start_time . ' to ' . $request->end_time . '.';
        
        // flash($flashMessage);
        
        // $user = returnUser();
        // $user->notify(new BookingConfirmed($request, $dateFormatted));
        
    }
    
    public function updateEvent($request) {
        
     $time = explode(" - ", $request->input('time'));
       
     $this->name = $request->input('name');
     $this->title = $request->input('title');
     $this->start_time = $time[0];
     $this->end_time = $time[1];
    }
}
