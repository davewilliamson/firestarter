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


module.exports = function(_self) {

    _self.config.app.use(function(req, res, next) {
        if (_self.config.closing) {
            req.connection.setTimeout(1);
            req.socket.setTimeout(1);
        } else {
            req.connection.setTimeout(_self.config.maxConnectionTime * 1000);
            req.socket.setTimeout(_self.config.maxSocketTime * 1000);
        }
        res.firestarter = {
            shutdown: _self.config.shutdown,
            events: _self.emitter,
            sioObj: _self.config.sioObj,
            secureSioObj: _self.config.secureSioObj,
        };
        next();
    });
};
