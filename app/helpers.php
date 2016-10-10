<?php

function flash($message)
{
  session()->flash('flash_message', $message);
}

?>