'use strict';


// Start this with:
// node --max_old_space_size=50 --expose-gc app-memtest.js


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

    }

    done();
});

firestarterAppControl.once('shutdown', function (done) {

    console.log('Shutdown requested!');

    done();
});

firestarterAppControl.once('ready', function () {

    function LeakingClass() {
    }

    var leaks = [];
    setInterval(function () {
        for (var i = 0; i < 10000; i++) {
            leaks.push(new LeakingClass);
        }

        console.error('Leaks: %d', leaks.length);
        global.gc();
    }, 100);

});


firestarterAppControl.startup();
