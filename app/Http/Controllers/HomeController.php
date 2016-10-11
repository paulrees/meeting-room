<?php

namespace App\Http\Controllers;

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
    public function index()
    {
        return view('home');
    }
    
    public function store(CalendarClient $calender, Request $request)
    {
        $calender->postData($request);
        
        $flashMessage = strtoupper($request->title) . ' is booked on ' . 
                        $request->input_date . ' from ' . 
                        $request->start_time . ' to ' . $request->end_time . '.';
        
        flash($flashMessage);
        
        $user = returnUser();
        $user->notify(new BookingConfirmed($request));
        
        return redirect('/home');
    }
}
