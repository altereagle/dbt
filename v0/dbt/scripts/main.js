$(function(){
    // this is currently for mobile only
    window.ontouchmove = function(){ event.preventDefault(); }; // no overscroll
      
    var drawRate = 1; // The interval speed when drawing a line (touch move)
    var joystickSensitivity = 20;
    var tankShootDelay = 300;
    var tankpower = 0;
    var shootDistance = 1;
              
    var drawing     = false; // Changed to true when drawing a line
    var touching    = false; // Changed to true when touching the hotspot
    
    var touchX;     // X position when touch is detected
    var touchY;     // Y position when touch is detected
    var touchCount; // finger count when touch is detected
    
    var tankArmed = false;
    var tankCharging = false;
    var tankCharged = false;
    
    var tankMove = false;
    var tankMoveSpeed = 200;
    var tankAnimateType = 'swing'
    var tankMoveDirection;
    var tankShootDirection;
    var horizontal;
    var shootHorizontal;
    
    var controlHotspot = $('<div />')
            .attr('id', 'controlHotspot');
    var hotspot = $('<canvas />')               // Create hotspot as a canvas
            .attr('id', 'hotspot')              // Set the id
            .attr('width', "800px")   // IMPORTANT set the width
            .attr('height', "600px");// IMPORTANT set the height
            
    var touchArea = hotspot[0]; // This is the element itself w/o jQuery
    var canvas = touchArea.getContext("2d"); // This holds all canvas actions
      
    var debug = $('<div />')    // Create a debug box
            .attr('id', 'debug'); // Set the id
    
    var body = $('body') // Select the body
            .append(debug, controlHotspot, hotspot); // Add elements to the page
    
    function Tank(options){
        var color = (options.color != undefined) ? options.color : "#000";
        var startPosition = options.startPosition != undefined ? options.startPosition : "random";
        var tank = $('<div />')
                .addClass('tank')
                .css({
                    height: "75px",
                    width: "75px",
                    backgroundColor: color
                });
        var xPos = "12px";
        var yPos = "12px";
        
        if(startPosition === "top-left"){
            tank.css('top',yPos)
                .css('left', xPos);
        }
        if(startPosition === "top-right"){
            xPos = $(document).width() - 100;
            tank.css('top',yPos)
                .css('left', xPos);
        }
        
        $('body').append(tank);
        return tank;
    }
        
    var player1 = new Tank({
        color:"#f00",
        startPosition: "top-left"
    });
    
    function explosion(){
        controlHotspot.css({
            backgroundColor: "#fff",
            opacity: .5
        });
        setTimeout(function(){
            controlHotspot.css({
                backgroundColor: "",
                opacity: 1
            });
        }, 100)
    }
    
    function initControls() {
        var attack = $("<div />")
                .attr("id", "attackButton")
                .addClass("actionButton")
                .addClass("controls");
        var defend = $("<div />")
                .attr("id", "defendButton")
                .addClass("actionButton")
                .addClass("controls");
        
        attack[0].ontouchstart = function(event){
            tankArmed = true;
            var xPos = parseInt(player1.css('left'),10) + 20;
            var yPos = parseInt(player1.css('top'),10) + 35;
            
            var smoke = $('<div />')
                    .addClass('smoke');
                smoke.css({
                        top: yPos + 10,
                        left: xPos + 15, 
                        width: "10px",
                        height: "10px",
                        backgroundColor: "#f00"
                    });
            body.append(smoke);
        };
        
        attack[0].ontouchend = function (event) {
            var smoke = $('.smoke');
            
            explosion()
            
            smoke.show()
            smoke.css("backgroundColor", "#fff");
            smoke.css({
                top: (parseInt(smoke.css("top"),10) - 60) + "px",
                left: (parseInt(smoke.css("left"),10) - 50) + "px",
                height: "100px",
                width: "100px"
            }, 100);
            smoke.fadeOut(function(){
                setTimeout(function(){
                    smoke.remove();
                }, 100)
            });
            tankArmed = false;
        }
        
        defend[0].ontouchstart = function(event){
            controlHotspot.toggle();
        };
        
        controlHotspot[0].ontouchstart = function(event){
            touching = true;
            touchCount = event.touches.length;
            touchX = event.touches.item(0).clientX;
            touchY = event.touches.item(0).clientY;
            if(touchCount == 2){
                touchXshoot = event.touches.item(1).clientX;
                touchYshoot = event.touches.item(1).clientY;
            }
        };
        
        controlHotspot[0].ontouchmove = function(event){
            event.preventDefault();
            touchCount = event.touches.length;
            
            if(touchCount == 2 && tankArmed){
                tankMove = false;
                var xDirection = touchXshoot - event.touches.item(1).clientX;
                var yDirection = touchYshoot - event.touches.item(1).clientY;
                
                var yDifference = Math.abs(touchYshoot - event.touches.item(1).clientY);
                var xDifference = Math.abs(touchXshoot - event.touches.item(1).clientX);
                    shootHorizontal = (yDifference - xDifference) < 0 ? true : false;
                
                if((xDirection < 0) && shootHorizontal){
                    tankShootDirection = ["left", 100 * shootDistance, 0 * shootDistance];
                }
                if((xDirection >= 0) && shootHorizontal){
                    tankShootDirection = ["right", -100 * shootDistance, 0 * shootDistance];
                }
                if((yDirection < 0) && !shootHorizontal){
                    tankShootDirection = ["top", 0 * shootDistance, 100 * shootDistance];
                }
                if((yDirection >= 0) && !shootHorizontal){
                    tankShootDirection = ["top", 0 * shootDistance, -100 * shootDistance];
                }
                
            } else if (touchCount == 1 && !tankArmed){
                tankMove = true;
                var xDirection = touchX - event.touches.item(0).clientX;
                var yDirection = touchY - event.touches.item(0).clientY;
                
                var yDifference = Math.abs(touchY - event.touches.item(0).clientY);
                var xDifference = Math.abs(touchX - event.touches.item(0).clientX);
                    horizontal = (yDifference - xDifference) < 0 ? true : false;
                
                if((xDirection < 0) && horizontal){
                    tankMoveDirection = "right";
                }
                if((xDirection >= 0) && horizontal){
                    tankMoveDirection = "left";
                }
                if((yDirection < 0) && !horizontal){
                    tankMoveDirection = "down";
                }
                if((yDirection >= 0) && !horizontal){
                    tankMoveDirection = "up";
                }
            }
            
            touchX = event.touches.item(0).clientX;
            touchY = event.touches.item(0).clientY;
            
        };
        
        controlHotspot[0].ontouchend = function(event){
            touchCount = event.touches.length;
            if(tankMove && !tankArmed){
                if((tankMoveDirection == 'down') && !horizontal){
                    var move = parseInt(player1.css('top'),10) + 100
                    
                    player1.animate({
                        top: move
                    },tankMoveSpeed, tankAnimateType,function(){
                        player1.stop();
                    })
                }
                if((tankMoveDirection == 'up') && !horizontal){
                    var move = parseInt(player1.css('top'),10) - 100
                    
                    player1.animate({
                        top: move
                    },tankMoveSpeed, tankAnimateType,function(){
                        player1.stop();
                    })
                }
                if((tankMoveDirection == 'right') && horizontal){
                    var move = parseInt(player1.css('left'),10) + 100
                    
                    player1.animate({
                        left: move
                    },tankMoveSpeed, tankAnimateType,function(){
                        player1.stop();
                    })
                }
                if((tankMoveDirection == 'left') && horizontal){
                    var move = parseInt(player1.css('left'),10) - 100
                    
                    player1.animate({
                        left: move
                    },tankMoveSpeed, tankAnimateType,function(){
                        player1.stop();
                    })
                }
            }
            var smoke = $('.smoke')
            smoke.css("top", (parseInt(smoke.css("top"),10) + tankShootDirection[2]) + "px" );
            smoke.css("left", (parseInt(smoke.css("left"),10) + tankShootDirection[1]) + "px" );
            debug.html(tankShootDirection[1]);
        };
        
        body.append(attack, defend);
    }
    
    initControls();
    
    canvas.strokeStyle = '#000';
    canvas.lineWidth = 5;
    canvas.lineCap = 'round';
    canvas.lineJoin = 'round';
    
    function log() {
        debug.html('X:' + touchX + ' Y:' + touchY)
    }
    
    touchArea.ontouchstart = function(event){
            
        touching = true;
        touchCount = event.touches.length;
        touchX = event.touches.item(0).clientX;
        touchY = event.touches.item(0).clientY;
        
        canvas.beginPath();
        canvas.moveTo(touchX, touchY);
        
    };
    
    touchArea.ontouchmove = function(event){
        touching = true;
        if (drawing) return;
        
        setTimeout(function(){
            var lengthX = Math.abs(touchX - event.touches.item(0).clientX);
            var lengthY = Math.abs(touchY - event.touches.item(0).clientY);
            var length = Math.ceil(Math.sqrt(lengthX^2 + lengthY^2), 1);
            
            touchCount = event.touches.length;
            touchX = event.touches.item(0).clientX;
            touchY = event.touches.item(0).clientY;
            
            canvas.lineTo(touchX, touchY);
                        
            drawing = false;
            //log();
        }, drawRate)
        
        canvas.stroke();
        drawing = true;
    };
    
    touchArea.ontouchend = function(event){
        touching = false;
        touchCount = event.touches.length;
        
        canvas.stroke();
        canvas.closePath();
        canvas.save();
        //log();
    };
});