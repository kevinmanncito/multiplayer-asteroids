var Ufos = (function() {

  function create(image, spec, ufos, game) {
    var ufo = {
      image: image,
      size: spec.size,
      center: spec.center,
      direction: spec.direction,
      rotation: 0,
      speed: spec.speed,
      show: true,
      lastShotTime: 0
    }

    ufos.push(ufo);
  }

  function update($scope, elapsedTime) {

    var laserSpeed = 3,
        shotTime = 2,
        laserExpiration = 3,
        game = $scope.game;

    // Remove ufo if destroyed
    game.ufos.forEach(function (ufo, index) {
      if (!ufo.show) {
        game.ufos.splice(index, 1);
      }
    });

    game.ufos.forEach(function (ufo, index) {
      ufo.center.x += (elapsedTime * ufo.speed * ufo.direction.x);
      ufo.center.y += (elapsedTime * ufo.speed * ufo.direction.y);
      ufo.lastShotTime += elapsedTime;
      if (ufo.lastShotTime > shotTime) {
        console.log('shot laser');
        var slope = (game.player.pos.y - ufo.center.y)/(game.player.pos.x - ufo.center.x),
            dx = Math.cos(slope) * (laserSpeed+game.player.wave),
            dy = Math.sin(slope) * (laserSpeed+game.player.wave);

        game.ufoLasers.push({
          x: ufo.center.x,
          y: ufo.center.y,
          d: {x: dx, y: dy},
          duration: 0
        });
        ufo.lastShotTime = 0;

      }

      // This checks if a player laser hit a ufo
      $scope.game.lasers.forEach(function (laser, i) {
        if (laser.x > (ufo.center.x - ufo.size/2) && laser.x < (ufo.center.x + ufo.size/2)) {
          if (laser.y > (ufo.center.y - ufo.size/2) && laser.y < (ufo.center.y + ufo.size/2)) {
            console.log('hit ufo!');
            console.log(laser.x);
            console.log(laser.y);
            console.log(ufo.center.x);
            console.log(ufo.center.y);
            console.log(ufo.size);
            game.ufos.splice(index, 1);
            $scope.game.player.score += 30;
            for (var i = 0; i < 60; i++) {
              Particles.create($scope.smokeSpec, {x: laser.x, y: laser.y}, $scope.game.particles, 0);
              Particles.create($scope.fireSpec, {x: laser.x, y: laser.y}, $scope.game.particles, 0);
            }
            laser.duration = 5;
            $scope.socket.emit('ufo', $scope.game.ufos);
            $scope.socket.emit('particles', {});
          }
        }
      });
    });

    game.ufoLasers.forEach(function (laser, index) {
      if (laser.duration > laserExpiration) {
        game.ufoLasers.splice(index, 1);
      }
    });

    game.ufoLasers.forEach(function (laser, index) {
      laser.y += laser.d.y;
      laser.x += laser.d.x;
      laser.duration += elapsedTime;

      if (laser.x > canvas.width + 5) {
        laser.x = -4;
      } else if (laser.x < -canvas.width) {
        laser.x = canvas.width + 4;
      }

      if (laser.y > canvas.height + 5) {
        laser.y = -4;
      } else if (laser.y < -4) {
        laser.y = canvas.height + 4;
      }

      // This checks if a ufo laser hit the player
      if (laser.x < game.player.pos.x + 25 && laser.x > game.player.pos.x - 25) {
        if (laser.y < game.player.pos.y + 20 && laser.y > game.player.pos.y - 20) {
          console.log('hit player');
          for (var i = 0; i < 60; i++) {
            Particles.create($scope.smokeSpec, {x: laser.x, y: laser.y}, $scope.game.particles, 0);
            Particles.create($scope.fireSpec, {x: laser.x, y: laser.y}, $scope.game.particles, 0);
          }
          $scope.socket.emit('particles', {});
          game.player.lives--;
          $scope.$apply();
          $scope.socket.emit('lives', game.player.lives);
          if ($scope.game.player.lives > 0) {
            game.player.pos.x = 350;
            game.player.pos.y = 350;
            game.player.pos.r = 0;
            game.player.pos.d.x = 0;
            game.player.pos.d.y = 0;
          }
        }
      }

    });

  }

  return {
    create : create,
    update : update
  }

})();