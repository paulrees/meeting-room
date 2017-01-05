@extends('layouts.app')

@section('content')
@include('navbar')

<br>

<div class="container">
    <div class="col-md-3">
    <h1>Mettrr</h1>
    <h4>Meeting Room Booking Form</h4>
        
        <form method="POST" action="{{ url('events') }}" @submit.prevent="onSubmit" @keydown="errors.clear($event.target.name)">
        	{{ csrf_field() }}
        	<div class="control">
        		<label for="name">Your Name</label>
        		<input class="form-control" placeholder="Your full name" type="text" name="name" v-model="name"/>
        		<span class="bg-danger" v-if="errors.has('name')" v-text="errors.get('name')"></span>
        	</div>
        	
        	<div class="control">
        		<label for="title">Meeting Title</label>
        		<input class="form-control" placeholder="e.g. CEO update" type="text" name="title" v-model="title"/>
        		<span class="bg-danger" v-if="errors.has('title')" v-text="errors.get('title')"></span>
        	</div>
        	
        	<div class="control">
        		<label for="time">Date & Time</label>
        		<input class="form-control" type="text" name="time" v-model="time" required/>
        	</div>
        	
        	<div class="control">
        		<button class="btn btn-primary" :disabled='errors.any()'>Create</button>
        	</div>
        </form>
        	<span class="bg-danger" v-text="errors.get('clash')"></span>
  
	

         
        @include('flash')
        
    </div>
    <div class="col-md-9">
        
        
        <div id="calendar" class="responsive-iframe-container">
            @include('calendar')
        </div>
        
    </div>
        
        
        
                
</div>

@section('js')


@endsection

@endsection
