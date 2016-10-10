<?php

function flash($message)
{
  session()->flash('flash_message', $message);
}

function getUserEmail()
{
  return Auth::user()->email;
}
?>