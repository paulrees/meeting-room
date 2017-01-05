<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of the routes that are handled
| by your application. Just tell Laravel the URIs it should respond
| to using a Closure or controller method. Build something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Auth::routes();

Route::get('/home', 'HomeController@index');

Route::post('/post', 'HomeController@store');

Route::delete('/delete', 'HomeController@destroy');

Route::resource('events', 'EventController');


Route::get('/api', function () {
	$events = DB::table('events')->select('id', 'name', 'title', 'start_time as start', 'end_time as end')->get();
	foreach($events as $event)
	{
		$event->title = $event->title . ' - ' .$event->name;
		$event->url = url('events/' . $event->id);
	}
	return $events;
});




