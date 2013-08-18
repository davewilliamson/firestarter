var buster = require("buster");

var firestarter = require('../')();

buster.testCase('Test testing framework', {

	'Test' : function(){
		'use strict';
		
		assert(!firestarter.config.testValue);
	}
});