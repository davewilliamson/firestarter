"use strict";

require('./setLogging')({
	monoOnly : false,
	logLevel : 10
});

var numCPUs = require('os').cpus().length;

var workers = new Array(numCPUs);

var cp = require('child_process');
var uuid = require('node-uuid');
var masterArgs = new Array(20);

console.inspect(process.versions);
console.inspect(process.config);
console.inspect(process.memoryUsage());
console.log('This process is pid ' + process.pid + ':' + process.title);

process.on('uncaughtException', function(err) {
	console.error('Caught exception: ' + err);
	err = null;
	process.exit(1);
});

process.argv.forEach(function(val, index, array) {
	console.log(index + ': ' + val);
	if (index > 2)
		masterArgs[index] = val;
});

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

process.on('SIGINT', function() {

	workers.forEach(function(worker) {
		worker.kill('SIGHUP');
		worker = null;
	});
	process.exit(0);
});

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
