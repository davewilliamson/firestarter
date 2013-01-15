"use strict";

var logLevel = 3, masterArgs = new Array(process.argv.length);

process.argv.forEach(function(val, index, array) {
	if (index > 2)
		masterArgs[index] = val;
	if (index == 2)
		logLevel = val;
});

console.log("Log level set to: "+logLevel);

require('./setLogging')({
	monoOnly : false,
	logLevel : logLevel
});

var numCPUs = require('os').cpus().length
  , workers = new Array(numCPUs)
  , cp = require('child_process')
  , uuid = require('node-uuid');

console.inspect(process.versions);
console.inspect(process.config);
console.inspect(process.memoryUsage());
console.log('This process is pid ' + process.pid + ':' + process.title);

try {
	process.setgid('nogroup');
	console.log('SERVICE RUNNING AS GROUP: [NOGROUP]');
	try {
		process.setuid('nodeserver');
		console.log('SERVICE RUNNING AS USER: [NODESERVER]');
	} catch (err) {
		console.error('###### Failed to set UID: ' + err + ' ######');
		console.error('###### PROCESS COULD STILL BE RUNNING AS ROOT ######');
		err = null;
		throw new Error("Could not switch to low priority user");
	}
} catch (err) {
	console.error('###### Failed to set GID: ' + err + ' ######');
	console.error('###### PROCESS COULD STILL BE RUNNING AS ROOT ######');
	err = null;
	throw new Error("Could not switch to low(/no) priority group");
}

var workerListen = function(m) {

	console.debug('Child got exception: ' + m + ', from child #:' + m.process);

	if (m.message == "exception") {

		workers[m.process].kill('SIGHUP');
		
		var id = '' + uuid.v4();

		workers[id] = cp.fork('./testLogging', [
				'worker=' + id, masterArgs
		]);
		workers[id].on('message', workerListen);

		delete workers[m.process];

		m = null;
		id = null;

	}
	m = null;
};

process.on('uncaughtException', function(err) {
	console.error('Caught exception: ' + err);
	err = null;
	process.exit(1);
});

process.on('SIGINT', function() {
	workers.forEach(function(worker) {
		worker.kill('SIGHUP');
		worker = null;
	});
	process.exit(0);
});

exports.run = function(fileName){
	
	console.log("Starting ["+fileName+"] Process as child");

	try {
		for ( var startLoop = 0; startLoop < numCPUs; startLoop++) {
			var id = '' + uuid.v4();
			workers[id] = cp.fork(fileName, [
					'worker=' + id, masterArgs
			]);

			workers[id].on('message', workerListen);

			id = null;
		}
		startLoop = null;
	} catch (e) {
		console.error('Exception starting workers: ' + e);
		e = null;
		throw new Error("Could not start workers");
	}	
};
