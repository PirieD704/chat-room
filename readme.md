#Pictionary Game

###Summary
To start, this a work in progress. It's meant to be a showcase of an implementation of socket.io to create a realtime chat room with an interactive canvas.  Players can send messages back and forth, change their name and draw whatever they want on a communal drawing board that allows for personal color choice.

Built using:
* Socket.io
* Javascript
* HTML/CSS/SASS
* Bootstrap

###Socket and Javascript Functionalities
Sockets.io requires the implementation of the sockets module which can be found in npm or you can use the CDN. Make sure that when the io.connect is declared that it is pointing at the proper port for the given ip address that you will be hosting the site on. Three parts of the page require the use of socket.io: the username-display area, the text-display area, and the canvas area. Input of name or text work largely the same and run functions on submit sendName() and sendMessage() respectively. Those functions use the emit method from socket to send packaged json to the specific socket for the given user and update their information.

```javascript
function sendMessage(){
	var date = new Date().toLocaleString();
	var message = document.getElementById('message').value;
	socketio.emit("message_to_server", {message: message, name: name, date: date});
}
function sendName(){
	name = document.getElementById('nameInput').value;
	socketio.emit('name_to_server',name);
}
```

On the response from the server, the 'on' method from sockets handles the rendering of the data in HTML by running a loop on the names to display any current users in the room and also rend the message in along with who sent the message and the time it was sent at.  the message text also displays user text on the left and friends text on the right for clarity.

```javascript
socketio.on('message_to_client', function(data){
	if(data.name === name){
		document.getElementById('chats').innerHTML += '<div class="me"><div class="im-me">' + data.message + '</div><div class="info-text"><span class="im-name-me">'+ data.name + '</span>--' + data.date + '</div></div>';
	}else{
		document.getElementById('chats').innerHTML += '<div class="others"><div class="im-others">' + data.message + '</div></ br><div class="info-text"><span class="im-name-others">'+ data.name + '</span>--' + data.date + '</div></div>';
	}
});

socketio.on('users', function(socketUsers){
	var newHTML = "";
	console.log(socketUsers);
	for(var i=0; i<socketUsers.length; i++){
		console.log(socketUsers[i].name);
		newHTML += '<li class="user">'+socketUsers[i].name+'</li>';
	}
	document.getElementById('chatUsers').innerHTML = newHTML;
});
```

The canvas portion packages all data collected via eventlisteners watching for the mouse interaction with the canvas and takes the coordinates of the mouse click, the current color and thickness selected and emits that data to corresponding user in sockets. This data is then rendered again on all clients canvases whenever anyone draws on the canvas allowing for a communal drawing board.

```javascript
colorChoice.addEventListener('change', function(event){
	color = colorChoice.value;
	console.log(color);
})

var thicknessPicker = document.getElementById('thickness-picker');
thicknessPicker.addEventListener('change', function(event){
	thickness = thicknessPicker.value;
	console.log(thickness);
})

canvas.addEventListener('mousedown', function(event){
	mouseDown = true;
})

canvas.addEventListener('mouseup', function(event){
	mouseDown = false;
	lastMousePosition = null;
})

canvas.addEventListener('mousemove', function(event){
	var pixels = window.innerWidth;
	console.log(pixels);

	if(mouseDown){
		var magicBrushX = event.pageX - 45;
		var magicBrushY = event.pageY - 436;
		// if(pixels > 991){
		// 	magicBrushY = event.pageY - 426;
		// }else{
		// 	magicBrushY = event.pageY - 681;
		// }
		// console.log(magicBrushX);
		// console.log(magicBrushY);

		console.dir(canvas);

		mousePosition = {
			x: magicBrushX,
			y: magicBrushY
		}
		console.log(mousePosition);

		if(lastMousePosition !== null){
			context.strokeStyle = color;
			context.lineJoin = 'round';
			context.lineWidth = thickness;
			context.beginPath();
			context.moveTo(lastMousePosition.x, lastMousePosition.y);
			context.lineTo(mousePosition.x, mousePosition.y);
			// context.moveTo(0, 0);
			// context.lineTo(50, 50);
			context.closePath();
			context.stroke();
		}

		var drawingData = {
			mousePosition: mousePosition,
			lastMousePosition: lastMousePosition,
			color: color,
			thickness: thickness
		}

		socketio.emit('drawing_to_server', drawingData);

		lastMousePosition = {
			x: mousePosition.x,
			y: mousePosition.y
		};
	}
})

socketio.on('drawing_to_client', function(drawingData){
	context.strokeStyle = drawingData.color;
	context.lineJoin = "round";
	context.lineWidth = drawingData.thickness;
	context.beginPath();
	context.moveTo(drawingData.lastMousePosition.x,drawingData.lastMousePosition.y);
	context.lineTo(drawingData.mousePosition.x,drawingData.mousePosition.y);
	context.closePath();
	context.stroke();
});
```

It should also be noted that the canvas requires an absolute positioning and the recording of the mouse coordinates is only specific to the canvas. In short, the coordinates for the mouse clicks on the canvas need to be recorded as if the top-left corner is at 0px X coordinates and 0px Y coordinates. This is solved by having a had value subtracted from click event from each X and Y. This takes some trouble-shooting. This summarizes the overall functionality of the app.

###Future plans for improvement:
Some UI improvement would be a much better login system that avoids the ugly alert at the beginning. Better fonts would help too as well as a unique cursor when the mouse is over the canvas. Also an elaboration on the instructions as it is still not very clear to people who visit the page what is going on.  The issue of how big the text boxes should be and where they should sit on the page to nicely include the canvas and text on the screen and still be resizeable is also a big one.  Future changes may include placing all three on one line but this necessitates the user to almost certainly keep the page to the full width of their screen.  Better background color is also another one.
