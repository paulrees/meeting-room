<?php
namespace App\Lib;

$credentialJson = './meeting-room-mettrr.json';

class CalendarClient
{
  
  public function __construct()
  {
    $client = new Google_Client();
    $client->setScopes(Google_Service_Calendar::CALENDAR);
    $client->setAuthConfig($credentialJson);
  }
  
  public function postData($date, $startTime, $endTime)
  {
    $service = new Google_Service_Calendar($this->client);
    
    $event = new Google_Service_Calendar_Event(array(
  	'summary' => 'Test',
    	'location' => 'Mettrr, 5-8 Crown Works, Temple Street, E2 6QQ',
    	'start' => array(
      	'dateTime' => $date . 'T' . $startTime . ':00.000+01:00',
      	'timeZone' => 'Europe/London',
    	),
    	'end' => array(
      	'dateTime' => $date . 'T' . $endTime . ':00.000+01:00',
      	'timeZone' => 'Europe/London',
    	),
    	'attendees' => array(
      		'email' => 'test@gmail.com',
      		'organizer' => true
  		),
    	"creator"=> array(
      	"email" => "email@example.com",
      	"displayName" => "Example",
      	"self"=> true
    	),
  ));
  
  $calendarId = "hello@mettrr.com";
  $service->events->insert($calendarId, $event);
  }
}