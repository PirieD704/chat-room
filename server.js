var http = require("http");
var fs = require("fs");

// server is what happens when someone loads up the page in a browser.
// server is listening below for http traffic at port XXXX
var server = http.createServer(function(req, res){
	fs.readFile('index.html', 'utf-8', function(error, data){
		// console.log(error);
		// console.log(data);
		if(error){
			res.writeHead(500, {'content-type': 'text/html'});
			res.end(error);
		}else{
			res.writeHead(200, {'content-type': 'text/html'});
			res.end(data);
		}
	});
});


//Include the socketio module
var socketIo = require('socket.io');
// listen to the server which is listening on port XXXX
var io = socketIo.listen(server);
var socketUsers = [];
//We need to deal with a new socket connection
io.sockets.on('connect', function(socket){
	// console.log(socket);
	socketUsers.push({
		socketID: socket.id,
		name: 'Anonymous'
	})
	io.sockets.emit('users', socketUsers);

	console.log("someone connected via a socket!")
	//someone just changed their name
	socket.on('name_to_server', function(name){
		for(var i=0; i<socketUsers.length; i++){
			if(socketUsers[i].socketID == socket.id){
				socketUsers[i].name = name;
				break;
			}
		}
		io.sockets.emit('users',socketUsers);
	});
	socket.on('message_to_server', function(data){
		console.log('Someone sent a message to the server!!!');
		io.sockets.emit('message_to_client', {
			message: data.message,
			name: data.name,
			date: data.date
		});
	});
	socket.on('disconnect', function(){
		console.log(socket.id + "A user has disconnected");
		for(var i=0; i<socketUsers.length; i++){
			if(socketUsers[i].socketID == socket.id){
				socketUsers.splice(i, 1);
				break;
			}
		}
		io.sockets.emit('users',socketUsers);
	});
});

server.listen(8005);
console.log('Listening on Port 8005...');

