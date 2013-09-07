/*jshint unused:false */
var noLog = function() {},
    consoleLog = {
        debug: console.log,
        info: console.log,
        warn: console.log,
        error: console.error
    },

    blankLog = {
        debug: noLog,
        info: noLog,
        warn: noLog,
        error: noLog
    },
    
    me = module.exports = {
        shutdownTimeout: 300,
        startupTimeout: 300,
        maxConnectionTime: 30,
        maxSocketTime: 30,
        express: require('express'),
        domain: require('domain'),
        http: require('http'),
        app: require('express')(),
        server: {
            close: function(cb) {
                'use strict';

                if (me.config.logging) me.config.logger.warn('USING STUB FUNCTION TO SHUT DOWN SERVER - There is a problem!');
                if (cb) cb(false);
            }
        },
        spdyEnabled: false,
        spdy: null,
        spdyOptions: null,
        shutdownFunction: null,
        serverDomain: null,
        closing: false,
        logger: consoleLog,
        gracefulExit: null,
        logging: true,
        testValue: true,
        name: 'FireStarter'
    };
