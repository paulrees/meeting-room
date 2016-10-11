<?php
namespace App\Lib;

// use Illuminate\Support\Facades\Cache;
// use Illuminate\Support\Facades\Config;

class CalendarClient
{
  
  protected $client;
  protected $service; 
  protected $event;
  
  public function __construct()
  {
    $key = base_path() . '/calendar.json';
    $this->client = new \Google_Client();
    $this->client->setApplicationName('Meeting Room');
    $this->client->setScopes(array('https://www.googleapis.com/auth/calendar'));
    $this->client->setAuthConfig($key);
    $this->service = new \Google_Service_Calendar($this->client);
    $this->calendarId = "hello@mettrr.com";
  }
  
  public function postData($request)
  {
    $email = getUserEmail();
    
    $event = new \Google_Service_Calendar_Event(array(
  	'summary' => $request->title,
    	'location' => 'Mettrr, 5-8 Crown Works, Temple Street, E2 6QQ',
    	'colorId' => $request->priority,
    	'start' => array(
      	'dateTime' => $request->input_date . 'T' . 
      	              $request->start_time . ':00.000+01:00',
      	'timeZone' => 'Europe/London',
    	),
    	'end' => array(
      	'dateTime' => $request->input_date . 'T' . 
      	              $request->end_time . ':00.000+01:00',
      	'timeZone' => 'Europe/London',
    	),
    	'attendees' => array(
      		array('email' => $email,'organizer' => true)
  		),
  		'guestsCanSeeOtherGuests' => false,
  ));
  
  $this->service->events->insert($this->calendarId, $event);
  
  }
}