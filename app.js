var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.static(__dirname));

var players = {};

io.on('connection', function(socket) {

    console.log('A player connected, sending him every players');
    socket.emit('players', players);

    socket.on('disconnect', function(player) {
        console.log('A player disconnected, broadcast deletion');
        io.emit('deleteplayer', player);
    });

    socket.on('newplayer', function(player) {
        console.log('A other player connected, broadcast add');
        players[player.uuid] = player;
        io.emit('newplayer', player);
    });

    socket.on('playerupdate', function(player) {
        console.log('A other player moved, broadcast move');
        players[player.uuid] = player;
        io.emit('playerupdate', player);
    });

});

http.listen(3000, function() {
    console.log('listening on *:3000');
});