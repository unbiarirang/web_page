const 
    redis = require('redis'),
	config = require('../../config/config'); //config 나중에 수정

module.exports = (app) => {
	global.client = redis.createClient(config.redis.port, config.redis.host);

	client.auth(config.redis.passwd);

	client.on('connect', () => {
		console.log("Redis is connected");
	});

	client.on('ready', () => {
		console.log("Redis is ready");
	});

	client.on('error', (err) => {
		console.log('Redis error encountered : ', err);
	});

	// 멀티떄문에 주석쳤음. 멀티는 모니터 모드하면 안 됨.
	// client.monitor((err, res) => {
	// 	if (err) {
	// 		console.err(err);
	// 	} else {
	// 	console.info(res);
	// 	}
	// });

	client.on('monitor', (time, args, raw_reply) => {
		console.log(time + ': ' + args + ' | ' + raw_reply);
	});

	app.use((req, res, next) => {
		req.cache = client;
		next();
	});

	//client.unref();
};