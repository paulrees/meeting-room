<?php
namespace App\Lib;

// namespace Config;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;


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
  
  public function postData($title, $date, $startTime, $endTime, $priority, $email)
  {
    
    $event = new \Google_Service_Calendar_Event(array(
  	'summary' => $title,
    	'location' => 'Mettrr, 5-8 Crown Works, Temple Street, E2 6QQ',
    	'colorId' => $priority,
    	'start' => array(
      	'dateTime' => $date . 'T' . $startTime . ':00.000+01:00',
      	'timeZone' => 'Europe/London',
    	),
    	'end' => array(
      	'dateTime' => $date . 'T' . $endTime . ':00.000+01:00',
      	'timeZone' => 'Europe/London',
    	),
    	'attendees' => array(
      		array('email' => $email,'organizer' => true)
  		),
  		'guestsCanSeeOtherGuests' => false,
  ));
  
  $id = $this->calendarId;
  $result = $this->service->events->insert($id, $event);
  
  }
}