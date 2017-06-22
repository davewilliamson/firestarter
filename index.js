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

var reportError = function reportError(message, err, data) {

    var immediately = global.setImmediate || process.nextTick;


    immediately(function () {
        console.error('==================================================================================================================');
        console.error(message || '', (typeof err === Error ? err.stack : new Error('Missing error:' + err).stack), data || '');
        console.error('==================================================================================================================');
    });
};

var ConfigTool = require('./lib/configTool'),
    pjson = require('./package.json'),
    GracefulExit = require('./lib/gracefulexit'),
    SendMessage = require('./lib/sendmessage'),
    Startup = require('./lib/startup'),
    Shutdown = require('./lib/shutdown'),
    EventedStartup = require('./lib/eventedStartup');

require('colors');

module.exports = function Firestarter(userConfig) {

    var _self;

    if (!(this instanceof Firestarter)) {
        return new Firestarter(userConfig);
    }

    _self = this;

    _self.config = new ConfigTool(userConfig);

    _self.config.logger.info('Igniting the Firestarter (v' + pjson.version + ')!'.inverse.underline.yellow);

    if (_self.config.memwatch && _self.config.memwatch.enabled) {
        _self.config.logger.info('Memwatch Enabled (https://github.com/lloyd/node-memwatch)'.yellow);
        _self.config.memwatch.fn = require('memwatch-next');
        _self.config.memwatch.fn.on('leak', function (info) {
            _self.config.logger.warn(('Possible Memory Leak: ' + info.reason).bold.red);
        });
        if (_self.config.memwatch.gcStats) {
            _self.config.memwatch.fn.on('stats', function (stats) {
                _self.config.logger.warn(('V8 Garbage Collection: ' + require('util').inspect(stats, {
                    colors: true,
                    showHidden: true
                })));
            });
        }
    }

    if (userConfig && userConfig.extendFirestarter) {userConfig.extendFirestarter(_self.config);}

    if (!_self.config.serverDomain) {
        _self.config.serverDomain = _self.config.domain.create();
    }

    _self.config.gracefulExit = new GracefulExit(_self.config);
    _self.config.sendMessage = new SendMessage(_self.config);
    _self.config.startup = new Startup(_self.config);
    _self.config.shutdown = new Shutdown(_self.config);
    _self.config.eventedStartup = new EventedStartup(_self.config)();

    _self.config.HandlerRegistration = function HandlerRegistration(config) {

        var _this;

        if (!(this instanceof HandlerRegistration)) {
            return new HandlerRegistration(config)
        }

        _this = this;

        _this.config = config;

        _this.config.serverDomain.on('error', function (err) {
            if (typeof err !== Error) {
                err = new Error('Domain Error did not get an error object: ' + err || 'undefined error');
            }
            reportError('Domain Error: ', err);
            _this.config.shutdown(null, 'Shutdown due to Domain Error');
        });

        process.on('uncaughtException', function (err) {
            if (typeof err !== Error) {
                err = new Error('Exeption did not get an error object: ' + err || 'undefined error');
            }
            reportError('Uncaught Exception: ', err);
            _this.config.shutdown(null, 'Shutdown due to uncaughtException');
        });

        process.on('SIGINT', function (err) {
            if (typeof err !== Error) {
                err = new Error('SIGINT did not get an error object: ' + err || 'undefined error');
            }
            reportError('Received shutdown message from SIGINT (ctrl+c)', err);
            _this.config.shutdown(null, 'Shutdown due to SIGINT');
        });

        process.on('SIGHUP', function (err) {
            if (typeof err !== Error) {
                err = new Error('SIGHUP did not get an error object: ' + err || 'undefined error');
            }
            reportError('Received shutdown message from SIGHUP', err);
            _this.config.shutdown(null, 'Shutdown due to SIGHUP');
        });

        process.on('message', function (message) {
            var err;
            if (message === 'ping') {
                _this.config.sendMessage('pong');
            } else if (message === 'shutdown') {
                err = new Error('External shutdown requested: ' + message);
                reportError('Received shutdown message from process instantiator', err);
                _this.config.shutdown(null, 'Shutdown due to shutdown message');
            } else {
                _this.config.logger.warn('Received UNHANDLED message from process instantiator (forwarding to client):', '', {
                    message: message
                });
            }
        });

        return _this;
    };

    return {

        config: _self.config,

        shutdown: _self.config.shutdown,

        startup: _self.config.startup,

        eventedStartup: function () {
            return _self.config.eventedStartup;
        },

        getApp: function () {

            return _self.config.app;
        },

        getServer: function () {

            return _self.config.server;
        },

        getSpdyServer: function () {

            return _self.config.spdyServer;
        },

        getHttp: function () {

            return _self.config.http;
        },

        getServerDomain: function () {

            return _self.config.serverDomain;
        },

        getSocketIO: function () {
            return _self.config.sioObj;
        },

        getSecureSocketIO: function () {
            return _self.config.secureSioObj;
        }
    };
};
