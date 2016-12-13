'use strict';

var firestarter = require('../')(),
    express = require('express');

firestarter.startup(function(app, done) {


    module.exports = app;

    app.configure(function() {
        app.disable('trust proxy');
        app.set('version', '0.0.1');
        app.set('port', 1234);
        app.use(express.compress());
        app.use(express.bodyParser());
    });

    app.configure('production', function() {
        app.enable('view cache');

    });

    app.configure('development', function() {
        app.disable('view cache');
        app.use(express.responseTime());
        app.use(express.errorHandler());
    });

    done();

}, function(done) {

    log.log('Shutdown requested!');

    done();


}, function() {

    log.log('Service will throw an error after 5 seconds....');

    setTimeout(function() {

        throw new Error('This would normally stop the app shutting down "nicely"');

    }, 5000);
});
