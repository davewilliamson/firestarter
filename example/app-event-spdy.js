'use strict';

var firestarter = require('../')({
    port: 8080,
    spdyPort: 8443,
    shutdownTimeout: 8,
    startupTimeout: 8,
    maxConnectionTime: 4,
    maxSocketTime: 4,
    exUser: {
        switchOnReady: false,
        targetUser: 'nodejs',
        targetGroup: 'nodejs'
    },
    memwatch: {
        enabled: false
    },
    spdyEnabled: true,
    spdyOptions: {
        keyFile: 'test-key.pem',
        certFile: 'test-cert.pem',
        // caFile: 'test-alphaSSL.crt',
        windowSize: 1048576,
        plain: false,
        ssl: true
    },
    proxyProtocol: false,
    name: 'SPDY TEST'
}),
    express = require('express');

var firestarterAppControl = firestarter.eventedStartup();

firestarterAppControl.once('startup', function(app, done) {

    console.log('Startup');

    module.exports = app;


    app.disable('trust proxy');
    app.set('version', '0.0.1');
    app.use(express.compress());
    app.use(express.bodyParser());


    if (process.env.NODE_ENV === 'production') {
    
        app.enable('view cache');

    }

    if (process.env.NODE_ENV === 'development') {
    
        app.disable('view cache');
        app.use(express.responseTime());
        app.use(express.errorHandler());

    }

    app.get('/', function(req, res, next){
        res.send('Looking Good');
    });

    done();
});


firestarterAppControl.once('shutdown', function(done) {

    console.log('Shutdown requested!');

    done();
});

firestarterAppControl.once('ready', function() {

    console.log('Ready - press ctrl+c to exit');

});

firestarterAppControl.startup();
