/*jshint unused:false */
var noLog = function(){}
  , consoleLog = {
	  debug : console.log
	, info : console.log
	, warn : console.log
	, error : console.error
  }
  
, blankLog = {
	  debug : noLog
	, info : noLog
	, warn : noLog
	, error : noLog
  }

, me = module.exports = {

	  setup : function(userConfig) {
		'use strict';

		userConfig = userConfig || {};

		var config = {
			  shutdownTimeout : userConfig.shutdownTimeout || 300
			, startupTimeout : userConfig.startupTimeout || 300
			, maxConnectionTime : userConfig.maxConnectionTime || 30
			, maxSocketTime : userConfig.maxSocketTime || 30
			, express : userConfig.express || require('express')
			, domain : userConfig.domain || require('domain')
			, http : userConfig.http || require('http')
			, app : userConfig.app || require('express')()
			, server : userConfig.server || { close : function(cb){
				if(me.config.logging) me.config.logger.warn("USING STUB FUNCTION TO SHUT DOWN SERVER - There is a problem!");
				if(cb) cb(false);
			} }
			, shutdownFunction : userConfig.shutdownFunction
			, serverDomain : userConfig.serverDomain
			, closing : false
			, logger : consoleLog
			, gracefulExit : userConfig.gracefulExit
			, logging : true
			, testValue : true
		};
		return config;
	  }
};