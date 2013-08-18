module.exports = function(instanceConfig){
	'use strict';

	var _self = this || {};

	_self.config = instanceConfig;

	var terminateServer = _self.config.server.close;

	var hardClose = function(done, err){

		if(_self.config.logging) _self.config.logger.error('HARD CLOSE ON SERVER!: '+err);
		
		try {

			terminateServer();

		} catch (e) {

			if(_self.config.logging) _self.config.logger.error('Exception stopping server in HARD CLOSE: '+e);

		}
		
		done();
	};

	var fn = {

		  stopServer : function(done){

			var gracePeriod;

			try {

				gracePeriod = setTimeout(function(){
					
					if(_self.config.logging) _self.config.logger.warn('Timed-out stopping server, some connections might still be open');
					
					hardClose(done, 'Timed-out on server shutdown [>'+_self.config.shutdownTimeout * 600+'ms]');

				}, _self.config.shutdownTimeout * 600);

			} catch (e) {

				hardClose(done, 'EXCEPTION ON TIMEOUT: '+e);
			}

			try {

				terminateServer(function(){

					clearTimeout(gracePeriod);
					
					if(_self.config.logging) _self.config.logger.info('Stopped server gracefully');

					done(true);
				});

			} catch (e) {
				
				clearTimeout(gracePeriod);

				hardClose(done, 'EXCEPTION ON SERVER CLOSE: '+e);

			}
		  }

		, stopProcess : function(ret){

			if(_self.config.logging) _self.config.logger.warn('--> SHUTDOWN NOW <--');

			try {

				process.exit(ret || 0);

			} catch (e) {

				if(_self.config.logging) _self.config.logger.error('Exception thrown while terminating process: '+e);
				process.exit(255);
				throw new Error('HAVING PROBLEMS TERMINATING PROCESS!!!');
			}
		  }
	};
	return fn;
};
