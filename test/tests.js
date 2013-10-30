'use strict';

var jsc = require('jscoverage'),
	buster = require('buster');

var firestarter = jsc.require('../', '../index.js')();

buster.spec.expose();

describe('Test the testing framework', function(){

    it('should return the test value from the config', function() {
        assert(firestarter.config.testValue);
    });
});
