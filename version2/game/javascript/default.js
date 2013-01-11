var client = io.connect('http://108.161.128.208:1111');

$(function () {
  var clientNames;
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

    var oldname = clientName.html();
    var name = prompt('Change your Alias', clientName.html().split(':')[1]);
    if (name !== null && name !== navigator.platform && name !== 'noname' && name !== '' && name !== clientName.html().split(':')[1]) {
      clientName.html(navigator.platform + ":" + name);

      client.emit('Client Alias Changed', {
        name: (clientName.html().split(":")[1]),
        message: oldname
      });
    } else {
      printMessage({
        name: 'server',
        message: 'Sorry, bad name, try something else'
      }, 4000);
    };
  })
    .appendTo($('body'));

  var pingBox = $('<input />')
    .attr('id', 'pingBox')
    .addClass('ui')
    .val('send message!')
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

  client.on('welcome', function (player) {
    printMessage(player, 1000);

    client.emit('Get Client Count', {
      name: clientName.html(),
      message: 'Get Client Count'
    });
  });

  client.on('Send Player Count', function (player) {
    printMessage(player, 1000);
    clientCount.html(player.count);
  });

  client.on('ping', function (ping) {
    printMessage(ping, 3000);
  });

  client.on('Update Player List', function (player) {
    printMessage({
      name: "server",
      message: player.message.split(":")[1] + " &#62;&#62;&#62; " + player.name
    }, 4000);
    clientNames = player.clientNames;
    console.log(clientNames);

    clientCount.html(player.count);
  });

  client.on('disconnected', function (player) {
    printMessage(player, 1000);
    clientCount.html(player.count);
    console.log(player.count);
  });

  function printMessage(player, delay) {
    console.log(player.message);

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
      .html(player.name + "# " + player.message)
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
  syncClientRotation();
  syncClientCameras();

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

        //block.position.y = rendererContainer.height( )/2 - touch.y;
        //block.position.x = touch.x - rendererContainer.width( )/2;
      }

      if (event.touches.item(1)) {
        event.preventDefault();
        block.rotation.y += .05;

        //block.position.x = 0;
        //block.position.y = 0;
        //block.position.z = 100;
      }

      if (event.touches.item(2)) {
        event.preventDefault();
        block.rotation.z += .05;

        //block.position.x = 0;
        //block.position.y = 0;
        //block.position.z = 100;
      }

      if (event.touches.item(3)) {
        event.preventDefault();
        block.rotation.z += .05;
      }

      renderer.render(scene, camera);

      var syncDelay = 1000 // milliseconds
      setTimeout(function () {
        client.emit('Sync Client Movement', {
          rx: block.rotation.x,
          ry: block.rotation.y,
          rz: block.rotation.z,
          px: block.position.x,
          py: block.position.y,
          pz: block.position.z,
          name: $(clientName).html().split(':')[1]
        });
      }, syncDelay);

    };


    gameboard.onmousemove = function (event) {
      touch.x = event.clientX;
      touch.y = event.clientY;

      //block.position.y = rendererContainer.height()/2 - touch.y;
      //block.position.x = touch.x - rendererContainer.width()/2;
      block.rotation.x += .03;
      block.rotation.y += .02;
      block.rotation.z += .01;

      renderer.render(scene, camera);


      client.on('Sync Client Movement', function (playerblock) {
        if (playerblock.name !== $(clientName).html().split(':')[1]) {
          block.rotation.x = playerblock.rx;
          block.rotation.y = playerblock.ry;
          block.rotation.z = playerblock.rz;
          block.position.x = playerblock.px;
          block.position.y = playerblock.py;
          block.position.z = playerblock.pz;
          renderer.render(scene, camera);
        }
      });
      var syncDelay = 1000 // milliseconds
      setTimeout(function () {
        client.emit("Sync Client Movement", {
          rx: block.rotation.x,
          ry: block.rotation.y,
          rz: block.rotation.z,
          px: block.position.x,
          py: block.position.y,
          pz: block.position.z,
          name: $(clientName).html().split(':')[1]
        });
      }, syncDelay);
    };

    gameboard.onclick = function (event) {
      //block.rotation.x = 0;
      //block.rotation.y = 0;
      //block.rotation.z = 0;

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
    };

    gameboard.ontouchend = function (event) {
      block.position.x = 0;
      block.position.y = 0;
      block.position.z = 0;
      renderer.render(scene, camera);
    }
  }

  function Sync(eventName, syncObject) {
    var self = this;
    var validObj = syncObject.position && syncObject.rotation ? true : false;

    this.send = function (timeout) {
      if (!validObj) return;

      timeout = typeof timeout === "number" ? timeout : 1000; // Default poll time is 1 second

      setTimeout(function () {
        client.emit(eventName, {
          px: syncObject.position.x,
          py: syncObject.position.y,
          pz: syncObject.position.z,
          rx: syncObject.rotation.x,
          ry: syncObject.rotation.y,
          rz: syncObject.rotation.z,
          name: $(clientName).html().split(':')[1]
        });
      }, timeout);

      return self;
    };

    this.recieve = function () {
      if (!validObj) return;

      if (syncObject.position && syncObject.rotation) {
        client.on(eventName, function (data) {
          if (data.name !== $(clientName).html().split(':')[1]) {
            syncObject.rotation.x = data.rx;
            syncObject.rotation.y = data.ry;
            syncObject.rotation.z = data.rz;
            syncObject.position.x = data.px;
            syncObject.position.y = data.py;
            syncObject.position.z = data.pz;

            renderer.render(scene, camera);
          }
        });
      }

      return self;
    };

  }

  function syncClientCameras() {
    // Sync Client Camera Position every 2 seconds
    setTimeout(function () {
      client.emit("Sync Client Camera Position", {
        rx: camera.rotation.x,
        ry: camera.rotation.y,
        rz: camera.rotation.z,
        px: camera.position.x,
        py: camera.position.y,
        pz: camera.position.z,
        name: $(clientName).html().split(':')[1]
      });
    }, 2000);

    client.on('Sync Client Camera Position', function (cam) {
      camera.rotation.x = cam.rx;
      camera.rotation.y = cam.ry;
      camera.rotation.z = cam.rz;
      camera.position.x = cam.px;
      camera.position.y = cam.py;
      camera.position.z = cam.pz;
    });


  }
});