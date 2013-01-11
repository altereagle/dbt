//var settings = require('./dbt/default').settings;
var connect = require('connect');
var io = require('socket.io');

var c9Port = process.env.PORT;

var server = connect()
    .use(connect.static('game'))
    .use(function(request, response){
        response.end("Sorry, the game isn't up.");
    })
    .listen(c9Port);

var game = io.listen(server);

game.sockets.on('connection', function(socket){
    game.sockets.emit('newPlayer', {
        message: 'A new player has joined'
    });
});