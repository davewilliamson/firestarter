var firestarter;

buster.testCase("Firestarter Tests", {
	setUp : function(){
		"use strict";
		firestarter = require("../index.js")();
	},

	tearDown : function(done){
		"use strict";
		firestarter.shutdown();
		done();
	},

	"Test APP Startup" : function(done){
		"use strict";
		firestarter.startup(function(app, ready){
			app.set("version", "BUSTER TEST");
			app.set("port", "3000");
			ready();
		}, function(ready){

			ready();
		}, function(){

			done();
		});
	}
});