<?php
use Carbon\Carbon;

function formatDate($date)
{
  $bookedDate = Carbon::createFromFormat('Y-m-d', $date);
  $dateFormatted = $bookedDate->toFormattedDateString();  
  return $dateFormatted;
}

function flash($message)
{
  session()->flash('flash_message', $message);
}

function returnUser()
{
  return Auth::user();
}


?>