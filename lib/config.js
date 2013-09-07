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
/*jshint unused:false */
var fs = require('fs');
var noLog = function() {}, consoleLog = {
        debug: console.log,
        info: console.log,
        warn: console.log,
        error: console.error
    }

    , blankLog = {
        debug: noLog,
        info: noLog,
        warn: noLog,
        error: noLog
    }

    , me = module.exports = {

        setup: function(userConfig) {
            'use strict';

            userConfig = userConfig || {};

            var config = {
                shutdownTimeout: userConfig.shutdownTimeout || 300,
                startupTimeout: userConfig.startupTimeout || 300,
                maxConnectionTime: userConfig.maxConnectionTime || 30,
                maxSocketTime: userConfig.maxSocketTime || 30,
                express: userConfig.express || require('express'),
                domain: userConfig.domain || require('domain'),
                http: userConfig.http || require('http'),
                app: userConfig.app || require('express')(),
                server: userConfig.server || {
                    close: function(cb) {
                        if (me.config.logging) me.config.logger.warn('USING STUB FUNCTION TO SHUT DOWN SERVER - There is a problem!');
                        if (cb) cb(false);
                    }
                },
                spdyEnabled: userConfig.spdyEnabled || false,
                spdy: userConfig.spdy,
                spdyOptions: userConfig.spdyOptions,
                shutdownFunction: userConfig.shutdownFunction,
                serverDomain: userConfig.serverDomain,
                closing: false,
                logger: consoleLog,
                gracefulExit: userConfig.gracefulExit,
                logging: true,
                testValue: true,
                name: userConfig.name || 'FireStarter'
            };
            return config;
        }
    };