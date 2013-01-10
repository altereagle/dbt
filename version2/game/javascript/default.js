var client = io.connect( 'http://108.161.128.208:1111' );

$( function( ) {
	var clientNames;
	var clientCount = $( '<div />' )
		.attr( 'id', 'clientCount' )
		.addClass( 'ui' )
		.appendTo( $( 'body' ) );

	var clientName = $( '<div />' )
		.attr( 'type', 'text' )
		.attr( 'id' , 'clientName' )
		.addClass( 'ui' )
		.html( navigator.platform + ':noname' )
		.click( function ( event  ) {
			event.preventDefault();
			
			var oldname = clientName.html( );
			var name = prompt( 'Change your Alias' , clientName.html( ).split( ':' )[1] );
			if( name !== null && name !== navigator.platform && name !== 'noname' && name !== '' && name !== clientName.html( ).split( ':' )[1] ){
				clientName.html( navigator.platform + ":" + name );
                
				client.emit( 'Client Alias Changed',  {
					name: (clientName.html( ).split( ":" )[1] ),
					message: oldname
				} );
			} else {
				printMessage( {name: 'server', message:'Sorry, bad name, try something else'}, 4000 );
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
					name: clientName.html(),
					message: pingBox.val()
				} );

				pingBox.val( '' );
  			}
		} )
		.appendTo( $( 'body' ) );

	client.on( 'welcome',  function( player ){		
		printMessage( player, 1000 );

		client.emit( 'Get Client Count', {
			name: clientName.html( ),
			message: 'Get Client Count'
		} );
	} );

	client.on( 'Send Player Count', function( player ){
		printMessage( player, 1000 );
		clientCount.html( player.count );
	} );

	client.on( 'ping', function( ping ){
		printMessage( ping, 3000 );
	} );

	client.on( 'Update Player List', function( player ){
		printMessage( { name: "server", message: player.message.split( ":" )[1] + " &#62;&#62;&#62; " + player.name }, 4000 );
		clientNames = player.clientNames;
		console.log( clientNames );
		
		clientCount.html( player.count );
	} );

	client.on( 'disconnected', function( player ){
		printMessage( player, 1000 );
		clientCount.html( player.count );
		console.log( player.count );
	} );

	function printMessage( player, delay ) {
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
	var block, blockGeometry, blockMaterial, blockPosition;			// Declare block Variables in empty f() global scope

	var touch = {
		x: null,
		y: null,
	};

	gameboardInit( );							// Create a Camera and Scene with a block in it.
	blockControlsInit( );							// Set up block controls
	syncPlayers( );

	function gameboardInit( ){						// Initilize Gameboard

		var cameraFieldOfView = 45,					// Set Camera  field of view,
		aspectRatio 	= $( window ).width( ) / $( window ).height( ), // Set aspect ratio,
		near 		= 1,						// Set frustum near plane,
		far 		= 10000;					// Set frustom far plane.

		var startPos 	= { 						// Set Camera Position
			z: 1000
		};
		var blockDim 	= {						// Set block Dimentions
			x: $( window ).width( )/4,
			y: $( window ).height( )/4,
			z: $( window ).width( )/4
		};
		var blockMaterialSettings = {					// Set block Material settings
			color: 0xcccccc,
			wireframe: false
		};

		var lightSettings = {
			x: -600,
			y: 0,
			z: 450,
			color: 0xFF0000,
			intensity: 1.5
		};

		var pointLightSettings = {
			x: 600,
			y: 0,
			z: 450,
			color: 0x0000ff,
			intensity: 0.5
		};

		var light = new THREE.PointLight( lightSettings.color );
		light.position.x = lightSettings.x;
		light.position.y = lightSettings.y;
		light.position.z = lightSettings.z;
		light.intensity = lightSettings.intensity;

		var pointLight = new THREE.PointLight( pointLightSettings.color );
		pointLight.position.x = pointLightSettings.x;
		pointLight.position.y = pointLightSettings.y;
		pointLight.position.z = pointLightSettings.z;
		pointLight.intensity = pointLightSettings.intensity;

		camera = new THREE.PerspectiveCamera( cameraFieldOfView, aspectRatio, near, far );	// Create a new Camera,
		camera.position.z = startPos.z;								// Set camera z position

		blockGeometry 	= new THREE.CubeGeometry( blockDim.x, blockDim.y, blockDim.z );		// Set block Geometry using block Dimentions
		blockMaterial 	= new THREE.MeshLambertMaterial( blockMaterialSettings );		// Set block Material using block Material settings
		block 		= new THREE.Mesh( blockGeometry, blockMaterial );				// Create block Mesh

		scene = new THREE.Scene( );								// Create a new Scene
		scene.add( block );									// Add block to the new Scene
		scene.add( light );
		scene.add( pointLight );

		renderer = new THREE.CanvasRenderer();							// Create a Renderer to show the Scene
		renderer.setSize( $(window).width(), $(window).height() );				// Set the size of the Renderer
		rendererContainer = $( '<div />' ).attr( 'id', 'renderer' )				// Create the renderer DOM object
			.append( renderer.domElement )							// Add the Renderer to the Renderer DOM object
			.appendTo( $( 'body') );							// Add the Renderer DOM element to the Body

		return true;										// Return true
	}
	
	function blockControlsInit( ) {
		renderer.render( scene, camera);
		
		var gameboard = rendererContainer[0];

		gameboard.ontouchmove =  function( event ){
			
			touch.x = event.touches.item( 0 ).clientX;
			touch.y = event.touches.item( 0 ).clientY;
			
			if( event.touches.item( 0 ) ){
				block.position.y = rendererContainer.height( )/2 - touch.y;
				block.position.x = touch.x - rendererContainer.width( )/2;
			}

			if( event.touches.item( 1 ) ){
				event.preventDefault( );
				block.rotation.x += .05;
				block.position.x = 0;
				block.position.y = 0;
				block.position.z = 100;
			}
			
			if( event.touches.item( 2 ) ){
				event.preventDefault( );
				block.rotation.z += .05;
				block.position.x = 0;
				block.position.y = 0;
				block.position.z = 100;
			}
			
			if( event.touches.item( 3 ) ){
				event.preventDefault( );
				block.rotation.z += .05;
			}

			renderer.render( scene, camera );

			var syncDelay = 1000 // milliseconds
			setTimeout( function( ) {
				client.emit( 'Sync Client Movement', {
					rx: block.rotation.x,
					ry: block.rotation.y,
					rz: block.rotation.z,
					px: block.position.x,
					py: block.position.y,
					pz: block.position.z,
					name: $( clientName ).html().split( ':' )[1]
				} );
			}, syncDelay );

		};


		gameboard.onmousemove = function( event ) {
			touch.x = event.clientX;
			touch.y = event.clientY;
			
			block.position.y = rendererContainer.height()/2 - touch.y;
			block.position.x = touch.x - rendererContainer.width()/2;
			block.rotation.x += .03;
			block.rotation.y += .02;
			block.rotation.z += .01;

			renderer.render( scene, camera );

			var syncDelay = 1000 // milliseconds
			setTimeout( function( ) {
				client.emit( "Sync Client Movement", {
					rx: block.rotation.x,
					ry: block.rotation.y,
					rz: block.rotation.z,
					px: block.position.x,
					py: block.position.y,
					pz: block.position.z,
					name: $( clientName ).html().split( ':' )[1]
				} );
			}, syncDelay );
		};

		gameboard.onclick = function ( event ) {
			block.rotation.x = 0;
			block.rotation.y = 0;
			block.rotation.z = 0;
			
			renderer.render( scene, camera );
		};

		gameboard.ontouchend = function( event ) {
			block.position.x = 0;
			block.position.y = 0;
			block.position.z = 0;
			renderer.render( scene, camera );
		}
	}

	function syncPlayers( ){
		client.on( 'Sync Client Movement', function( playerblock ) {
			if( playerblock.name !== $( clientName ).html().split( ':' )[1] ) {
				block.rotation.x = playerblock.rx;
				block.rotation.y = playerblock.ry;
				block.rotation.z = playerblock.rz;
				block.position.x = playerblock.px;
				block.position.y = playerblock.py;
				block.position.z = playerblock.pz;
				renderer.render( scene, camera );
			}
		} );
	}
});
