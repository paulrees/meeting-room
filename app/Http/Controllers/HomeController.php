<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Lib\CalendarClient;
use Illuminate\Http\Request;
use App\Notifications\BookingConfirmed;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(CalendarClient $calendar)
    {
        $eventListing = $calendar->getData();
        return view('home', compact('eventListing'));
    }
    
    public function store(CalendarClient $calendar, Request $request)
    {
        $calendar->postData($request);
        
        $dateFormatted = formatDate($request->input_date);
        
        $flashMessage = strtoupper($request->title) . ' is booked on ' . 
                        $dateFormatted . ' from ' . 
                        $request->start_time . ' to ' . $request->end_time . '.';
        
        flash($flashMessage);
        
        $user = returnUser();
        $user->notify(new BookingConfirmed($request, $dateFormatted));
        
        return redirect('/home');
    }
    
    public function destroy(CalendarClient $calendar, Request $request)
    {
        $calendar->deleteData($request->eventId);
        
        $flashMessage = strtoupper($request->title) . ' has been deleted. ';
        flash($flashMessage);
        
        return redirect('/home');
    }
}
