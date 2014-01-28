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

var SiteConfig = require('../config');

var copyInConfig = function(config, siteconfig) {
    'use strict';

    if (!siteconfig) siteconfig = new SiteConfig();

    for (var key in config) {
        if (typeof config[key] === 'object') {
            if (!siteconfig[key]) siteconfig[key] = {};
            copyInConfig(config[key], siteconfig[key]);
        } else {
            siteconfig[key] = config[key];
        }
    }
    return siteconfig;
};

module.exports = function(config, tddSiteConfig) {
    'use strict';

    var siteconfig = new SiteConfig();

    if (tddSiteConfig && !tddSiteConfig.tdd) tddSiteConfig = null;
    if (config) siteconfig = copyInConfig(config, tddSiteConfig);
    if (tddSiteConfig) return tddSiteConfig;
    return siteconfig;
};
