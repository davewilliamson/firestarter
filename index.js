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

var configTool = require('./lib/config');

module.exports = function(userConfig) {
    'use strict';

    var _self = this || {};

    _self.config = new configTool.setup(userConfig);

    _self.config.gracefulExit = _self.config.gracefulExit || new require('./lib/gracefulexit')(_self.config);
    _self.config.sendMessage = _self.config.sendMessage || new require('./lib/sendmessage')(_self.config);
    _self.config.startup = _self.config.startup || new require('./lib/startup')(_self.config);
    _self.config.shutdown = _self.config.shutdown || new require('./lib/shutdown')(_self.config);

    if (userConfig && userConfig.extendFirestarter) userConfig.extendFirestarter(_self.config);

    process.on('uncaughtException', function(err) {
        _self.config.logger.info('Uncaught Exception: ' + err);
        _self.config.logger.info(err.stack);
        _self.config.sendMessage('offline');
        _self.config.shutdown(null, true);
    });

    process.on('message', function(message) {
        if (message === 'ping') {
            _self.config.sendMessage('pong');
        } else if (message === 'shutdown') {
            _self.config.logger.info('Received shutdown message from process instanciator');
            _self.config.sendMessage('offline');
            _self.config.shutdown(null, true);
            process.on('SIGINT', function() {
                _self.config.logger.info('');
                _self.config.logger.info('Received shutdown message from SIGINT (ctrl+c)');
                _self.config.sendMessage('offline');
                _self.config.shutdown(null, true);
            });
        }
    });

    if (!_self.config.serverDomain) _self.config.serverDomain = _self.config.domain.create();

    _self.config.serverDomain.on('error', function(err) {
        _self.config.sendMessage('offline');
        _self.config.logger.info('Domain Error: ' + err);
        _self.config.logger.info(err.stack);
        _self.config.shutdown(null, true);
    });

    return {

        config: _self.config,

        shutdown: _self.config.shutdown,

        startup: _self.config.startup,

        getApp: function() {

            return _self.config.app;
        },

        getServer: function() {

            return _self.config.server;
        },

        getSpdyServer: function() {

            return _self.config.spdy;
        },

        getHttp: function() {

            return _self.config.http;
        },

        getServerDomain: function() {

            return _self.config.serverDomain;
        }
    };
};
