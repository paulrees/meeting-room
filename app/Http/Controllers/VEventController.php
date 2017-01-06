<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Lib\VEvent;
use App\Event;
use Sabre\VObject;

class VEventController extends Controller
{
    function index() {
        $events = Event::all();
        
        foreach($events as $event) {
            $vcalendar = new VObject\Component\VCalendar([
            'VEVENT' => [
            'NAME'  => $event->name,
            'TITLE' =>  $event->title,
            'DTSTART' => $event->start_time,
            'DTEND'   => $event->end_time,
            ]
            ]);
            echo $vcalendar->serialize();
        }
    }
}
