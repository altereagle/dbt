var socketio 	= require( 'socket.io' );
var port 	= 1111;
var connect = require( 'connect' );

var server = connect( )
	.use( connect.static( 'game' ) )
	.use( function( request, response ){ response.end( "No page found" );  } )
	.listen( port );

var gameroom =  socketio.listen( server );
var playerList = [];
var playerCount = 0;

gameroom.sockets.on( 'connection', function( client ){
	playerCount += 1;
	
	client.emit( 'welcome', { 
		message: 'Welcome to the game!',
		name: 'server',
		count: playerCount
	} );
	


	client.on( 'disconnect', function( player ){
		playerCount -= 1;
		gameroom.sockets.emit( 'disconnected', { 
			message: 'A player has left!',
			name: 'server',
			count: playerCount
		} );
	} );

	client.on( 'ping', function( player ){
		gameroom.sockets.emit( 'ping', { 
			message: player.message, 
			name: player.name
		} );
	} );
	
	client.on( 'Get Player Count', function( player ){
		gameroom.sockets.emit( 'Update Player Count', {
			message: 'Players &#62;&#62;&#62; ' + playerCount,
			name: 'server',
			playerList: playerList,
			count: playerCount
		} );
	} );

	client.on( 'Player Name Changed', function( player ){
		playerList.push( player.name );

		gameroom.sockets.emit( 'Update Player List', {
			message: player.message,
			name: player.name,
			playerList: playerList
		} );
	} );

	client.on( 'Sync Tank Movement', function ( tank ){
		gameroom.sockets.emit( 'Sync Tank Movement', {
			rx: tank.rx,
			ry: tank.ry,
			rz: tank.rz,
			px: tank.px,
			py: tank.py,
			pz: tank.pz,
			name: tank.name
		} );
	} );


	gameroom.sockets.emit( 'connected', {
		message: 'A player has joined!',
		name: 'server'
	} );
	
} );



console.log( 'Server Started' );
