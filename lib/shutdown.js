module.exports = function(instanceConfig){
	'use strict';

	var _self = this || {};

	_self.config = instanceConfig;

	return function(err, msg){
		if(err || !msg){
			_self.config.sendMessage('offline');
			if(err){
				_self.config.logger.error('Shutting down due to error: '+err);
				_self.config.logger.error(err.stack);
			} else {
				_self.config.logger.error('Shutdown without an error???');
			}
		}
		_self.config.closing = true;

		_self.config.logger.info('Shutting down instance...(Max. '+_self.config.shutdownTimeout+' second wait!)');

		var shutdownPeriod = setTimeout(function(){
			_self.config.logger.error('Forced shutdown, as instance did not shutdown cleanly within '+_self.config.shutdownTimeout+' seconds');
			_self.config.gracefulExit.stopProcess(1);
		}, _self.config.shutdownTimeout * 1000);

		_self.config.gracefulExit.stopServer(function(){
			try {
				if(typeof _self.config.shutdownFunction === 'function') {
					_self.config.logger.info('Running user shutdown fuctions'); 
					_self.config.shutdownFunction(function(err){
						if(err) _self.config.logger.error('User shutdown functions returned an error: '+err);
						clearTimeout(shutdownPeriod);
						_self.config.gracefulExit.stopProcess(0);
					});
				} else {
					_self.config.logger.info('Instance did not define any use shutdown fuctions?');
					clearTimeout(shutdownPeriod);
					_self.config.gracefulExit.stopProcess(0);
				}
			} catch (e) {
				_self.config.logger.error('Exception executing user shutdown functions: '+e);
				clearTimeout(shutdownPeriod);
				_self.config.gracefulExit.stopProcess(0);
			}	
		});
	};
};
