module.exports = function(instanceConfig){
	'use strict';

	var _self = this || {};

	_self.config = instanceConfig;

	return function(msg){
		
		try {

			if(typeof process.send === 'function'){
				process.send(msg);
				if(_self.config.logging) _self.config.logger.info('Sent process instantiator message: '+msg);
			} else {
				if(_self.config.logging) _self.config.logger.warn('Could not send process instantiator message: '+msg);
			}

		} catch (e) {

			if(_self.config.logging) _self.config.logger.error('Sending process instantiator message failed: '+msg);

		}
	};
};
