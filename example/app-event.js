'use strict';

var firestarter = require('../')(),
    express = require('express');

var firestarterAppControl = firestarter.eventedStartup();

firestarterAppControl.once('startup', function (app, done) {

    console.log('Startup 1 - 5 second wait');

    module.exports = app;


    app.disable('trust proxy');
    app.set('version', '0.0.1');
    app.set('port', 1234);


    if (process.env.NODE_ENV === 'production') {

        app.enable('view cache');

    }

    if (process.env.NODE_ENV === 'development') {

        app.disable('view cache');

        // app.use(express.responseTime());
        // app.use(express.errorHandler());


    }

    setTimeout(function () {

        done();

    }, 5000);

});

firestarterAppControl.once('startup', function (app, done) {

    console.log('Startup 2');

    done();
});

firestarterAppControl.once('shutdown', function (done) {

    console.log('Shutdown 1 requested! - Waiting 5 seconds');

    setTimeout(function () {
        done();
    }, 5000);


});

firestarterAppControl.once('shutdown', function (done) {

    console.log('Shutdown 2 requested!');

    done();
});

firestarterAppControl.once('ready', function () {

    console.log('Ready 1 - Service will shutdown after 5 seconds....');

        firestarter.shutdown();
});

firestarterAppControl.once('ready', function () {

    console.log('Ready 2');
});


firestarterAppControl.startup();
