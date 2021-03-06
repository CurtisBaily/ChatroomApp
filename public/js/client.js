var socket = io();
var names = [];
var title = "Chatroom beta";
var unReadCount = 0;

socket.name = prompt("Please enter your name");
$('form').submit(function(){
    if( $('#m').val() !== '' ){
        socket.emit('chat message', {name: socket.name, message: $('#m').val() , time: new Date()});
        $('#m').val('');
    }
    return false;
});

socket.on('chat message', function(msg){
    var name = msg.name;
    var message = msg.message;
    if (name === socket.name ){ 
        $('#messages').append($('<li class=\"own\">').text("You" + ": " + message));
    }
    else {
        if (names.indexOf(name) < 0 && name !== "System") {
            names[names.length] = name;
        }
        $('#names').text(names.join(", "));
        $('#messages').append($('<li class=\"stranger\">').text(name + ": " + message));
        document.title = "(" + ++unReadCount + ") New message from " + name;
    }
    var elem = document.getElementById('message-list');
    elem.scrollTop = elem.scrollHeight;
});

$(this).mousemove(function(e){
    document.title = title;
    unReadCount = 0;
});

socket.on('new-user-online', function(usr){
    if (names.indexOf(usr) < 0) {
        names[names.length] = usr;
    }
});