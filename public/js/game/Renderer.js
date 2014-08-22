var Renderer = (function() {

  function drawShip(context, player, velocity) {
    context.save();
    context.translate(player.pos.x, player.pos.y);
    context.rotate(player.pos.r);
    context.drawImage(player.image, -20, -25, 50, 40);
    context.restore();
  }

  function drawBackground(context, background, velocity) {
    context.drawImage(background, velocity, 0);
    context.drawImage(background,velocity + 1600, 0);
  }

  function drawAsteroid(context, asteroid, asteroidImg) {
    context.save();
    context.translate(asteroid.pos.x , asteroid.pos.y);
    context.rotate(asteroid.rot * (Math.PI/180));
    context.drawImage(asteroidImg, - (asteroidImg.width/2),  - (asteroidImg.height/2));
    context.restore();
  }

  function drawLaser(context, laser) {
    context.save();
    context.translate(laser.x, laser.y);
    context.rotate(laser.r)
    context.beginPath();
    context.strokeStyle = "#FF0000";
    context.lineWidth = 2;
    context.arc(25, -5, 5,0,2*Math.PI);
    context.stroke();
    context.closePath();
    context.restore();
  }

  // A generic drawImage function from Dr. Mathias
  function drawImage(context, spec) {
    context.save();
    
    context.translate(spec.center.x, spec.center.y);
    context.rotate(spec.shipsRot);
    context.drawImage(
      spec.image, 
      -30, 
      -spec.size,
      spec.size, spec.size);
    
    context.restore();
  }

  function drawUfo(context, spec) {
    context.save();
    context.translate(spec.center.x , spec.center.y);
    context.rotate(spec.rotation * (Math.PI/180));
    context.drawImage(spec.image, - (spec.image.width/2),  - (spec.image.height/2));
    context.restore();
  }

  function render($scope) {
    $scope.canvas.width = $scope.canvas.width;
    var game = $scope.game;

    if ($scope.game.player.lives > 0) {
      drawShip($scope.context, game.player);
    }
    if ($scope.game.buddy.lives > 0) {
      drawShip($scope.context, game.buddy);
    }

    game.lasers.forEach(function (laser, index) {
      drawLaser($scope.context, laser);
    });

    game.buddyLasers.forEach(function (laser, index) {
      drawLaser($scope.context, laser);
    });

    game.ufoLasers.forEach(function (laser, index) {
      drawLaser($scope.context, laser);
    });

    game.asteroids.forEach(function (asteroid, index){
      if (asteroid.show)
        drawAsteroid($scope.context, asteroid, game.asteroidPic[asteroid.s]);
    });

    game.ufos.forEach(function (ufo, index) {
      if (ufo.show) {
        drawUfo($scope.context, ufo);
      }
    });

    Particles.render($scope.game.particles, $scope.context, drawImage);
  }

  return {
    render : render,
    drawShip : drawShip,
    drawImage: drawImage,
  };

})();