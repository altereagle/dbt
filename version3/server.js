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
var clientEvents = {};
var clientEventNames = [
	'Welcome',
	'Goodbye',
	'Change Alias',
	'Sync Client Movement'
];

clients.sockets.on( 'connection', function( client ){
	clientCount += 1;
	console.log( 'CLIENT CONNECTED # ' + clientCount );
	
	for( var i=0; i < clientEventNames.length; i++ ){
		clientEvents[ clientEventNames[i] ] = new SyncEventManager( clientEventNames[i] ).sync( )
	}

	client.on( 'disconnect', function( socketEnd ){
		clientCount -= 1;
		console.log( 'CLIENT DISCONNECTED # ' + clientCount );

		clientEvents[ clientEventNames[ 1 ] ].send({ 
			title: clientEventNames[ 1 ],
			message: "A client has disconnected",
			clients: clientCount
		});	
	} );

	client.on( clientEventNames[ 0 ], function( syncData ){
		syncData.clients = clientCount;
		clientEvents[ clientEventNames[ 0 ] ].send(syncData);
	} );
	client.on( clientEventNames[ 1 ], function( syncData ){
		syncData.clients = clientCount;
		clientEvents[ clientEventNames[ 1] ].send(syncData);
	} );

    function SyncEventManager( eventName ) {
        var self = this;
        
        self.send = function ( syncData ){
            syncData = syncData !== undefined ? syncData : null;
	    
	    clients.sockets.emit( eventName, syncData );
	    return self;
        };
        self.sync = function ( ){
            client.on( eventName, function ( syncData ){
		clients.sockets.emit( eventName, syncData );
            } );
            return self;
        };
        return self;
    }    
} );

console.log( 'Server Started' );
