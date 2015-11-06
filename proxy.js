var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var httpProxy = require('http-proxy')
var http = require('http')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})

client.del('myqueue', function(err, reply) {

})
client.lpush('myqueue','http://127.0.0.1:3001');
client.lpush('myqueue','http://127.0.0.1:3000');

var proxyServer = http.createServer(function(req, res) {

	client.rpoplpush('myqueue', 'myqueue', function(err, result) {
		var proxy = httpProxy.createProxyServer({target: result});
		proxy.web(req, res);
		console.log("http://localhost:"+ result +req.url)
	})
});


console.log("listening on port3002")
proxyServer.listen(3002);
