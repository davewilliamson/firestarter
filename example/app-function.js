var firestarter = require('../')(),
    express = require('express');

firestarter.startup(function(app, done) {
    'use strict';

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
    'use strict';

    console.log('Shutdown requested!');
    
    done();


}, function() {
    'use strict';

    console.log('Service will shutdown after 5 seconds....')

    setTimeout(function(){
        
        firestarter.shutdown();

    }, 5000);
});
