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

var colors = require('colors');

module.exports = function GracefulExit(instanceConfig) {

    var _self;

    if (!(this instanceof GracefulExit)) {
        return new GracefulExit(instanceConfig);
    }

    _self = this;

    _self.config = instanceConfig;

    var terminateServer = function(cb) {

        if (cb && _self.config.logging) _self.config.logger.info('Attempting to stop server gracefully...');

        try {
            if (_self.config.server) {

                if (_self.config.logging) _self.config.logger.info('Stopping HTTP server');

                _self.config.server.close(function() {

                    if (_self.config.spdyServer) {

                        if (_self.config.logging) _self.config.logger.info('Stopping SPDY server');

                        return _self.config.spdyServer.close(cb);
                    } else {
                        return cb();
                    }
                });

            } else if (_self.config.spdyServer) {

                if (_self.config.logging) _self.config.logger.info('Stopping SPDY server');
                return _self.config.spdyServer.close(cb);

            } else {

                if (_self.config.logging) _self.config.logger.info('No servers running, returning');
                return cb();

            }

        } catch (e) {

            if (_self.config.logging) _self.config.logger.warn('Failed  on terminateServer: ' + e);

            throw new Error('Server not stopped cleanly');
        }
    };

    var hardClose = function(done, err) {

        if (_self.config.logging) _self.config.logger.warn('HARD CLOSE ON SERVER!: ' + err);

        try {

            terminateServer();

        } catch (e) {

            if (_self.config.logging) _self.config.logger.warn('Exception stopping server in HARD CLOSE: ' + e);

        }

        done();
    };

    var fn = {

        stopServer: function(done) {

            var gracePeriod, err = new Error('STOPPING SERVER');

            if (_self.config.logging) _self.config.logger.warn('INFO: Server is being shut down');

            try {

                gracePeriod = setTimeout(function() {

                    if (_self.config.logging) _self.config.logger.warn('Timed-out stopping server, some connections might still be open');

                    hardClose(done, 'Timed-out on server shutdown [>' + _self.config.shutdownTimeout * 600 + 'ms]');

                }, _self.config.shutdownTimeout * 600);

            } catch (e) {

                hardClose(done, 'EXCEPTION ON TIMEOUT: ' + e);
            }

            try {

                terminateServer(function() {

                    clearTimeout(gracePeriod);

                    if (_self.config.logging) _self.config.logger.info('Stopped server gracefully');

                    done(true);
                });

            } catch (e) {

                clearTimeout(gracePeriod);

                hardClose(done, 'EXCEPTION ON SERVER CLOSE: ' + e);

            }
        },

        stopProcess: function(ret) {

            //console.log(require('util').inspect(_self.config.memwatch.initialHeap.end(), {colors: true, showHidden: true, depth: 10} ) );

            if (_self.config.logging) _self.config.logger.warn('--> SHUTDOWN NOW <--'.red.bold.inverse);

            try {

                process.exit(ret || 0);

            } catch (e) {

                if (_self.config.logging) _self.config.logger.warn('Exception thrown while terminating process: ' + e);
                process.exit(255);
                throw new Error('HAVING PROBLEMS TERMINATING PROCESS!!!');
            }
        }
    };
    return fn;
};
