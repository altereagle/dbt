var client = io.connect('http://108.161.128.208:4003');

$(function () {
  var clientCount = $('<div />')
    .attr('id', 'clientCount')
    .addClass('ui')
    .appendTo($('body'));

  var clientName = $('<div />')
    .attr('type', 'text')
    .attr('id', 'clientName')
    .addClass('ui')
    .html(navigator.platform + ':noname')
    .click(function (event) {
      event.preventDefault();
      var oldname = clientName.html().split(':')[1];
      var name = prompt('Change your Alias', clientName.html().split(':')[1]);
      if (name !== null && name !== navigator.platform && name !== 'noname' && name !== '' && name !== clientName.html().split(':')[1]) {
        clientName.html(navigator.platform + ":" + name);
        changeAlias.send(1000,{
          name: "message",
          message: oldname + " is now " + name
        });
      } else {
        printMessage({
          message: 'Sorry, bad name, try something else'
        });
      }
  })
    .appendTo($('body'));

  var pingBox = $('<input />')
    .attr('id', 'pingBox')
    .addClass('ui')
    .val('I am making updates - check back later')
    .focus(function (event) {
    pingBox.val('');
    pingBox.fadeTo(500, 1);
  })
    .blur(function (event) {
    pingBox.fadeTo(1000, 0.1);
  })
    .keypress(function (event) {
    if (event.which === 13) {
      event.preventDefault();
      
      client.emit('ping', {
        name: clientName.html(),
        message: pingBox.val()
      });
      
      pingBox.val('');
    }
  })
    .appendTo($('body'));

// Page Events

  var welcomeMessage = new Sync( 'Welcome', {
    title:'Welcome!',
    message: $(clientName).html().split(':')[1] + ' has connected',
    callback:function(syncData){
      clientCount.html(syncData.clients);
      if(syncData.clients) return;
      
      printMessage(syncData);
    }
  }).enable().send();
  
  var changeAlias = new Sync ( 'Change Alias', {
    title: 'Changed Alias',
    message: 'message',
    callback: printMessage
  }).enable();

  var exitMessage = new Sync( 'Goodbye', {
    title:'Goodbye',
    message: $(clientName).html().split(':')[1] + ' has disconnected',
    callback: function(syncData) {
      clientCount.html(syncData.clients);
      
      printMessage(syncData);
    }
  }).enable();

  function printMessage(syncData) {
    var delay = 4000;
    var syncMessage = syncData !== null && syncData !== undefined && syncData.message ? syncData.message : "no message";
    console.log(syncData);

    $('.newPing').animate({
      bottom: 300,
      opacity: 0.1
    }, 800);

    $('.oldPing').fadeOut(function () {
      $('.oldPing').remove();
    });

    var message = $('<div />')
      .attr('id', 'pingMessage')
      .addClass('newPing')
      .html(syncMessage)
      .appendTo($('body'));

    setTimeout(function () {
      message.addClass('oldPing');
      message.fadeOut(function () {
        message.remove();
      });
    }, delay);
  }
  
  window.ontouchmove = function () {
    event.preventDefault();
  }; // No overscrolling

  // Main Objects
  var camera, scene, renderer, rendererContainer, projector, block;

  // Client Touch Position
  var touch = {
    x: null,
    y: null,
  };

  //  333  DDDD
  //    33 DD  DD
  //  3333 DD  DD   --- Daaanggaa zonnee!
  //    33 DD  DD
  //  333  DDDD
  
  initView();
  initControls();
 
  // Sync Client Movement Event
  var clientMovement = new Sync( 'Sync Client Movement', block ).enable();

  // Initilize hotspot
  function initView() { 
    
    // Set Camera Properties
    var cameraFieldOfView = 45, 
      aspectRatio = $(window).width() / $(window).height(),
      near = 1,
      far = 10000;
    
    // Prefab Shapes
    var shapes = {
      sphere: new THREE.SphereGeometry($(window).width() / 8, 8, 8),
      cube: new THREE.CubeGeometry($(window).width() / 4, $(window).height() / 4, $(window).width() / 4)
    };

    // Prefab Colors
    var colors = {
      white: 0xFFFFFF,
      black: 0x000000,
      red: 0xFF0000,
      green: 0x00FF00,
      blue: 0x0000FF
    };

    // Prefab Textures
    var textures = {
      blank: new THREE.MeshLambertMaterial({
        color: 0xFFFFFF,
        shading: THREE.SmoothShading,
        wireframe: false
      }),
      earth: new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('textures/earth.jpg')
      })
    };

    // Left Light
    var light = new THREE.PointLight(colors.white);
    light.position.x = -600;
    light.position.y = 100;
    light.position.z = 450;
    light.intensity = 1;

    // Right Light
    var pointLight = new THREE.PointLight(colors.white);
    pointLight.position.x = 600;
    pointLight.position.y = 100;
    pointLight.position.z = 450;
    pointLight.intensity = 1;

    // Camera
    camera = new THREE.PerspectiveCamera(cameraFieldOfView, aspectRatio, near, far);
    camera.position.z = 1000;

    // Block
    block = new THREE.Mesh(shapes.sphere, textures.blank);

    // Scene
    scene = new THREE.Scene();
    scene.add(block);
    scene.add(light);
    scene.add(pointLight);

    // Renderer
    renderer = new THREE.CanvasRenderer(); // Create a Renderer to show the Scene
    renderer.setSize($(window).width(), $(window).height()); // Set the size of the Renderer
    rendererContainer = $('<div />').attr('id', 'renderer') // Create the renderer DOM object
    .append(renderer.domElement) // Add the Renderer to the Renderer DOM object
    .appendTo($('body')); // Add the Renderer DOM element to the Body

    // Projector
    projector = new THREE.Projector();

    // Rotate Camera
    animate();
    var radius = 600;
    var theta = 0;
    function animate() {
      requestAnimationFrame(animate);
      rotateCamera();
    }
    function rotateCamera() {
      TWEEN.update();
      theta += 0.1;
      camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
      camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
      camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta));
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }

    // Window resize handler
    $(window).resize(function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
    });

    // Render Scene
    renderer.render(scene, camera);
    // End initView
    return true; 
  }

  function initControls() {

    // Touch/Click event hotspot
    var hotspot = rendererContainer[0];

    // Touch Move
    hotspot.ontouchmove = function (event) {
      // Assign X,Y positions
      touch.x = event.touches.item(0).clientX;
      touch.y = event.touches.item(0).clientY;
      // If 1 finger is touching
      if (event.touches.item(0)) {
        block.rotation.x += 0.05;
        block.position.y = rendererContainer.height( )/2 - touch.y;
        block.position.x = touch.x - rendererContainer.width( )/2;
      }
      // If 2 fingers are touching
      if (event.touches.item(1)) {
        event.preventDefault();
        block.rotation.y += 0.05;
      }
      // If 3 fingers are touching
      if (event.touches.item(2)) {
        event.preventDefault();
        block.rotation.z += 0.05;
      }
      // re-render the scene
      renderer.render(scene, camera);
      // Send new position to all connected clients every 10ms
      clientMovement.send(10);
    };

    // Mouse Move
    hotspot.onmousemove = function (event) {
      // Assign X,Y positons
      touch.x = event.clientX;
      touch.y = event.clientY;
      // Move the Block
      block.position.y = rendererContainer.height()/2 - touch.y;
      block.position.x = touch.x - rendererContainer.width()/2;
      // Rotate while moving
      block.rotation.x += 0.05;
      block.rotation.y += 0.05;
      block.rotation.z += 0.05;
      // re-render the scene
      renderer.render(scene, camera);
      // Send new position to all connected clients every 10ms
      clientMovement.send(10);
    };

    // Mouse Down
    hotspot.onmousedown = function (event) {
      // Not used yet, but will be. ( for selecting/clicking on 3D objects )
      var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
      projector.unprojectVector(vector, camera);
      var raycaster = new THREE.Raycaster(camera.position, vector.subSelf(camera.position).normalize());
      var intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        // Will be used later
        console.log(intersects[0].object);
        // Resets the orientation of the block
        intersects[0].object.rotation.x = 0;
        intersects[0].object.rotation.y = 0;
        intersects[0].object.rotation.z = 0;
      }
      // re-render the scene
      renderer.render(scene, camera);
      // Sends the new position to all connected clients instantly
      clientMovement.send(0);
    };

    // Touch End
    hotspot.ontouchend = function (event) {
      // Resets the block position
      block.position.x = 0;
      block.position.y = 0;
      block.position.z = 0;
      // re-render the scene
      renderer.render(scene, camera);
      // Sends the new position to all connected clients instantly
      clientMovement.send(0);
    };
    // End initControls
    return true;
  }

  // Sync Constructor -- TODO: long description
  function Sync(eventName, options) {
    // Save for chaining
    var self = this;
    // Data Container
    var syncData = {};
    // Conditionals
    var moveable = options.position !== undefined  && options.rotation !== undefined ? true : false;
    var ismessage = options.message !== undefined  && options.title !== undefined ? true : false;
    if(moveable){    
      syncData.rotation = options.rotation;
      syncData.position = options.position;
    }
    if(ismessage){
      syncData.title = options.title;
      syncData.message = options.message;
    }     
    // Event Emmiter
    self.send = function( timeout, ammendment ){
      // Timeout ( before sending data )
      timeout = typeof timeout === "number" ? timeout : 500;
      // Ammendment ( if data sent needs to be altered )
      if(typeof ammendment === "object" && syncData[ ammendment.name ] !== undefined){
        syncData[ ammendment.name ] = ammendment.message;
      }
      // Emit event
      setTimeout(function () {
        // Always send current client name ( This is important to distinguish event sources )
        syncData.name = $(clientName).html().split(':')[1];
        // Send modified syncData to the server to be sent to the client *** Security ***
        client.emit(eventName, syncData);
      }, timeout);
      // Return self for chaining
      return self;
    };

    self.enable = function () {
      // For Object Movement Syncing -- TODO: This can be improved...
      if (moveable) {
        // Enable reciever for movement event
        client.on(eventName, function (syncData) {
          if (syncData.name !== $(clientName).html().split(':')[1]) {
            // Set Orientation
            options.rotation.x = syncData.rotation.x;
            options.rotation.y = syncData.rotation.y;
            options.rotation.z = syncData.rotation.z;
            // Set Position
            options.position.x = syncData.position.x;
            options.position.y = syncData.position.y;
            options.position.z = syncData.position.z;
            renderer.render(scene, camera);
          }
        });
      }
      // Run callback if there is one, passing the syncData
      if ( typeof options.callback === "function" ) {
        client.on(eventName, function(syncData) {
          if(options.callback){
            options.callback(syncData);
          }
        });
      }
      // For chaining
      return self;
    };
    // More chaining
    return self;
  }
});
