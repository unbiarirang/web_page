const 
    redis = require('redis'),
	config = require('../../config/config'); //config 나중에 수정

module.exports = (app) => {
	global.client = redis.createClient(6379, '13.124.86.195');

	client.auth(config.redisPw);

	client.on('connect', () => {
		console.log("Redis is connected");
	});

	client.on('ready', () => {
		console.log("Redis is ready");
	});

	client.on('error', (err) => {
		console.log('Redis error encountered : ', err);
	});

	client.monitor((err, res) => {
		if (err) {
			console.err(err);
		} else {
		console.info(res);
		}
	});

	client.on('monitor', (time, args, raw_reply) => {
		console.log(time + ': ' + args + ' | ' + raw_reply);
	});

	app.use((req, res, next) => {
		req.cache = client;
		next();
	});

	//client.unref();
};