var client = io.connect( 'http://108.161.128.208:3001' );

$( function( ) {

	//var client = io.connect( 'http://108.161.128.208:1111' );
	var playerList;
	var playerCount = $( '<div />' )
		.attr( 'id', 'playerCount' )
		.addClass( 'ui' )
		.appendTo( $( 'body' ) );

	var playerName = $( '<div />' )
		.attr( 'type', 'text' )
		.attr( 'id' , 'playerName' )
		.addClass( 'ui' )
		.html( navigator.platform + ':noname' )
		.click( function ( event  ) {
			event.preventDefault();
			
			var oldname = playerName.html( );
			var name = prompt( 'Change Player Name' , playerName.html( ).split( ':' )[1] );
			if( name !== null && name !== navigator.platform && name !== 'noname' && name !== '' && name !== playerName.html( ).split( ':' )[1] ){
				playerName.html( navigator.platform + ":" + name );

				client.emit( 'Player Name Changed',  {
					name: (playerName.html( ).split( ":" )[1] ),
					message: oldname
				} );
			} else {
				printPing( {name: 'server', message:'Sorry, bad name, try something else'}, 4000 );
			};
		} )
		.appendTo( $( 'body' ) );
		
	var pingBox = $( '<input />' )
		.attr( 'id', 'pingBox' )
		.addClass( 'ui' )
		.val( 'send message!' )
		.focus( function( event ) {
			pingBox.val( '' );
			pingBox.fadeTo( 500, 1 );
		} )
		.blur( function( event ) {
			pingBox.fadeTo( 1000, .1 );
		} )
		.keypress( function( event ) {
			if ( event.which == 13 ) {
  				event.preventDefault();
				
				client.emit( 'ping', {
					name: playerName.html(),
					message: pingBox.val()
				} );

				pingBox.val( '' );
  			}
		} )
		.appendTo( $( 'body' ) );

	client.on( 'welcome',  function( player ){		
		printPing( player, 1000 );

		client.emit( 'Get Player Count', {
			name: playerName.html( ),
			message: 'Get Player Count'
		} );
	} );

	client.on( 'Update Player Count', function( player ){
		printPing( player, 1000 );
		playerCount.html( player.count );
	} );

	client.on( 'ping', function( player ){
		printPing( player, 3000 );
	} );

	client.on( 'Update Player List', function( player ){
		printPing( { name: "server", message: player.message.split( ":" )[1] + " &#62;&#62;&#62; " + player.name }, 4000 );
		playerList = player.playerList;
		console.log( playerList );
		
		playerCount.html( player.count );
	} );

	client.on( 'disconnected', function( player ){
		printPing( player, 1000 );
		playerCount.html( player.count );
		console.log( player.count );
	} );

	function printPing( player, delay ) {
		console.log( player.message );
		
		$( '.newPing' ).animate({
			bottom: 300,
			opacity: .1
		}, 800 );

		$( '.oldPing' ).fadeOut( function( ) {
			 $( '.oldPing' ).remove(); 
		} );

		var message = $( '<div />' )
			.attr( 'id', 'pingMessage' )
			.addClass( 'newPing' )
			.html( player.name + "# " + player.message )
			.appendTo( $( 'body' ) );
		
		setTimeout( function( ){
			message.addClass( 'oldPing' );
			message.fadeOut( function(){ message.remove( ) } );
		}, delay );
	}

} );

					// Render Graphics DOM Ready
$(function( ){
	window.ontouchmove = function(){ event.preventDefault(); }; 		// No overscrolling on Touch Devices
	var camera, scene, renderer;						// Declare Camera Variables in empty f() global scope
	var tank, tankGeometry, tankMaterial, tankPosition;			// Declare Tank Variables in empty f() global scope

	var touch = {
		x: null,
		y: null,
	};

	gameboardInit( );							// Create a Camera and Scene with a Tank in it.
	tankControlsInit( );							// Set up tank controls
	syncPlayers( );

	function gameboardInit( ){						// Initilize Gameboard

		var cameraFieldOfView = 45,					// Set Camera  field of view,
		aspectRatio 	= $( window ).width( ) / $( window ).height( ), // Set aspect ratio,
		near 		= 1,						// Set frustum near plane,
		far 		= 10000;					// Set frustom far plane.

		var startPos 	= { 						// Set Camera Position
			z: 1000
		};
		var tankDim 	= {						// Set Tank Dimentions
			x: $( window ).width( )/4,
			y: $( window ).height( )/4,
			z: $( window ).width( )/4
		};
		var tankMaterialSettings = {					// Set Tank Material settings
			color: 0xcccccc,
			wireframe: false
		};

		var lightSettings = {
			x: -600,
			y: 0,
			z: 450,
			color: 0xFF0000,
			intensity: 1.5
		}

		var pointLightSettings = {
			x: 600,
			y: 0,
			z: 450,
			color: 0x0000ff,
			intensity: .5
		}

		light = new THREE.PointLight( lightSettings.color );
		light.position.x = lightSettings.x;
		light.position.y = lightSettings.y;
		light.position.z = lightSettings.z;
		light.intensity = lightSettings.intensity;

		pointLight = new THREE.PointLight( pointLightSettings.color );
		pointLight.position.x = pointLightSettings.x;
		pointLight.position.y = pointLightSettings.y;
		pointLight.position.z = pointLightSettings.z;
		pointLight.intensity = pointLightSettings.intensity;

		camera = new THREE.PerspectiveCamera( cameraFieldOfView, aspectRatio, near, far );	// Create a new Camera,
		camera.position.z = startPos.z;								// Set camera z position

		tankGeometry 	= new THREE.CubeGeometry( tankDim.x, tankDim.y, tankDim.z );		// Set Tank Geometry using Tank Dimentions
		tankMaterial 	= new THREE.MeshLambertMaterial( tankMaterialSettings );		// Set Tank Material using Tank Material settings
		tank 		= new THREE.Mesh( tankGeometry, tankMaterial );				// Create Tank Mesh

		scene = new THREE.Scene( );								// Create a new Scene
		scene.add( tank );									// Add Tank to the new Scene
		scene.add( light );
		scene.add( pointLight );

		renderer = new THREE.CanvasRenderer();							// Create a Renderer to show the Scene
		renderer.setSize( $(window).width(), $(window).height() );				// Set the size of the Renderer
		rendererContainer = $( '<div />' ).attr( 'id', 'renderer' )				// Create the renderer DOM object
			.append( renderer.domElement )							// Add the Renderer to the Renderer DOM object
			.appendTo( $( 'body') );							// Add the Renderer DOM element to the Body

		return true;										// Return true
	}
	
	function tankControlsInit( ) {
		renderer.render( scene, camera);
		
		var gameboard = rendererContainer[0];

		gameboard.ontouchmove =  function( event ){
			
			touch.x = event.touches.item( 0 ).clientX;
			touch.y = event.touches.item( 0 ).clientY;
			
			if( event.touches.item( 0 ) ){
				tank.position.y = rendererContainer.height( )/2 - touch.y;
				tank.position.x = touch.x - rendererContainer.width( )/2;
			}

			if( event.touches.item( 1 ) ){
				event.preventDefault( );
				tank.rotation.x += .05;
				tank.position.x = 0;
				tank.position.y = 0;
				tank.position.z = 100;
			}
			
			if( event.touches.item( 2 ) ){
				event.preventDefault( );
				tank.rotation.z += .05;
				tank.position.x = 0;
				tank.position.y = 0;
				tank.position.z = 100;
			}
			
			if( event.touches.item( 3 ) ){
				event.preventDefault( );
				tank.rotation.z += .05;
			}

			renderer.render( scene, camera );

			var syncDelay = 1000 // milliseconds
			setTimeout( function( ) {
				client.emit( 'Sync Tank Movement', {
					rx: tank.rotation.x,
					ry: tank.rotation.y,
					rz: tank.rotation.z,
					px: tank.position.x,
					py: tank.position.y,
					pz: tank.position.z,
					name: $( playerName ).html().split( ':' )[1]
				} );
			}, syncDelay );

		};


		gameboard.onmousemove = function( event ) {
			touch.x = event.clientX;
			touch.y = event.clientY;
			
			tank.position.y = rendererContainer.height()/2 - touch.y;
			tank.position.x = touch.x - rendererContainer.width()/2;
			tank.rotation.x += .03;
			tank.rotation.y += .02;
			tank.rotation.z += .01;

			renderer.render( scene, camera );

			var syncDelay = 1000 // milliseconds
			setTimeout( function( ) {
				client.emit( "Sync Tank Movement", {
					rx: tank.rotation.x,
					ry: tank.rotation.y,
					rz: tank.rotation.z,
					px: tank.position.x,
					py: tank.position.y,
					pz: tank.position.z,
					name: $( playerName ).html().split( ':' )[1]
				} );
			}, syncDelay );
		};

		gameboard.onclick = function ( event ) {
			tank.rotation.x = 0;
			tank.rotation.y = 0;
			tank.rotation.z = 0;
			
			renderer.render( scene, camera );
		};

		gameboard.ontouchend = function( event ) {
			tank.position.x = 0;
			tank.position.y = 0;
			tank.position.z = 0;
			renderer.render( scene, camera );
		}
	}

	function syncPlayers( ){
		client.on( 'Sync Tank Movement', function( playerTank ) {
			if( playerTank.name !== $( playerName ).html().split( ':' )[1] ) {
				tank.rotation.x = playerTank.rx;
				tank.rotation.y = playerTank.ry;
				tank.rotation.z = playerTank.rz;
				tank.position.x = playerTank.px;
				tank.position.y = playerTank.py;
				tank.position.z = playerTank.pz;
				renderer.render( scene, camera );
			}
		} );
	}
});
