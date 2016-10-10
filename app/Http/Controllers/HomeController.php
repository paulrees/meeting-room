<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Lib\CalendarClient;
use Carbon\Carbon;

// $client = new Google_Client();
// $client->setScopes(Google_Service_Calendar::CALENDAR);
// $client->setAuthConfig($cred);
// $service = new Google_Service_Calendar($client);
// $calendarId = 'hello@mettrr.com';

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
    
    public function store(Request $request)
    {
        $name = $request->name;
        $date = $request->input_date;
        $startTime = $request->start_time;
        $endTime = $request->end_time;
        
        
        $client = new CalendarClient();
        
        $client.postData($date, $startTime, $endTime);
        
        return back();
        
//         $event = new Google_Service_Calendar_Event(array(
// 	'summary' => 'ASDADADAD',
//   	'location' => 'Mettrr, 5-8 Crown Works, Temple Street, E2 6QQ',
//   	'start' => array(
//     	'dateTime' => '',
//     	'timeZone' => 'Europe/London',
//   	),
//   	'end' => array(
//     	'dateTime' => '2016-10-08T11:00:00.000-05:00',
//     	'timeZone' => 'America/Los_Angeles',
//   	),
//   	'attendees' => array(
//     	array(
//     		'email' => 'mail@gmail.com',
//     		'organizer' => true
//     		),
//     	array(
//     		'email' => 'tobias@gmail.com',
//     		'resource' => true
// 		),
//   	),
//   	"creator"=> array(
//     	"email" => "email@example.com",
//     	"displayName" => "Example",
//     	"self"=> true
//   	),
// //   	"guestsCanInviteOthers" => false,
// //   	"guestsCanModify" => false,
// //   	"guestsCanSeeOtherGuests" => false,
// ));

// // //end

// $createdEvent = $service->events->insert($calendarId, $event);


    }
}
