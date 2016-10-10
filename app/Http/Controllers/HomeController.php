<?php

namespace App\Http\Controllers;

use Auth;
use App\Lib\CalendarClient;
use Illuminate\Http\Request;

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
        $name = $request->name;
        $title = $request->title;
        $date = $request->input_date;
        $startTime = $request->start_time;
        $endTime = $request->end_time;
        $priority = $request->priority;
        $email = Auth::user()->email;
        
        $results = $calender->postData($title, $date, $startTime, $endTime, $priority, $email);
        
        $flashMessage = strtoupper($title) . ' is booked on ' . $date . ' from ' . $startTime . ' to ' . $endTime . '.';
        
        flash($flashMessage);
        
        return redirect('/home');
        
    }
}
