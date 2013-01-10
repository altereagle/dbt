var socketio = require( 'socket.io' );
var connect = require( 'connect' );
var port    = 1111;

var server = connect( )
	.use( connect.static( 'game' ) )
	.use( function( request, response ){ response.end( "404ish Request" );  } )
	.listen( port );

var clients = socketio.listen( server );
var clientNames = [];
var clientCount = 0;

clients.sockets.on( 'connection', function( client ){
	clientCount += 1;
	
	client.emit( 'welcome', { 
		message: 'Welcome to the game!',
		name: 'server',
		count: clientCount
	} );
	


	client.on( 'disconnect', function( player ){
		clientCount -= 1;
		clients.sockets.emit( 'disconnected', { 
			message: 'A player has left!',
			name: 'server',
			count: clientCount
		} );
	} );

	client.on( 'ping', function( player ){
		clients.sockets.emit( 'ping', { 
			message: player.message, 
			name: player.name
		} );
	} );
	
	client.on( 'Get Client Count', function( player ){
		clients.sockets.emit( 'Send Player Count', {
			message: 'Connected Clients =' + clientCount,
			name: 'server',
			clientNames: clientNames,
			count: clientCount
		} );
	} );

	client.on( 'Client Alias Changed', function( player ){
		clientNames.push( player.name );

		clients.sockets.emit( 'Update Player List', {
			message: player.message,
			name: player.name,
			clientNames: clientNames
		} );
	} );

	client.on( 'Sync Client Movement', function ( block ){
		clients.sockets.emit( 'Sync Client Movement', {
			rx: block.rx,
			ry: block.ry,
			rz: block.rz,
			px: block.px,
			py: block.py,
			pz: block.pz,
			name: block.name
		} );
	} );

	clients.sockets.emit( 'connected', {
		message: 'A player has joined!',
		name: 'server'
	} );
	
} );

console.log( 'Server Started' );
