//-------- Server Setup ----------
var http = require("http");
var express = require('express'),
app = express(),
port = process.env.PORT || 3000;




//-------- Endpoints ------- 
app.get('/', function(req,res) {
  res.send('KetchUp API Version 1');
});





//----- Create the server ----- 
app.listen(port);