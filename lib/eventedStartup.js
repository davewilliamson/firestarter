'use strict';

/*
Copyright (c) 2013

Dave Williamson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var events = require('events');

module.exports = function EventedStartup(instanceConfig) {

    var _self;

    if (!(this instanceof EventedStartup)) {
        return new EventedStartup(instanceConfig);
    }

    _self = this;

    _self.config = instanceConfig;

    _self.emitter = new events.EventEmitter();

    return function () {

        _self.emitter.startup = function () {

            //            _self.config.serverDomain.run(function() {

            _self.config.logger.debug('Server being started by Evented FireStarter...');

            if (!_self.config.app)
                {_self.config.app = _self.config.express();}

            require('./injectIntoRequestChain')(_self);

            _self.startTimer = require('./startupTimer')(_self);

            _self.onReady = function () {
                _self.config.logger.debug('Firing READY event');
                _self.emitter.emit('ready');
            };

            _self.config.preShutdownFunction = function (done) {

                _self.config.logger.debug('Firing PRE-SHUTDOWN event');

                var sdListeners = _self.emitter.listeners('preshutdown').length;
                var sdReturned = 0;

                _self.emitter.emit('preshutdown', function () {

                    sdReturned++;

                    _self.config.logger.debug('Returned SHUTDOWN event', '', {
                        sdListeners: sdListeners,
                        sdReturned: sdReturned
                    });

                    if (sdReturned < sdListeners) {
                        return;
                    }

                    _self.config.logger.debug('Completed all SHUTDOWN event(s)');

                    return (done ? done() : null);
                });
            };

            _self.config.shutdownFunction = function (done) {

                _self.config.logger.debug('Firing SHUTDOWN event');

                var sdListeners = _self.emitter.listeners('shutdown').length;
                var sdReturned = 0;

                _self.emitter.emit('shutdown', function () {

                    sdReturned++;

                    _self.config.logger.debug('Returned SHUTDOWN event', '', {
                        sdListeners: sdListeners,
                        sdReturned: sdReturned
                    });

                    if (sdReturned < sdListeners) {
                        return;
                    }

                    _self.config.logger.debug('Completed from SHUTDOWN event(s)');

                    return done();
                });
            };

            _self.config.logger.debug('Firing STARTUP event');

            var listeners = _self.emitter.listeners('startup').length;
            var returned = 0;
            _self.emitter.emit('startup', _self.config.app, function (err) {
                returned++;
                if (listeners > returned && !err)
                    {return;}
                _self.config.logger.debug('Returned from STARTUP event(s)');
                require('./postUserStartup')(_self)(err);
                _self.config.registrationHandler = new _self.config.HandlerRegistration(_self.config);
            });
            // });
        };

        return _self.emitter;
    };
};
