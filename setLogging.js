"use strict";

var c1 = '\u001b[1m\u001b[31m', c2 = '\u001b[33m', c3 = '\u001b[35m', c4 = '\u001b[34m', c5 = '\u001b[1m\u001b[33m', c6 = '\u001b[1m\u001b[33m', c7 = '\u001b[1m\u001b[37m', cr = '\u001b[0m', noop = function(
		a, b, c, d, e, f) {
}, getData = function() {
	var err = {};
	err.stack = ((new Error(module)).stack.split('\n'));
	err.stack.shift();
	err.stack.shift();
	err.stack.shift();
	err.stack = err.stack.join('\n');
	err.src = err.stack.split('\n')[0].split(':');
	err.lineNum = err.src[1];
	err.filePath = err.src[0].split('/');
	err.fileName = err.filePath[(err.filePath.length - 1)];
	err.timeStamp = new Date().toJSON();
	return err;
}, erroll = function(d) {
	var e = getData();
	errDest.write((mono ? '' : c1) + "E | " + e.timeStamp + ' | ' + e.fileName
			+ ':' + e.lineNum + ' | ' + d + (mono ? '' : cr) + '\n');
}, warnL = function(d) {
	var e = getData();
	stdDest.write((mono ? '' : c2) + "W | " + e.timeStamp + ' | ' + e.fileName
			+ ':' + e.lineNum + ' | ' + d + (mono ? '' : cr) + '\n');
}, logL = function(d) {
	var e = getData();
	stdDest.write((mono ? '' : c3) + "L | " + e.timeStamp + ' | ' + e.fileName
			+ ':' + e.lineNum + ' | ' + d + (mono ? '' : cr) + '\n');
}, infoL = function(d) {
	var e = getData();
	stdDest.write((mono ? '' : c4) + "I | " + e.timeStamp + ' | ' + e.fileName
			+ ':' + e.lineNum + ' | ' + d + (mono ? '' : cr) + '\n');
}, debugL = function(d) {
	var e = getData();
	stdDest.write((mono ? '' : c5) + "D | " + e.timeStamp + ' | ' + e.fileName
			+ ':' + e.lineNum + ' | ' + d + (mono ? '' : cr) + '\n');
}, inspectL = function(d) {
	var e = getData();
	stdDest.write((mono ? '' : c6) + "IN | " + e.timeStamp + ' | ' + e.fileName
			+ ':' + e.lineNum + ' | ' + require('util').inspect(d)
			+ (mono ? '' : cr) + '\n');
}, traceL = function(d) {
	var e = getData();
	stdDest.write((mono ? '' : c7) + "TR | " + e.timeStamp + ' | ' + e.fileName
			+ ':' + e.lineNum + ' | ' + d + '\n');
	stdDest.write(e.stack + (mono ? '' : cr) + '\n');
}, errDest = process.stderr, stdDest = process.stdout, ll = 7, mono = false;

var me = module.exports = function(options) {
	if (options) {
		if (options.errorColor)
			c1 = options.errorColor;
		if (options.warnColor)
			c2 = options.warnColor;
		if (options.logColor)
			c3 = options.logColor;
		if (options.infoColor)
			c4 = options.infoColor;
		if (options.debugColor)
			c5 = options.debugColor;
		if (options.inspectColor)
			c6 = options.inspectColor;
		if (options.traceColor)
			c7 = options.traceColor;
		if (options.resetColor)
			cr = options.resetColor;
		if (options.errFunc)
			errDest = options.errFunc;
		if (options.stdFunc)
			stdDest = options.stdFunc;
		if (options.monoOnly)
			mono = options.monoOnly;
		if (options.logLevel)
			ll = options.logLevel;
	}
	console.error = ll > 0 ? erroll : noop;
	console.warn = ll > 1 ? warnL : noop;
	console.log = ll > 2 ? logL : noop;
	console.info = ll > 3 ? infoL : noop;
	console.debug = ll > 4 ? debugL : noop;
	console.inspect = ll > 5 ? inspectL : noop;
	console.trace = ll > 6 ? traceL : noop;
	console.debug("Setup bespoke logging...");

};