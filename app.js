var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.static(__dirname));

var players = {};

io.on('connection', function(socket) {
    var socketplayer ;
    socket.emit('players', players);

    socket.on('disconnect', function() {
        if(!socketplayer){
            return ;
        }
        delete players[socketplayer.uuid];
        io.emit('deleteplayer', socketplayer);
    });

    socket.on('newplayer', function(player) {
        socketplayer = player ;
        players[player.uuid] = player;
        io.emit('newplayer', player);
    });

    socket.on('playerupdate', function(player) {
        players[player.uuid] = player;
        io.emit('playerupdate', player);
    });

});

http.listen(process.env.PORT || 3000, function() {
    console.log('listening on *:3000');
});
