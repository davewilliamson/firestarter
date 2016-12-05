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


module.exports = function Shutdown(instanceConfig) {

    var _self;

    if (!(this instanceof Shutdown)) {
        return new Shutdown(instanceConfig);
    }

    _self = this;

    _self.config = instanceConfig;

    return function(err, msg) {

        _self.config.sendMessage('offline');

        if (err) {
            _self.config.logger.error(('Shutting down due to error: ').bold.red, err.stack, {
                message: msg
            });
        } else if (msg) {
            err = new Error('Shutting down due to a message:');
            _self.config.logger.error(('Shutting down due to message:').bold.red, err.stack, {
                message: msg
            });
        } else {
            err = new Error('Shutting down due to an unknown condition:');
            _self.config.logger.error(('Shutting down due to message:').bold.red, err.stack, {
                message: msg
            });
        }

        _self.config.closing = true;

        _self.config.logger.info('Shutting down instance...(Max. ' + _self.config.shutdownTimeout + ' second wait!)');

        if (typeof _self.config.preShutdownFunction === 'function') {
            _self.config.preShutdownFunction();
        }

        var shutdownPeriod = setTimeout(function() {
            try {
                _self.config.logger.error('Forced shutdown, as instance did not shutdown cleanly within ' + _self.config.shutdownTimeout + ' seconds');
                _self.config.gracefulExit.stopProcess(1);
            } catch (e) {
                if ((!(e instanceof Error)) || !e.stack) {
                    e = new Error('Could not find error class: ' + e);
                }
                _self.config.logger.error('Exception executing user shutdown functions: ', e.stack);
                _self.config.gracefulExit.stopProcess(0);
                console.trace();
                throw e;
            }
        }, _self.config.shutdownTimeout * 1000);

        _self.config.gracefulExit.stopServer(function() {
            try {
                if (typeof _self.config.shutdownFunction === 'function') {
                    _self.config.logger.info('Running user shutdown fuctions');
                    _self.config.shutdownFunction(function(err) {
                        _self.config.logger.info('Returned from running user shutdown fuctions');
                        try {
                            if (err) _self.config.logger.error('User shutdown functions returned an error: ', err.stack);
                            clearTimeout(shutdownPeriod);
                            _self.config.gracefulExit.stopProcess(0);
                        } catch (e) {
                            if ((!(e instanceof Error)) || !e.stack) {
                                e = new Error('Could not find error class: ' + e);
                            }
                            _self.config.logger.error('Exception executing user shutdown functions: ', e.stack);
                            clearTimeout(shutdownPeriod);
                            _self.config.gracefulExit.stopProcess(0);
                            console.trace();
                            throw e;
                        }
                    });
                } else {
                    try {
                        _self.config.logger.info('Instance did not define any use shutdown functions?');
                        clearTimeout(shutdownPeriod);
                        _self.config.gracefulExit.stopProcess(0);
                    } catch (e) {
                        if ((!(e instanceof Error)) || !e.stack) {
                            e = new Error('Could not find error class: ' + e);
                        }
                        _self.config.logger.error('Exception executing user shutdown functions: ', e.stack);
                        clearTimeout(shutdownPeriod);
                        _self.config.gracefulExit.stopProcess(0);
                        console.trace();
                        throw e;
                    }
                }
            } catch (e) {
                if ((!(e instanceof Error)) || !e.stack) {
                    e = new Error('Could not find error class: ' + e);
                }
                _self.config.logger.error('Exception executing user shutdown functions: ', e.stack);
                clearTimeout(shutdownPeriod);
                _self.config.gracefulExit.stopProcess(0);
                console.trace();
                throw e;
            }
        });
    };
};
