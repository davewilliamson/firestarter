"use strict";

require('./setLogging')({
	monoOnly : false,
	logLevel : 10
});

var proc = false;

if (process.argv.length > 2) {
	if (process.argv[2].split('=')[0] == 'worker')
		proc = process.argv[2].split('=')[1];

}

process.argv.forEach(function(val, index, array) {
	console.log(index + ': ' + val);
});

if (proc) {
	console.debug("Worker ID: " + proc);
	process.on('message', function(m) {
		console.log('CHILD got message:' + m);
		process.send({
			process : proc,
			message : "Yes, I'm done!"
		});
		m = null;
	});

	process.on('SIGHUP', function() {
		console.error('Got SIGHUP from master');
		process.exit(1);
	});

	process.on('uncaughtException', function(e) {
		console.error('Caught exception: ' + e);
		process.send({
			process : proc,
			message : "exception"
		});
		e = null;
	});
} else {
	process.on('uncaughtException', function(e) {
		console.error('Caught exception: ' + e);
		process.exit(1);
		e = null;
	});
}
/**
 * console.error("Error Log"); console.warn("Warn Log"); console.log("Log Log");
 * console.info("Info Log"); console.debug("Debug Log"); console.inspect({ name :
 * "Inspect Log", test1 : 1, test2 : 2 }); console.trace("Trace Log");
 */

setTimeout(function() {
	oops();
}, 10000);
