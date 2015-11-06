var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next)
{
	console.log(req.method, req.url);

	client.lpush("visited_url", req.url);

	next(); // Passing the request to the next handler in the stack.
});


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

 app.get('/', function(req, res) {

  res.send('hello world')

})

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

 app.get('/recent',function(req,res){

   client.lrange("visited_url",0,4,function(err,value){
        res.send(value);
 })
})

// HTTP SERVER1
 var server = app.listen(3000, function () {

   var host = server.address().address
   var port = server.address().port

   console.log('Example app listening at http://%s:%s', host, port)
 })

// HTTP SERVER2
 var server2 = app.listen(3001, function () {

   var host = server2.address().address
   var port = server2.address().port

   console.log('Example app listening at http://%s:%s', host, port)
 })
