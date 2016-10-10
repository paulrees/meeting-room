<?php

namespace App\Lib;

class CalendarScript
{
  
  public function __construct($input) 
  {
    $this->input = $input;  
  }
  
  public function returnDate()
  {
    return $this->input;
  }
  
}