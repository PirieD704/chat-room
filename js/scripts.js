var name = prompt('What is your name?');
// console.log(io)
// var socketio = io.connect('http://10.150.51.230:8080');
var socketio = io.connect('http://54.245.145.64:8005');		
socketio.emit('name_to_server', name);

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

function sendMessage(){
	var date = new Date().toLocaleString();
	var message = document.getElementById('message').value;
	socketio.emit("message_to_server", {message: message, name: name, date: date});
}
function sendName(){
	name = document.getElementById('nameInput').value;
	socketio.emit('name_to_server',name);
}

var myApp = angular.module('myApp', []);
myApp.controller('myController', function($scope){
	$scope.message = "test";
})

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var mouseDown = false;
var color = '#000';
var thickness = 1;
var colorChoice = document.getElementById('color-picker');
var mousePosition;
var lastMousePosition = null;


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

function clearBoard(){
	context.clearRect(0,0,600,400);
}

