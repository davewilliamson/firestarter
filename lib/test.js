var firestarter = new require('../lib')({shutdownTimeout: 240, startupTimeout: 60});

// var express = require("express");

firestarter.startup(function(app, done){

	// App initialisation code

	console.log("Starting user config for app");

	/*
	 *  This is where you would initialise any DB connections, etc.
	 */

	app.use(app.router);
	
	app.use(function(err, req, res, next){
		console.log("System detected an error while serving page ["+req.url+"]: "+err);
		res.send("<!DOCTYPE html><html><head><title>Firestarter Test - ERROR PAGE</title><body><h1>Firestarter Test - ERROR PAGE</h1></body></head></html>");
		firestarter.shutdown(err);
	});

	app.get('/', function(req, res){
		console.log("Serving test page with error!");
		wibble();
		throw new Error("Test Error Page");
		res.send("<!DOCTYPE html><html><head><title>Firestarter Test</title><body><h1>Firestarter Test</h1></body></head></html>");
	});

	done(false);  // return ERROR to indicate failed start

}, function(done){

	// App termination code
	
	console.log("Starting user shutdown for app");


	/*
	 *  This is where you would shut down any DB connections, etc.
	 */

	done(false); // return ERR for not EXITED CLEANLY

}, function(){

	// Server is listening...

	console.log("Server is ready");


	/*
	 *  The server is now up & listening, so if you needed to do anything after that, this is the place!
	 */
	
	setTimeout(function(){
		//wibble();
		throw new Error("Test Error");
	},10000);

});
