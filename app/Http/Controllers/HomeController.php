<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Lib\CalendarScript;
use Carbon\Carbon;


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
        $input = new CalendarScript("TESTER");
        
        return view('home');
    }
    
    public function store(Request $request)
    {
        
    }
}
