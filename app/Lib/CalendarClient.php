<?php
namespace App\Lib;

use App\User;

class CalendarClient
{
  protected $client;
  protected $services;
  protected $credentialJson;
  protected $calendarId;
  
  public function __construct()
  {
    $this->credentialJson = base_path() . '/calendar.json';
    $this->client = new \Google_Client();
    $this->client->setApplicationName('Meeting Room');
    $this->client->setScopes(array('https://www.googleapis.com/auth/calendar'));
    $this->client->setAuthConfig($this->credentialJson);
    $this->service = new \Google_Service_Calendar($this->client);  
    $this->calendarId = "hello@mettrr.com";
  }
  
  public function postData($request)
  {
    $user = returnUser();
    
    $event = new \Google_Service_Calendar_Event(array(
    	'summary' =>  ucfirst(strtolower($request->title)),
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
        		array('email' => $user->email,'organizer' => true)
    		),
    		'guestsCanSeeOtherGuests' => false,
    ));
  $this->service->events->insert($this->calendarId, $event);
  }
  
  public function getData()
  {
    $startDate = new \DateTime(null, new \DateTimeZone('Europe/London'));
    $endDate = new \DateTime(null, new \DateTimeZone('Europe/London'));
    $endDate->add(new \DateInterval('P14D'));
    
    $optParams = array(
      'orderBy' => 'startTime',
      'singleEvents' => TRUE,
      'timeMin' => $startDate->format('c'),
      'timeMax' => $endDate->format('c')
    );
    
    return $this->service->events->listEvents($this->calendarId, $optParams);
  }
}