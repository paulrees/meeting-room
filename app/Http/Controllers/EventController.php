<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Event;
use App\Http\Requests;
use App\Lib\CalendarClient;

class EventController extends Controller
{
    public function index()
    {
      return view('event/list', ['events' => Event::orderBy('start_time')->get()]);
    }
    
    public function create()
    {
      return view('event/create');
    }
    
    public function store(CalendarClient $calendar, Request $request)
    {
     
     $this -> validate(request(), [
     
     'name' => 'required',
     'title' => 'required',
     
     ]);
     
     $time = explode(" - ", $request->input('time'));
    
     $event = new Event;
     $event->name = $request->input('name');
     $event->title = $request->input('title');
     $event->start_time = $time[0];
     $event->end_time = $time[1];
     $event->save();
    //  $googleResponse = $calendar->postData($request);

      
     $request->session()->flash('success', 'The event was successfully saved!');
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
     
     $time = explode(" - ", $request->input('time'));
      
     $event = Event::findOrFail($id);
     $event->name = $request->input('name');
     $event->title = $request->input('title');
     $event->start_time = $time[0];
     $event->end_time = $time[1];
     $event->save();
      
     // return redirect('home');
    }
    
    public function destroy($id)
    {
     $event = Event::find($id);
     $event->delete();
      
     return redirect('events');
    }

    
    
}
