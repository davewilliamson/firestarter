var siteConfig = require('../config');

var copyInConfig = function(config, siteconfig) {
    'use strict';

    if (!siteconfig) siteconfig = siteConfig;

    for (var key in config) {
        if (typeof config[key] === 'object') {
            if (!siteconfig[key]) siteconfig[key] = {};
            copyInConfig(config[key], siteconfig[key]);
        } else {
            siteconfig[key] = config[key];
        }
    }
};

module.exports = function(config, tddSiteConfig) {
    'use strict';
    
    if (tddSiteConfig && !tddSiteConfig.tdd) tddSiteConfig = null;
    if (config) copyInConfig(config, tddSiteConfig);
    if (tddSiteConfig) return tddSiteConfig;
    return siteConfig;
};
