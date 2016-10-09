<?php

require_once __DIR__ . '/vendor/autoload.php';

$cred = __DIR__ . '/meeting-room-mettrr.json';

$client = new Google_Client();
$client->setScopes(Google_Service_Calendar::CALENDAR);
$client->setAuthConfig($cred);

$service = new Google_Service_Calendar($client);

$calendarId = 'hello@mettrr.com';

//Add event

$event = new Google_Service_Calendar_Event(array(
	'summary' => 'ARRRRRRRRRRGGGGGGGGGGGGGGHHHHHHHHH',
  	'location' => '800 Howard St., San Francisco, CA 94103',
  	'description' => 'A chance to hear more about Google\'s developer products.',
  	'start' => array(
    	'dateTime' => '2016-10-08T10:00:00.000-05:00',
    	'timeZone' => 'America/Los_Angeles',
  	),
  	'end' => array(
    	'dateTime' => '2016-10-08T11:00:00.000-05:00',
    	'timeZone' => 'America/Los_Angeles',
  	),
  	'attendees' => array(
    	array(
    		'email' => 'mail@gmail.com',
    		'organizer' => true
    		),
    	array(
    		'email' => 'tobias@gmail.com',
    		'resource' => true
		),
  	),
  	"creator"=> array(
    	"email" => "email@example.com",
    	"displayName" => "Example",
    	"self"=> true
  	),
  	"guestsCanInviteOthers" => false,
  	"guestsCanModify" => false,
  	"guestsCanSeeOtherGuests" => false,
));

// //end

$createdEvent = $service->events->insert($calendarId, $event);

$eventId = 's2jqtbufdc45bf0srge7n1p7dc_20161013T160000Z';

$service->events->delete($calendarId, $eventId);

$optParams = array(
    'maxResults' => 10,
    'orderBy' => 'startTime',
    'singleEvents' => TRUE,
    'timeMin' => date('c'),
);

$results = $service->events->listEvents($calendarId, $optParams);

if (count($results->getItems()) == 0) {
    print "No upcoming events found.\n";
} else {
    print "Upcoming events:\n";
    foreach ($results->getItems() as $event) {
        $start = $event->start->dateTime;
        if (empty($start)) {
            $start = $event->start->date;
        }
        printf("%s (%s)\n", $event->getSummary(), $event->getId(), $start);
    }
}


