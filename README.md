Firestarter
===========

## Installation

	Command Shell:
    npm install firestarter
    
    In app:
    var firestarter=require('firestarter');
    


## A tool for express to start/stop your application **
Firestarter takes away the complexity of starting and stopping your application, it handles ALL errors (both thrown, and unexpected exceptions) with ease, allowing you to concentrate on writing your app.

Firstly, it wraps your entire application in a Domain, and handles any errors from that domain, by cleanly shutting down the application - when combines with a tool such as naught, this will ensure that your app is as stable (from a user point of view) as it can possibly be.

The code is simple:
//
var firestarter = require('firestarter');

firestarter.startup(function(app, done){
	/* This is where you put all the app initialisation logic, e.g.

	var data = db.createConnection(server); */

	app.use(express.logger);
	app.use(app.route);
	app.use(function(err, req, res, next){
		// DO SOMETHING - then end with....

		firestarter.shutdown(err);
	});

	donw();

}, function(done){
	/* This is where you put your shutdown logic

	var data.closeConnection();  */

	done();

}, function(done){
	/* This will be triggered when the server is listening and ready to serve data. */
	
});
//
## Description

NodeJS client application spawner (with enhanced logging)

Development project, designed for Linux distributions, that starts node projects (as a none privileged user [nodeserver], and using the [nogroup] group.

This tool uses the spawn functionality (similar to cluster), allowing a process per cpu, and implements messaging to shutdown the client, and bring up a new client on death of the child.

Also included, and can be used stand-alone, is the setLoggin.js file, which updates the standard console.log() function(s) to provide more detail, and more control over logging levels.

A work in progress ;-)

### Contributors 

Dave Williamson (davewilliamson)