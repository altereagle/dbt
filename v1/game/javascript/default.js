var client = io.connect(window.location.origin);
//var client = io.connect('http://108.161.128.208:5678');


var sounds = [
  new Audio("../sounds/bass.ogg"),
  new Audio("../sounds/cym.ogg"),
  new Audio("../sounds/kick.ogg"),
  new Audio("../sounds/chiptune.ogg")
];
sounds[0].loop = true;
sounds[1].loop = true;
sounds[2].loop = true;
sounds[3].loop = true;
sounds[3].play();

//sounds[0].play();
//sounds[1].play();
//sounds[2].play();
sounds[0].volume = 1;
sounds[1].volume = 0;
sounds[2].volume = 0;
sounds[3].volume = 0.1;

$( function( ) {
  var app = $('body');
  var stars = $('<div></div>')
    .addClass('stars')
    .appendTo(app);

  var instructions = $("<div></div>")
    .attr( "id", "instructions" )
    .append(
      $("<div></div>")
        .addClass('title')
        .html('硬貨を指ではじく')
    )
    .append(
      $("<div></div>")
        .addClass('smallWords')
        .html('For Play: Click \"noname\" for change and see other players move coin!')
    )
    .append(
      $("<div></div>")
        .addClass('go')
        .html('クリックしたときに準備ができて')
    )
    .click(function(){
      $(this).hide();
    })
    .appendTo(app);

  var blinkReady = setInterval(function(){
    instructions.find('.go').hide();
    setTimeout(function(){
      instructions.find('.go').show();
    },1000);
  },2000);

  setTimeout(function(){
    //instructions.fadeOut();
  },20000);
	var playerList;
	var playerCount = $( '<div />' )
		.attr( 'id', 'playerCount' )
		.addClass( 'ui' )
		.appendTo( app );

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
		.appendTo( app );
		
	var pingBox = $( '<input />' )
		.attr( 'id', 'pingBox' )
		.addClass( 'ui' )
		.val( 'チャットメッセージ' + ' for talking!' )
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
		.appendTo( app );

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
    playingTracks = player.count;
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
			.appendTo( app );
		
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
  var coin;

	var touch = {
		x: null,
		y: null
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
			x: 0,
			y: 0,
			z: 800,
			color: 0xFFFFFF,
			intensity: 1
		};

		var pointLightSettings = {
			x: 200,
			y: 0,
			z: -800,
			color: 0xFFFFFF,
			intensity: 1
		};

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

		//tankGeometry 	= new THREE.CubeGeometry( tankDim.x, tankDim.y, tankDim.z );		// Set Tank Geometry using Tank Dimentions
		//tankMaterial 	= new THREE.MeshLambertMaterial( tankMaterialSettings );		// Set Tank Material using Tank Material settings
		//tank 		= new THREE.Mesh( tankGeometry, tankMaterial );				// Create Tank Mesh

		scene = new THREE.Scene( );								// Create a new Scene
		//scene.add( tank );									// Add Tank to the new Scene
		scene.add( light );
		scene.add( pointLight );

		renderer = new THREE.WebGLRenderer();							// Create a Renderer to show the Scene
		renderer.setSize( $(window).width(), $(window).height() );				// Set the size of the Renderer
		rendererContainer = $( '<div />' ).attr( 'id', 'renderer' )				// Create the renderer DOM object
			.append( renderer.domElement )							// Add the Renderer to the Renderer DOM object
			.appendTo( $( 'body') );							// Add the Renderer DOM element to the Body


    // Coin
    var shape = {
      radius: 100.0,
      depth: 15
    };

    // Texture Options
    var texture = {
      side: "../img/three/coins/bandstock_side.jpg",
      front: "../img/three/coins/bandstock_front.jpg",
      rear: "../img/three/coins/bandstock_rear.jpg"
    };

    // Create Coin Sides
    var coin_sides_geo = new THREE.CylinderGeometry(
      shape.radius, // Top Radius — Radius of the coin at the top.
      shape.radius, // Bottom Radius — Radius of the coin at the bottom.
      shape.depth,  // Depth(height) of the coin.
      100.0,        // Radius Segments — # of segmented faces around the circumference.
      10.0,         // Height Segments — # of rows of faces along the coin depth.
      true          // Open Ended - Removes the top and bottom faces.
    );

    // Create Coin Caps
    var coin_cap_geo = new THREE.Geometry();
    var r = shape.radius;
    var capZ = ((shape.depth-1)/2) * -1;

    // Generate Cylindrical Face Vectors
    for (var i=0; i<200; i++) {
      // Math Madness
      var a = i * 1/200 * Math.PI * 2;
      var z = Math.sin(a);
      var x = Math.cos(a);
      var a1 = (i+1) * 1/200 * Math.PI * 2;
      var z1 = Math.sin(a1);
      var x1 = Math.cos(a1);

      coin_cap_geo.vertices.push(
        new THREE.Vector3(0, capZ, 0),
        new THREE.Vector3(x*r, capZ, z*r),
        new THREE.Vector3(x1*r, capZ, z1*r)
      );
      coin_cap_geo.faceVertexUvs[0].push([
        new THREE.Vector2(0.5, 0.5),
        new THREE.Vector2(x/2+0.5, z/2+0.5),
        new THREE.Vector2(x1/2+0.5, z1/2+0.5)
      ]);
      coin_cap_geo.faces.push(new THREE.Face3(i*3, i*3+1, i*3+2));
    }
    // Generate Cylindrical Faces from Vectors
    coin_cap_geo.computeCentroids();
    coin_cap_geo.computeFaceNormals();

    // Load Coin Textures
    var coin_sides_texture =
      THREE.ImageUtils.loadTexture(texture.side);
    coin_sides_texture.wrapS = coin_sides_texture.wrapT = THREE.RepeatWrapping;
    coin_sides_texture.repeat.set( 150, 1 );
    var coin_cap_texture =
      THREE.ImageUtils.loadTexture(texture.front);
    var coin_cap_texture_rear =
      THREE.ImageUtils.loadTexture(texture.rear);

    // Coin Side Bump Map
    var mapHeightSide= THREE.ImageUtils.loadTexture( "/img/three/coins/bandstock_bump_side.jpg" );
    mapHeightSide.wrapS = mapHeightSide.wrapT = THREE.RepeatWrapping;
    mapHeightSide.repeat.set( 150, 1 );
    mapHeightSide.anisotropy = 4;

    // Create Coin Side Material
    var coin_sides_mat = new THREE.MeshPhongMaterial({
      map:coin_sides_texture,
      specular: 0xeeeeee,
      shininess: 4000,
      metal: true,
      bumpMap: mapHeightSide, bumpScale: 0.1,
      shading: THREE.SmoothShading
    });
    // Apply Coin Side Geometry and Material
    var coin_sides =
      new THREE.Mesh( coin_sides_geo, coin_sides_mat );
    // BumpMap
    var mapHeightRear = THREE.ImageUtils.loadTexture( "img/three/coins/bandstock_bump_rear.jpg" );
    mapHeightRear.anisotropy = 4;
    var mapHeightFront = THREE.ImageUtils.loadTexture( "img/three/coins/bandstock_bump_front.jpg" );
    mapHeightFront.anisotropy = 4;

    // Create Coin Cap Material
    var coin_cap_mat = new THREE.MeshPhongMaterial({
      map:coin_cap_texture,
      specular: 0xffa500,
      shininess: 4000,
      metal: true,
      bumpMap: mapHeightFront, bumpScale: 0.1,
      shading: THREE.SmoothShading
    });
    var coin_cap_mat_rear = new THREE.MeshPhongMaterial({
      map:coin_cap_texture_rear,
      specular: 0xffa500,
      shininess: 4000,
      metal: true,
      bumpMap: mapHeightRear, bumpScale: 0.05,
      shading: THREE.SmoothShading
    });
    // Apply Coin Cap Geometry and Material
    var coin_cap_top = new THREE.Mesh( coin_cap_geo, coin_cap_mat );
    var coin_cap_bottom = new THREE.Mesh( coin_cap_geo, coin_cap_mat_rear );
    // Set Coin Cap Positions
    coin_cap_top.position.y = 0.5;
    coin_cap_bottom.position.y = -0.5;
    coin_cap_top.rotation.x = Math.PI;

    // Create Complete Coin
    coin = new THREE.Object3D();
    coin.add(coin_sides);
    coin.add(coin_cap_top);
    coin.add(coin_cap_bottom);

    coin.position.z = 700;
    scene.add(coin);
    return true;										// Return true
	}
	
	function tankControlsInit( ) {
		renderer.render( scene, camera);
		
		var gameboard = rendererContainer[0];
    var isMoving = false;
    function resetIsMoving(){
      isMoving = false;
    }

		gameboard.ontouchmove =  function( event ){
      // Throttle events
      if(isMoving) return;
      isMoving = true;
      setTimeout(resetIsMoving, 75);

			touch.x = event.touches.item( 0 ).clientX;
			touch.y = event.touches.item( 0 ).clientY;
			
			if( event.touches.item( 0 ) ){
				coin.position.y = rendererContainer.height( )/2 - touch.y;
				coin.position.x = touch.x - rendererContainer.width( )/2;
			}

			if( event.touches.item( 1 ) ){
				event.preventDefault( );
				coin.rotation.x += .05;
				coin.position.x = 0;
				coin.position.y = 0;
				coin.position.z = 100;
			}
			
			if( event.touches.item( 2 ) ){
				event.preventDefault( );
				coin.rotation.z += .05;
				coin.position.x = 0;
				coin.position.y = 0;
				coin.position.z = 100;
			}
			
			if( event.touches.item( 3 ) ){
				event.preventDefault( );
				coin.rotation.z += .05;
			}

			renderer.render( scene, camera );

			var syncDelay = 1000 // milliseconds
			setTimeout( function( ) {
				client.emit( 'Sync Tank Movement', {
					rx: coin.rotation.x,
					ry: coin.rotation.y,
					rz: coin.rotation.z,
					px: coin.position.x,
					py: coin.position.y,
					pz: coin.position.z,
					name: $( playerName ).html().split( ':' )[1]
				} );
			}, syncDelay );

		};

		gameboard.onmousemove = function( event ) {
      // Throttle events
      if(isMoving) return;
      isMoving = true;
      setTimeout(resetIsMoving, 75);

			touch.x = event.clientX;
			touch.y = event.clientY;
			
			coin.position.y = rendererContainer.height()/2 - touch.y;
			coin.position.x = touch.x - rendererContainer.width()/2;
			coin.rotation.x += .05;
			coin.rotation.y += .05;
			coin.rotation.z += .06;

			renderer.render( scene, camera );

			var syncDelay = 1000; // milliseconds
			setTimeout( function( ) {
				client.emit( "Sync Tank Movement", {
					rx: coin.rotation.x,
					ry: coin.rotation.y,
					rz: coin.rotation.z,
					px: coin.position.x,
					py: coin.position.y,
					pz: coin.position.z,
					name: $( playerName ).html().split( ':' )[1]
				} );
			}, syncDelay );
		};

		gameboard.onclick = function ( event ) {
			coin.rotation.x = Math.PI/2;
			coin.rotation.y = 0;
			coin.rotation.z = 0;//Math.PI/2;
			
			renderer.render( scene, camera );
		};

		gameboard.ontouchend = function( event ) {
			coin.position.x = 0;
			coin.position.y = 0;
			coin.position.z = 0;
			renderer.render( scene, camera );
		}
	}

	function syncPlayers( ){
		client.on( 'Sync Tank Movement', function( player ) {
			if( player.name !== $( playerName ).html().split( ':' )[1] ) {
				coin.rotation.x = player.rx;
				coin.rotation.y = player.ry;
				coin.rotation.z = player.rz;
				coin.position.x = player.px;
				coin.position.y = player.py;
				coin.position.z = player.pz;
				renderer.render( scene, camera );
			}
		} );
	}
});
