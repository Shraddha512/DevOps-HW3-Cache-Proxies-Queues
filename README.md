Cache, Proxies, Queues
=========================

### Setup

* Clone this repo, run `npm install`.
* Install redis and run on localhost:6379

Code for all the routes in [main.js](https://github.com/Shraddha512/DevOps-HW3-Cache-Proxies-Queues/blob/master/main.js)
### set/get

```
 app.get('/get', function(req, res) {

	client.get("key", function(err,value)
	{
		res.send(value);

				});

   })

 app.get('/set', function(req, res) {

       client.set("key", "this message will self-destruct in 10 seconds");
       client.expire("key",10);
       res.send('Set!');
   })

```

### recent

```
 app.get('/recent',function(req,res){

   client.lrange("visited_url",0,4,function(err,value){
        res.send(value);
 })
})
```

### upload/meow

```
app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
    //console.log(req.body) // form fields
    //console.log(req.files) // form files

    if( req.files.image )
    {
 	   fs.readFile( req.files.image.path, function (err, data) {
 	  		if (err) throw err;
 	  		var img = new Buffer(data).toString('base64');
 	  		console.log(img);
			client.rpush('imgs',img)
 		});
 	}
    res.send("Upload successful!");
    res.status(204).end()
 }]);

 app.get('/meow', function(req, res) {


	client.lpop('imgs',function(err,imagedata){
 		if (err) throw err
 		res.writeHead(200, {'content-type':'text/html'});
    		res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");

    	res.end();
 	})
 })

```


### Additional service instance running

```
 var server2 = app.listen(3001, function () {

   var host = server2.address().address
   var port = server2.address().port

   console.log('Example app listening at http://%s:%s', host, port)
 })
```

### Demonstrating proxy
You will find this code in [proxy.js](https://github.com/Shraddha512/DevOps-HW3-Cache-Proxies-Queues/blob/master/proxy.js)

```
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

```


### Screencast
