 
@if (session()->has('flash_message'))
    <div>
        {{ session('flash_message') }}
    </div>
@endif