//-------- Server Setup ----------
var http = require("http");
var express = require('express'),
app = express(),
port = process.env.PORT || 8000;
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies

//------ Mongo DB setup--------
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var USER_COLLECTION = "users";
var GROUP_COLLECTION = "groups"
var db;
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
	if (err) {
		console.log(err);
		process.exit(1);
	}
	db = database;
	console.log("Database connection ready");
});
// mongodb.MongoClient.connect("mongodb://heroku_15m39cv3:pu10kina4hh0pg2paqqf32u0th@ds139954.mlab.com:39954/heroku_15m39cv3", function (err, database) {
// 	if (err) {
// 		console.log(err);
// 		process.exit(1);
// 	}
// 	db = database;
// 	console.log("Database connection ready");
// });
//-------- Yelp --------
var Yelp = require('yelp');
var yelp = new Yelp({
	consumer_key: 'T5GuFNpdY-aKJfb9x022vQ',
	consumer_secret: 'Ro4S-4wLkDXA0G0ac60ukEH2G-I',
	token: 'y8spDFmYV30pAs3yVlDDX-VD6eZTerTN',
	token_secret: 'A9hxZKsvW7LDpZ0buVw9MndFTs4',
});


//-------- Hyphenate API --------
var request = require("request");

var hyphenate_options = { method: 'POST',
url: 'https://api.hyphenate.io/1506170916011784/groupplan/messages',
headers: 
{ 'postman-token': 'a29559a7-402c-886f-c36c-f8460f9ea1c7',
'cache-control': 'no-cache',
'content-type': 'application/json',
authorization: 'Bearer YWMt26jM2psiEeew3-cdstkBogAAAV_BgNffv8WG7DFLuCsdqE4K_2wey3-UriM' },
json: true };

//--------- NLP modules ---------
var sentiment = require('sentiment');


//-------- Endpoints ------- 
app.get('/', function(req,res) {

	res.send('KetchUp API Version 1');
});

//Endpoint for logging/signing up 
app.post('/register', function(req,res){

});


app.post('/webhook', function(req, res){
	for(var i=0; i<req.body.payload.bodies.length;i++){
		console.log(sentiment(req.body.payload.bodies[i].msg));
	}
	res.status(200).send();
});

app.post('/create_group', function(req, res){

})

app.get('/suggestions/:id', function(req, res){
	console.log(req.params.id);
	getSuggestionsForGroup(req.params.id, res);

});





//----- Create the server ----- 
app.listen(port, function() {
	console.log("KIetchUp API is running on port " + port);
});




//---------- HELPER FUNCTIONS ---------

function getSuggestionsForGroup(group_id, res){
	yelp.search({ term: 'restaurants', location: 'San Francisco', category_filter:'indpak' })
	.then(function (data) {
		var restaurants = [];
		var names = "";
		for(var i=0;i<data.businesses.length;i++){
			restaurants.push(data.businesses[i].name);
			names +=" "+data.businesses[i].name;
		}
		var groupID = '27480740134913';
		var myBody = { target_type: 'chatgroups',
		target: [ groupID ],
		msg: { type: 'txt', msg: names},
		from: 'admin' };
		hyphenate_options['body'] = myBody
		request(hyphenate_options, function (error, response, body) {
			if (error) throw new Error(error);
			console.log(body);
			res.send("Done");
		});
	})
	.catch(function (err) {
		console.error(err);
		res.send('Unable to process request');
	});
}
