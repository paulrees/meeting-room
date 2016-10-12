<?php

namespace App\Http\Controllers;

use App\User;
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
    public function index()
    {
        return view('home');
    }
    
    public function store(CalendarClient $calender, User $user, Request $request)
    {
        $calender->postData($request, $user);
        
        $dateFormatted = formatDate($request->input_date);
        // $startTime = formatTime($request->start_time);
        
        
        $flashMessage = strtoupper($request->title) . ' is booked on ' . 
                        $dateFormatted . ' from ' . 
                        $request->start_time . ' to ' . $request->end_time . '.';
        
        flash($flashMessage);
        
        $user->notify(new BookingConfirmed($request, $dateFormatted));
        
        return redirect('/home');
    }
}
