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

module.exports = function Startup(instanceConfig) {

    var _self;

    if (!(this instanceof Startup)) {
        return new Startup(instanceConfig);
    }

    _self = this;

    _self.config = instanceConfig;

    return function(init, onShutdown, onReady) {

        _self.config.serverDomain.run(function() {

            _self.config.logger.debug('Server being started by FireStarter...');

            _self.config.app = _self.config.app || _self.config.express();

            require('./injectIntoRequestChain')(_self);

            _self.config.shutdownFunction = onShutdown;

            _self.onReady = onReady;

            _self.startTimer = require('./startupTimer')(_self);

            init(_self.config.app, require('./postUserStartup')(_self));

            _self.config.registrationHandler = new _self.config.HandlerRegistration(_self.config);
        });
    };
};
