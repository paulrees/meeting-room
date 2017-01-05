@extends('layouts.app')
@include('navbar')
@section('content')


<div class="row">
	<div class="col-md-4 col-md-offset-4">
		<h2>{{ $event->title }} <small>booked by {{ $event->name }}</small></h2>
		<hr>
	</div>
</div>

<div class="row">
	<div class="col-md-2 col-md-offset-4">
		
	    <form method="POST" @submit.prevent="onEdit('{{ url('events/' . $event->id) }}')"  @keydown="errors.clear($event.target.name)">
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
        		<button class="btn btn-primary" :disabled='errors.any()'>Update</button>
        	</div>
        </form>
        	<span class="bg-danger" v-text="errors.get('clash')"></span>
		
		
	</div>
</div>
@endsection