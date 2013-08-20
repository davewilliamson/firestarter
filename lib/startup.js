module.exports = function(instanceConfig){
	'use strict';

	var _self = this || {};

	_self.config = instanceConfig;

	return function(init, onShutdown, onReady){

		_self.config.serverDomain.run(function(){

			var startTimer;

			_self.config.logger.info('Server being started by FireStarter...');			
			if(!_self.config.app) _self.config.app = _self.config.express();
			
			_self.config.app.use(function(req, res, next){
				if(_self.config.closing){
					req.connection.setTimeout(1);
					req.socket.setTimeout(1);
				} else {
					req.connection.setTimeout(_self.config.maxConnectionTime * 1000);
					req.socket.setTimeout(_self.config.maxSocketTime * 1000);
				}
				res.firestarter = {
					shutdown : _self.config.shutdown
				};
				next();
			});
			
			_self.config.shutdownFunction = onShutdown;
			
			startTimer = setTimeout(function(){
				
				_self.config.logger.info('Shutting down as failed to start within '+_self.config.shutdownTimeout+' seconds');
				_self.config.sendMessage('offline');
				_self.config.shutdown(null, true);
			}, _self.config.shutdownTimeout * 1000);
		
			init(_self.config.app, function(err){
				
				var exPort = _self.config.app.get('port') || 3000;
				if(err){
					_self.config.logger.info('Shutting down, as initialisation code failed: '+err);
					_self.config.shutdown();
				} else {
					
					_self.config.server = _self.config.http.createServer(_self.config.app);
					
					_self.config.server.on('listening', function() {
						
						clearTimeout(startTimer);
						_self.config.logger.info('+- '+_self.config.name+' Status ----------------');
						_self.config.logger.info('| Application Started');
						_self.config.logger.info('| Listening on port: ' +  exPort);
						_self.config.logger.info('| Environment: ' + _self.config.app.get('env'));
						_self.config.logger.info('| Version: ' + _self.config.app.get('version'));	
						_self.config.logger.info('+-----------------------------------------------');
						_self.config.sendMessage('online');
						if(typeof onReady === 'function') onReady();
					});	

					_self.config.server.listen(exPort);
				}
			});
		});	
	};
};
