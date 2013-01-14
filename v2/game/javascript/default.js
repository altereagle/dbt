var client = io.connect('http://108.161.128.208:4002');

$(function () {  
  var clientNames;
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

    var oldname = clientName.html().split(':')[1];;
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
    };
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
    pingBox.fadeTo(1000, .1);
  })
    .keypress(function (event) {
    if (event.which == 13) {
      event.preventDefault();

      client.emit('ping', {
        name: clientName.html(),
        message: pingBox.val()
      });

      pingBox.val('');
    }
  })
    .appendTo($('body'));

// Events

  var welcomeMessage = new Sync( 'Welcome', {
    title:'Welcome!',
    message: $(clientName).html().split(':')[1] + ' has connected',
    callback:function(syncData){
      clientCount.html(syncData.clients);
      if(syncData.clients) return;

      printMessage(syncData)
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


// Old Events

/*
  client.on('Send Player Count', function (player) {
    clientCount.html(player.count);

  client.on('ping', function (ping) {
    printMessage(ping, 3000);

  client.on('Update Player List', function (player) {
    clientNames = player.clientNames;
    clientCount.html(player.count);
*/

  function printMessage(syncData) {
    var delay = 4000;
    var message = syncData !== null && syncData !== undefined && syncData.message ? syncData.message : "no message";
    console.log(syncData);

    $('.newPing').animate({
      bottom: 300,
      opacity: .1
    }, 800);

    $('.oldPing').fadeOut(function () {
      $('.oldPing').remove();
    });

    var message = $('<div />')
      .attr('id', 'pingMessage')
      .addClass('newPing')
      .html(message)
      .appendTo($('body'));

    setTimeout(function () {
      message.addClass('oldPing');
      message.fadeOut(function () {
        message.remove()
      });
    }, delay);
  }

  // Render Graphics DOM Ready
  window.ontouchmove = function () {
    event.preventDefault();
  }; // No overscrolling on Touch Devices


  var camera, scene, renderer, projector; // Declare Camera Variables in empty f() global scope
  var plane, block; // Declare block Variables in empty f() global scope

  var touch = {
    x: null,
    y: null,
  };

  gameboardInit();
  blockControlsInit();
 
  // Event Syncing
  var clientMovement = new Sync( 'Sync Client Movement', block ).enable();

  function gameboardInit() { // Initilize Gameboard
    var cameraFieldOfView = 45, // Set Camera  field of view,
      aspectRatio = $(window).width() / $(window).height(), // Set aspect ratio,
      near = 1, // Set frustum near plane,
      far = 10000; // Set frustom far plane.

    var startPos = { // Set Camera Position
      z: 1000
    };

    // Object Settings

    var shapes = {
      sphere: new THREE.SphereGeometry($(window).width() / 8, 8, 8),
      cube: new THREE.CubeGeometry($(window).width() / 4, $(window).height() / 4, $(window).width() / 4)
    }

    var colors = {
      white: 0xFFFFFF,
      black: 0x000000,
      red: 0xFF0000,
      green: 0x00FF00,
      blue: 0x0000FF
    }

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

    // Scene Objects

    var light = new THREE.PointLight(colors.white);
    light.position.x = -600;
    light.position.y = 100;
    light.position.z = 450;
    light.intensity = 1;

    var pointLight = new THREE.PointLight(colors.white);
    pointLight.position.x = 600;
    pointLight.position.y = 100;
    pointLight.position.z = 450;
    pointLight.intensity = 1;

    camera = new THREE.PerspectiveCamera(cameraFieldOfView, aspectRatio, near, far); // Create a new Camera,
    camera.position.z = startPos.z; // Set camera z position

    block = new THREE.Mesh(shapes.sphere, textures.blank);

    scene = new THREE.Scene(); // Create a new Scene
    scene.add(block); // Add block to the new Scene
    scene.add(light);
    scene.add(pointLight);

    renderer = new THREE.CanvasRenderer(); // Create a Renderer to show the Scene
    renderer.setSize($(window).width(), $(window).height()); // Set the size of the Renderer
    rendererContainer = $('<div />').attr('id', 'renderer') // Create the renderer DOM object
    .append(renderer.domElement) // Add the Renderer to the Renderer DOM object
    .appendTo($('body')); // Add the Renderer DOM element to the Body

    projector = new THREE.Projector();


    animate();
    function animate() {
      requestAnimationFrame(animate);
      rotateCamera();
    }

      var radius = 600;
      var theta = 0;

    function rotateCamera() {
      TWEEN.update();

      theta += 0.1;

      camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
      camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
      camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta));
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }

    $(window).resize(function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
    });

    return true; // Return true
  }

  function blockControlsInit() {
    renderer.render(scene, camera);

    var gameboard = rendererContainer[0];

    gameboard.ontouchmove = function (event) {

      touch.x = event.touches.item(0).clientX;
      touch.y = event.touches.item(0).clientY;

      if (event.touches.item(0)) {
        block.rotation.x += .05;

        block.position.y = rendererContainer.height( )/2 - touch.y;
        block.position.x = touch.x - rendererContainer.width( )/2;
      }

      if (event.touches.item(1)) {
        event.preventDefault();
        block.rotation.y += .05;
      }

      if (event.touches.item(2)) {
        event.preventDefault();
        block.rotation.z += .05;
      }

      if (event.touches.item(3)) {
        event.preventDefault();
        block.rotation.z += .05;
      }

      renderer.render(scene, camera);
      clientMovement.send();
    };

    gameboard.onmousemove = function (event) {
      touch.x = event.clientX;
      touch.y = event.clientY;

      block.position.y = rendererContainer.height()/2 - touch.y;
      block.position.x = touch.x - rendererContainer.width()/2;
      block.rotation.x += .03;
      block.rotation.y += .02;
      block.rotation.z += .01;

      renderer.render(scene, camera);
      clientMovement.send(10);
    };

    gameboard.onmousedown = function (event) {
      var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
      projector.unprojectVector(vector, camera);
      var raycaster = new THREE.Raycaster(camera.position, vector.subSelf(camera.position).normalize());
      var intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        console.log(intersects[0].object);
        intersects[0].object.rotation.x = 0;
        intersects[0].object.rotation.y = 0;
        intersects[0].object.rotation.z = 0;
      }

      renderer.render(scene, camera);
      clientMovement.send();
    };

    gameboard.ontouchend = function (event) {
      block.position.x = 0;
      block.position.y = 0;
      block.position.z = 0;

      renderer.render(scene, camera);     
      clientMovement.send();
    }
  }

  function Sync(eventName, syncObject) {
    var self = this;
    var syncData = {};
    
    var moveable = syncObject.position !== undefined  && syncObject.rotation !== undefined ? true : false;
    var ismessage = syncObject.message !== undefined  && syncObject.title !== undefined ? true : false;
      
    if(moveable){    
     // syncData.name = $(clientName).html().split(':')[1];
      syncData.rotation = syncObject.rotation,
      syncData.position = syncObject.position
    };
      
    if(ismessage){
      syncData.title = syncObject.title,
      syncData.message = syncObject.message
    //syncData.callback = syncObject.callback
    };     
    
    self.send = function( timeout, ammendment ){
      timeout = typeof timeout === "number" ? timeout : 500; // Default timeout to send event
      if(typeof ammendment === "object" && syncData[ ammendment.name ] !== undefined){
        syncData[ ammendment.name ] = ammendment.message
      }

      setTimeout(function () {
        syncData.name = $(clientName).html().split(':')[1]; // Important for moving on one screen only
        client.emit(eventName, syncData);
      }, timeout);

      return self;
    };

    self.enable = function () {
      if (moveable) {
        client.on(eventName, function (syncData) {
          if (syncData.name !== $(clientName).html().split(':')[1]) {
            syncObject.rotation.x = syncData.rotation.x;
            syncObject.rotation.y = syncData.rotation.y;
            syncObject.rotation.z = syncData.rotation.z;
            
            syncObject.position.x = syncData.position.x;
            syncObject.position.y = syncData.position.y;
            syncObject.position.z = syncData.position.z;

            renderer.render(scene, camera);
          }
        });
      }

     if ( typeof syncObject.callback === "function" ) {
       client.on(eventName, function(syncData) {
         if(syncObject.callback){
           syncObject.callback(syncData);
         }
       });
     }

      return self;
    };

    this.off = function () {
     if ( !validObj ) return;
    };

    return self;
  }

});
