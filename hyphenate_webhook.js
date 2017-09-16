//-------- Server Setup ----------
var http = require("http");
var express = require('express'),
app = express(),
port = process.env.PORT || 8000;
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies




//-------- Endpoints ------- 
app.get('/', function(req,res) {
	console.log("Get home");
  res.send('KetchUp API Version 1');
});


app.post('/webhook', function(req, res){
	console.log("Recieved a webhook message "+req.body);
	res.status(200).send();
});




//----- Create the server ----- 
app.listen(port, function() {
    console.log("KIetchUp API is running on port " + port);
});