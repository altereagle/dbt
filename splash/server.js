var socketio = require( 'socket.io' );
var connect = require( 'connect' );
var port    = 4004;

var server = connect( )
  .use( connect.static( 'game' ) )
  .use( function( request, response ){ response.end( "404ish Request" );  } )
  .listen( port );

var clients = socketio.listen( server );
clients.count = 0;

clients.sockets.on( 'connection', start )

function start( client ) {
  console.log( 'Client Connected' )

  client.on( 'Add Marker', function( data ){
    clients.sockets.emit( 'Add Marker', {
      lat: data.lat,
      lon: data.lon,
      message: data.message,
      id: data.id
    });
  });
  
  client.on( 'Add Polyline', function( data ){
    clients.sockets.emit( 'Add Polyline', {
      paths: data.paths,
      id: data.id
    });
  });

  client.on( 'Add Polygon', function( data ){
    clients.sockets.emit( 'Add Polygon', {
      paths: data.paths,
      id: data.id
    });
  });

  client.on( 'Sync Map', function( data ){
    clients.sockets.emit( 'Sync Map', {
      lat: data.lat,
      lon: data.lon,
      zoom: data.zoom,
      mapType: data.mapType,
      id: data.id
    });
  });

  client.on( 'disconnect', function( data ){
    clients.count --;
    clients.sockets.emit( 'Disconnected',{
      count: clients.count
    });
  });

  clients.count ++ ;
  clients.sockets.emit( 'Connected',{
    count: clients.count
  });
}

console.log( 'Server has started' );
