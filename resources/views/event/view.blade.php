@extends('layouts.app')
@include('navbar')
@section('content')


<div class="row">
	<div class="col-md-4 col-md-offset-4">
		<h1>Meeting:</h1>
		<h3>{{ $event->title }}</h3>
		<h3><small>booked by {{ $event->name }}</small></h3>
		<hr>
	</div>
</div>

<div class="row">
	<div class="col-md-2 col-md-offset-4">
		
	    <form method="POST" @submit.prevent="onEdit('{{ url('events/' . $event->id) }}')"  @keydown="errors.clear($event.target.name)">
	    	{{ csrf_field() }}
        	<div class="control">
        		<label for="name">Edit Name</label>
        		<input class="form-control" placeholder="Your full name" type="text" name="name" v-model="name"/>
        		<span class="bg-danger" v-if="errors.has('name')" v-text="errors.get('name')"></span>
        	</div>
        	
        	<div class="control">
        		<label for="title">Edit Meeting Title</label>
        		<input class="form-control" placeholder="e.g. CEO update" type="text" name="title" v-model="title"/>
        		<span class="bg-danger" v-if="errors.has('title')" v-text="errors.get('title')"></span>
        	</div>
        	
        	<div class="control">
        		<label for="time">Edit Date & Time</label>
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