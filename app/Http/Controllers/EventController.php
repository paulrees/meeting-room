<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Event;
use App\Http\Requests;
use App\Lib\CalendarClient;
use Carbon\Carbon;

class EventController extends Controller
{
    public function index()
    {
      $twoWeeksAway = Carbon::now()->addWeeks(2)->toDateTimeString();
      return view('event/list', ['events' => Event::where('start_time', '<', $twoWeeksAway)->get()]);
    }
    
    public function create()
    {
      return view('event/create');
    }
    
    public function store(Request $request)
    {
     
     $this -> validate(request(), [
     'name' => 'required',
     'title' => 'required',
     ]);
     
     $event = new Event;
     $event->addEvent($request);
     $event->save();
     return redirect('home');
    }
    
    public function show($id)
    {
     return view('event/view', ['event' => Event::findOrFail($id)]);
    }
    
    public function edit($id)
    {
     return view('event/edit', ['event' => Event::findOrFail($id)]);
    }
    
    public function update(Request $request, $id)
    {
     
     $this -> validate(request(), [
     'name' => 'required',
     'title' => 'required',
     ]);
      
     $event = Event::findOrFail($id);
     $event->updateEvent($request);
     $event->save();
      
    }
    
    public function destroy($id)
    {
     $event = Event::find($id);
     $event->delete();
      
     return redirect('events');
    }

    
    
}
