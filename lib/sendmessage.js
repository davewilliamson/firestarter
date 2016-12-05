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

module.exports = function SendMessage(instanceConfig) {

    var _self = this;

    if (!(this instanceof SendMessage)) {
        return new SendMessage(instanceConfig);
    }

    _self = this;

    _self.config = instanceConfig;

    return function(msg) {

        try {

            if (typeof process.send === 'function') {
                process.send(msg);
                if (_self.config.logging) _self.config.logger.info(('Sent process instantiator message: ' + msg).bold.green);
            } else {
                if (_self.config.logging) _self.config.logger.warn(('Could not send process instantiator message: ' + msg).bold.cyan);
            }

        } catch (e) {

            if (_self.config.logging) _self.config.logger.error(('Sending process instantiator message failed: ' + msg).red);

        }
    };
};
