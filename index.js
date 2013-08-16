module.exports = function(userConfig){
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
		, server : userConfig.server
		, shutdownFunction : userConfig.shutdownFunction
		, serverDomain : userConfig.serverDomain
		, closing : false
	};

	var sendMessageFn = function(msg){
			'use strict';
			try {
				if(typeof process.send == 'function') process.send(msg);
				console.log('Sent process instantiator message: '+msg);
			} catch (e) {
				console.log('Could not send process instantiator message: '+msg);
			}
		}

	  , gracefulExitFn = function(done){
			'use strict';
			var gracePeriod = setTimeout(function(){
				console.error('Ignoring server shutdown, some connections are still open');
				done();
			}, config.shutdownTimeout * 600);

			try {
				config.server.close(function(){
					console.log("Closed down gracefully");
					clearTimeout(gracePeriod);
					done();
				});
			} catch (e) {
				console.error('Exception executing GRACEFUL EXIT: '+e);
				clearTimeout(gracePeriod);
				done();
			}
		}

	  , processExitFn = function(ret){
			'use strict';
			try {
				console.log("--> SHUTDOWN NOW <--");
				process.exit(ret || 0);
			} catch (e) {
				console.error('Failed to shudown cleanly: '+e);
				process.exit(255);
			}
		}	

	  , fn = {

		shutdown : function(err, msg){
			'use strict';
			if(err || !msg){
				sendMessageFn('offline');
				if(err){
					console.error('Shutting down due to error: '+err);
					console.error(err.stack);
				} else {
					console.error("Shutdown without an error???");
				}
			}
			config.closing = true;

			console.log('Shutting down instance...(Max. '+config.shutdownTimeout+' second wait!)');

			var shutdownPeriod = setTimeout(function(){
				console.error('Forced shutdown, as instance did not shutdown cleanly within '+config.shutdownTimeout+' seconds');
				processExitFn(1);
			}, config.shutdownTimeout * 1000);

			gracefulExitFn(function(){
				try {
					if(typeof config.shutdownFunction == 'function') {
						console.log('Running user shutdown fuctions'); 
						config.shutdownFunction(function(err){
							if(err) console.error('User shutdown functions returned an error: '+err);
							clearTimeout(shutdownPeriod);
							processExitFn(0);
						});
					} else {
						console.log('Instance did not define any use shutdown fuctions?');
						clearTimeout(shutdownPeriod);
						processExitFn(0);
					}
				} catch (e) {
					console.error('Exception executing user shutdown functions: '+e);
					clearTimeout(shutdownPeriod);
					processExitFn(0);
				}	
			});
		}

	  , startup : function(init, onShutdown, onReady){
			'use strict';

			config.serverDomain.run(function(){

				var startTimer;

				console.log("Server being started by FireStarter...");			
				if(!config.app) config.app = express();
				
				config.app.use(function(req, res, next){
					if(config.closing){
						req.connection.setTimeout(1);
						req.socket.setTimeout(1);
					} else {
						req.connection.setTimeout(config.maxConnectionTime * 1000);
						req.socket.setTimeout(config.maxSocketTime * 1000);
					}
					res.firestarter = fn;
					next();
				});
				
				config.shutdownFunction = onShutdown;
				
				startTimer = setTimeout(function(){
					'use strict';
					console.log('Shutting down as failed to start within '+config.shutdownTimeout+' seconds');
					sendMessageFn('offline');
					fn.shutdown(null, true);
				}, config.shutdownTimeout * 1000);
			
				init(config.app, function(err){
					'use strict';
					var exPort = config.app.get('port') || 3000;
					if(err){
						console.log('Shutting down, as initialisation code failed: '+err);
						shutdown();
					} else {
						
						config.server = config.http.createServer(config.app);
						
						config.server.on('listening', function() {
							'use strict';
							clearTimeout(startTimer);
							console.log('+-| FireStarter Status |---------------------------------------------------------------------------------');
							console.log('| Application Started | Listening on port ' +  exPort + ' | Environment: ' + config.app.get('env') + ' | Version: ' + config.app.get('version') + ' |');
							console.log('+--------------------------------------------------------------------------------------------------------');
							sendMessageFn('online');
							if(typeof onReady == 'function') onReady();
						});	

						config.server.listen(exPort);
					}
				});	
			});



		}

	  , getApp : function(){
			'use strict';
			return config.app;
		}

	  , getServer : function(){
			'use strict';
			return config.server;
		}

	  , getHttp : function(){
			'use strict';
			return config.http;
		}

	  , getServerDomain : function(){
			'use strict';
			return config.serverDomain;
		}
	};

	process.on('uncaughtException', function(err) {
	    // handle the error safely
	    console.log("Uncaught Exception: "+err);
	    console.log(err.stack);
	    sendMessageFn('offline');
		fn.shutdown(null, true);
	});

	process.on('message', function(message) {
		'use strict';
		if (message === 'shutdown') {
			console.log('Received shutdown message from process instanciator');
			sendMessageFn('offline');
			fn.shutdown(null, true);
		}
	});

	process.on('SIGINT', function() {
		'use strict';
		console.log('');
		console.log('Received shutdown message from SIGINT (ctrl+c)');
		sendMessageFn('offline');
		fn.shutdown(null, true);
	});
	
	if(!config.serverDomain) config.serverDomain = config.domain.create();

	config.serverDomain.on('error', function(err){
		sendMessageFn('offline');
		console.log("Domain Error: "+err);
	    console.log(err.stack);
	    fn.shutdown(null, true);
	});

	return fn;
};
