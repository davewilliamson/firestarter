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

module.exports = function(instanceConfig) {
    'use strict';

    var _self = this || {};

    _self.config = instanceConfig;

    return function(init, onShutdown, onReady) {

        _self.config.serverDomain.run(function() {

            var startTimer;

            _self.config.logger.info('Server being started by FireStarter...');
            if (!_self.config.app) _self.config.app = _self.config.express();

            _self.config.app.use(function(req, res, next) {
                if (_self.config.closing) {
                    req.connection.setTimeout(1);
                    req.socket.setTimeout(1);
                } else {
                    req.connection.setTimeout(_self.config.maxConnectionTime * 1000);
                    req.socket.setTimeout(_self.config.maxSocketTime * 1000);
                }
                res.firestarter = {
                    shutdown: _self.config.shutdown
                };
                next();
            });

            _self.config.shutdownFunction = onShutdown;

            startTimer = setTimeout(function() {

                _self.config.logger.info('Shutting down as failed to start within ' + _self.config.shutdownTimeout + ' seconds');
                _self.config.sendMessage('offline');
                _self.config.shutdown(null, true);
            }, _self.config.shutdownTimeout * 1000);

            init(_self.config.app, function(err) {

                var exPort = _self.config.app.get('port') || 3000;
                var spdyExPort = _self.config.app.get('spdyPort') || 3443;

                if (err) {
                    _self.config.logger.info('Shutting down, as initialisation code failed: ' + err);
                    _self.config.shutdown();
                } else {

                    _self.config.server = _self.config.http.createServer(_self.config.app);

                    _self.config.server.on('listening', function() {

                        clearTimeout(startTimer);
                        _self.config.logger.info('+- ' + _self.config.name + ' Status ----------------');
                        _self.config.logger.info('| Application Started');
                        _self.config.logger.info('| App Listening on port: ' + exPort);
                        _self.config.logger.info('| Environment: ' + _self.config.app.get('env'));
                        _self.config.logger.info('| Version: ' + _self.config.app.get('version'));
                        if (!_self.config.spdyEnabled) {
                            _self.config.logger.info('+-----------------------------------------------');
                            _self.config.sendMessage('online');
                            if (typeof onReady === 'function') onReady();
                            
                        } else {
                            _self.config.spdy = require('spdy').createServer(_self.config.spdyOptions, _self.config.app);
                            _self.config.spdy.listen(spdyExPort);
                            _self.config.spdy.on('listening', function() {

                                _self.config.logger.info('| SPDY Listening on port: ' + spdyExPort);
                                _self.config.logger.info('+-----------------------------------------------');
                                _self.config.sendMessage('online');
                                if (typeof onReady === 'function') onReady();
                            });
                        }
                    });
                    _self.config.server.listen(exPort);
                }
            });
        });
    };
};
