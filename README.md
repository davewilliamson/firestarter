![firestarter](https://f.cloud.github.com/assets/1398082/989783/6ba1d050-091b-11e3-827f-cd334a77ac6a.png)

[![Stories in Ready](https://badge.waffle.io/davewilliamson/firestarter.png)](http://waffle.io/davewilliamson/firestarter)
[![Build Status](https://travis-ci.org/davewilliamson/firestarter.png?branch=master)](https://travis-ci.org/davewilliamson/firestarter)
[![Dependency Status](https://www.versioneye.com/user/projects/520f9bd0632bac1d6e001837/badge.png)](https://www.versioneye.com/user/projects/520f9bd0632bac1d6e001837)
[![NPM version](https://badge.fury.io/js/firestarter.png)](http://badge.fury.io/js/firestarter)
[![endorse](https://api.coderwall.com/davewilliamson/endorsecount.png)](https://coderwall.com/davewilliamson)

[![NPM](https://nodei.co/npm/firestarter.png?downloads=true&stars=true)](https://nodei.co/npm/firestarter/)

This is a must-have module for anybody writing applications using express.

Firestarter has been tested on a web site that receives over 8 million page requests per day, and has proved to be VERY stable!  It has reduced down time, memory leaks, and end user disconnects.


## Installation

	Command Shell:
	npm install firestarter
	
	In app:
	var firestarter=require('firestarter')();
    


### A tool for express to start/stop your application
Firestarter takes away the complexity of starting and stopping your application, it handles ALL errors (both thrown, and unexpected exceptions) with ease, allowing you to concentrate on writing your app.

Firstly, it wraps your entire application in a Domain, and handles any errors from that domain, by cleanly shutting down the application - when combined with a tool such as naught, this will ensure that your app is as stable (from a user point of view) as it can possibly be.

**NOTE** THIS MODULE REQUIRES THAT YOUR PROJECT IS USING EXPRESS.  Have just added support for SPDY as well, it's in and working but need to update documention yet (Sorry!) simply pass the SPDY config in the init:

	var firestarter = require('firestarter')({
		spdyEnabled: true,
            	spdyOptions:{
	                key: fs.readFileSync(__dirname + '/keys/server.key'),
	                cert: fs.readFileSync(__dirname + '/keys/server.crt'),
	                ca: fs.readFileSync(__dirname + '/keys/server.csr'),
	
	                // SPDY-specific options
	                windowSize: 1024, // Server's window size
	                plain: false,
	                ssl: true
	        }
            })
            
	and set 
	
	app.set('spdyPort', 433);

The code is simple (this is pretty much your app.js):
	
	var firestarter = require('firestarter')()
	  , db;
	
	firestarter.startup(function(app, done){
		// This is where you put all the app initialisation logic, e.g.
	
		var data = db.createConnection(server);
	
		app.set('port', 3000);
		app.set('version', 'v0.0.1');
	
		app.use(express.logger());
		// etc....
		
		app.use(app.route);
		app.use(function(err, req, res, next){
			// DO SOMETHING - then end with....
	
			res.firestarter.shutdown(err);
		});
	
		app.get('/', getTheHomePage);
	
		done();
	
	}, function(done){
		// This is where you put your shutdown logic
	
		data.closeConnection();
	
		done();
	
	}, function(){
		// This will be triggered when the server is listening and ready to serve data.
		
	});

---
	
### More Info

The main 2 commands are:

	startup(init, onShutdown, onReady)
	
	- and -

	shutdown(err)
	
startup(fn, fn, fn) - gets passed at least one (init), and upto 3 callback functions:

1. init - This is the code that used for setting up application (the normal app.use chain), it is passed a callback so when you have set everything up, you can carry on to start the application listening.  In the init function, you should initialise any datasources you app will use, and setup any load-time variables or configs.  

2. onShutdown - As the name suggests, this gets called if the app has to shutdown, it is called AFTER the server portion of the app has finished processing connections, and is passed a callback so you can confirm you have finish, and get the app terminated.
  
3. onReady - When the app is up & listening, this will get called to let you know the app is up.

	
shutdown(err) - err is optional, this is the manual way to shutdown the application.

There is also the initial require, that allows you to pass config options:

	var firestarter=require('firestarter')({});
	
The object that can be passed at the end, is for configuration options:

	var config = {
		  shutdownTimeout : 300				// seconds, default to 5 mins
		, startupTimeout : 300				// seconds, default to 5 mins
		, express : require('express')			// You 'can' pass express if required(?)
		, domain : require('domain')			// You 'can' pass domain if required(?)
		, http : require('http')			// You 'can' pass http if required(?)
		, app : require('express')()			// You 'can' pass your own app if required(?)
	};

In real terms, most of the use cases would not need to chance the defaults, so passing a null object would be normal.

---

### Under the covers
Firestarter does a number of things

* It informs program monitors (such as naught) that it is online or offline, by sending them a process message.

* It monitors the server activity, on shutdown, to ensure all connections (where possible) are terminated before quitting.

* It monitors ALL parts of your application for errors and exceptions, and handles them by attempting a clean shutdown.

	
