var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var mongo = require('mongodb').MongoClient;
var port = 8000;

var clients = [];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/1412963727_259281.ico', function(req, res){
	res.sendfile('./1412963727_259281.ico');
});


io.on('connection', function(socket){
	console.log('user connected');
	clients.push(socket);

	mongo.connect('mongodb://localhost/chatroom', function (err, db) {
		if(err){
			console.warn(err.message);
		} else {
			var now = new Date();
			var messages = 'chat-messages-' + now.getFullYear() + now.getMonth() + now.getDate();
			var collection = db.collection(messages)
			var stream = collection.find().sort().stream();
			stream.on('data', function (chat) {
				console.log('emitting chat, ' + chat.name + ", " + chat.message);
				socket.emit('chat message', chat);
			});
		}
	});

	socket.on('chat message', function(data){
		mongo.connect('mongodb://localhost/chatroom', function (err, db) {
			if(err){
				console.warn(err.message);
			} else {
				var now = new Date();
				var messages = 'chat-messages-' + now.getFullYear() + now.getMonth() + now.getDate();
				var collection = db.collection(messages);
				collection.insert({ name: data.name, message: data.message }, function (err, o) {
					if (err) {
						console.warn(err.message);
					} else {
						console.log("chat message inserted into db - collection: " + messages + ": " + data.name + ": " + data.message);
					}
				});
			}
		});

		io.emit('chat message', data);
		process.stdout.write("Emmiting message: " + data.name + ": " + data.message + "\n");
	});

	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
});


http.listen(port, function(){
	console.log('listening on *:' + port);
});
