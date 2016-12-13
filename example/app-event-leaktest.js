'use strict';

var firestarter = require('../')(),
    express = require('express');

var firestarterAppControl = firestarter.eventedStartup();

firestarterAppControl.once('startup', function(app, done) {

    log.log('Startup 1 - 5 second wait');

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

    setTimeout(function() {
        done();
    }, 5000);

});

firestarterAppControl.once('startup', function(app, done) {

    log.log('Startup 2');

    done();
});

firestarterAppControl.once('shutdown', function(done) {

    log.log('Shutdown 1 requested! - Waiting 5 seconds');

    setTimeout(function() {
        done();
    }, 5000);


});

firestarterAppControl.once('shutdown', function(done) {

    log.log('Shutdown 2 requested!');

    done();
});

firestarterAppControl.once('ready', function() {

    log.log('Ready 1 - Service will shutdown after 50 seconds....');

    setTimeout(function() {

        firestarter.shutdown();

    }, 50000);
});

firestarterAppControl.once('ready', function() {

    log.log('Ready 2');

    var LeakingClass = function() {};

    var arr = [];

    for (var i = 0; i < 100000; i++) arr.push(new LeakingClass());


});


firestarterAppControl.startup();
