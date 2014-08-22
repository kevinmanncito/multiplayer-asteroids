// big asteroid is 145 x 145
// ship 50 x 40
var Updater = (function() {

  function updateLasers(canvas, lasers, elapsedTime, $scope, player) {
    
    var laserSpeed = 10,
        shotTime = 0.5,
        laserExpiration = 3;
    
    // Check if its time to fire and fire button is being pressed
    if ($scope.keySpace && player.elapsedShotTime > shotTime && player.lives > 0) {

      $scope.laserShot.play(); // Play laser sound

      var dx = Math.cos(player.pos.r) * laserSpeed,
          dy = Math.sin(player.pos.r) * laserSpeed;

      var laser = {
        x: player.pos.x, 
        y: player.pos.y, 
        r: player.pos.r, 
        d: {x: dx, y: dy},
        duration: 0
      };
      lasers.push(
        laser
      );
      $scope.socket.emit('lasers', lasers);

      player.elapsedShotTime = 0;
    }

    player.elapsedShotTime += elapsedTime;

    lasers.forEach(function (laser, index) {
      if (laser.duration > laserExpiration) {
        lasers.splice(index, 1);
      }
    });

    lasers.forEach(function (laser, index) {
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
    });
  }

  function updateUfos($scope, elapsedTime) {
    Ufos.update($scope, elapsedTime);
  }

  function updateAsteroids($scope, canvas, asteroids, elapsedTime, playerPos, images, lasers, score) {
    asteroids.forEach(function (asteroid, aindex) {
      if(asteroid.show){
        asteroid.pos.y += (elapsedTime * asteroid.speed * asteroid.dir.y);
        asteroid.pos.x += (elapsedTime * asteroid.speed * asteroid.dir.x);

        asteroid.rot += asteroid.speed / 500;

        // move asteroid when it goes off screen
        if (asteroid.pos.x > canvas.width + (images[asteroid.s]).width)
          asteroid.pos.x = -(images[asteroid.s]).width + 1;
        else if (asteroid.pos.x < -(images[asteroid.s]).width)
          asteroid.pos.x = canvas.width + (images[asteroid.s]).width -1;

        if (asteroid.pos.y > canvas.height + (images[asteroid.s]).height)
          asteroid.pos.y = -(images[asteroid.s]).height + 1;
        else if (asteroid.pos.y < -(images[asteroid.s]).height)
          asteroid.pos.y = canvas.height + (images[asteroid.s]).height -1;

        // CHECK FOR COLLISION WITH SHIP
        if (playerPos.x < asteroid.pos.x + (images[asteroid.s].width)/2  && playerPos.x > asteroid.pos.x - (images[asteroid.s].width)/2){
          if(playerPos.y < asteroid.pos.y + (images[asteroid.s].height)/2  && playerPos.y > asteroid.pos.y - (images[asteroid.s].height)/2){ 
            //collision detected!
            // Do some explosion particles
            for (var i = 0; i < 60; i++) {
              Particles.create($scope.fireSpec, {x: playerPos.x, y: playerPos.y}, $scope.game.particles, 0);
              Particles.create($scope.smokeSpec, {x: playerPos.x, y: playerPos.y}, $scope.game.particles, 0);
            }
            $scope.game.player.lives--;
            $scope.$apply();
            $scope.socket.emit('lives', $scope.game.player.lives);
            if ($scope.game.player.lives > 0) {
              playerPos.x = 350;
              playerPos.y = 350;
              playerPos.r = 0;
              playerPos.d.x = 0;
              playerPos.d.y = 0;
            }
          }
        }

        // Collision with ufo
        $scope.game.ufos.forEach(function (ufo, i) {
          if (ufo.center.x < asteroid.pos.x + (images[asteroid.s].width)/2  && ufo.center.x > asteroid.pos.x - (images[asteroid.s].width)/2) {
            if (ufo.center.y < asteroid.pos.y + (images[asteroid.s].width)/2  && ufo.center.y > asteroid.pos.y - (images[asteroid.s].width)/2) {
              console.log('asteroid hit ufo');
              for (var i = 0; i < 60; i++) {
                Particles.create($scope.fireSpec, {x: ufo.center.x, y: ufo.center.y}, $scope.game.particles, 0);
                Particles.create($scope.smokeSpec, {x: ufo.center.x, y: ufo.center.y}, $scope.game.particles, 0);
              }
              ufo.show = false;
            }
          }

        });

        if ($scope.game.single) {
          if ($scope.game.buddy.pos.x < asteroid.pos.x + (images[asteroid.s].width)/2  && $scope.game.buddy.pos.x > asteroid.pos.x - (images[asteroid.s].width)/2){
          if($scope.game.buddy.pos.y < asteroid.pos.y + (images[asteroid.s].height)/2  && $scope.game.buddy.pos.y > asteroid.pos.y - (images[asteroid.s].height)/2){ 
            //collision detected!
            // Do some explosion particles
            for (var i = 0; i < 60; i++) {
              Particles.create($scope.fireSpec, {x: $scope.game.buddy.pos.x, y: $scope.game.buddy.pos.y}, $scope.game.particles, 0);
              Particles.create($scope.smokeSpec, {x: $scope.game.buddy.pos.x, y: $scope.game.buddy.pos.y}, $scope.game.particles, 0);
            }
            $scope.game.buddy.lives--;
            $scope.$apply();
            if ($scope.game.buddy.lives > 0) {
              $scope.game.buddy.pos.x = 350;
              $scope.game.buddy.pos.y = 350;
              $scope.game.buddy.pos.r = 0;
              $scope.game.buddy.pos.d.x = 0;
              $scope.game.buddy.pos.d.y = 0;
            }
          }
        }
        }

        lasers.forEach(function (laser, lindex) {
          if (laser.x < asteroid.pos.x + (images[asteroid.s].width)/2  && laser.x > asteroid.pos.x - (images[asteroid.s].width)/2){
            if(laser.y < asteroid.pos.y + (images[asteroid.s].height)/2  && laser.y > asteroid.pos.y - (images[asteroid.s].height)/2){ 
              
              // Do some explosion particles right where the laser hit
              for (var i = 0; i < 30; i++) {
                Particles.create($scope.smokeSpec, {x: laser.x, y: laser.y}, $scope.game.particles, 0);
              }
              // collision detected!
              updateScore($scope,asteroid.s);
              $scope.explosion.play();

              lasers.splice(lindex, 1);
              $scope.socket.emit('lasers', lasers);

              $scope.socket.emit('removeAsteroid', {id: aindex, 
                                                    x: asteroid.pos.x, 
                                                    y: asteroid.pos.y, 
                                                    s: asteroid.s, 
                                                    game: $scope.game.name,
                                                    seenUfo: $scope.game.seenUfo,
                                                    wave: $scope.game.player.wave});
              asteroid.show = false;
            }
          }
        });
      }
    });
  }

  function updateShipMovement(playerPos, $scope, asteroids, images, elapsedTime) {
    if ($scope.keyLeft) {
      playerPos.r -= .07;
    }
    if ($scope.keyRight) {
      playerPos.r += .07;
    }
    if($scope.keyUp) {
      playerPos.d.x += Math.cos(playerPos.r) * .1;
      playerPos.d.y += Math.sin(playerPos.r) * .1;
      Particles.create($scope.smokeSpec, {x: playerPos.x, y: playerPos.y}, $scope.game.particles, playerPos.r);
      Particles.create($scope.fireSpec, {x: playerPos.x, y: playerPos.y}, $scope.game.particles, playerPos.r);
      var p = $scope.game.particles;
      // console.log(p)
      $scope.socket.emit('particles', {});
    }
    if($scope.hyperspace) {
      for (var i = 0; i < 30; i++) {
        Particles.create($scope.smokeSpec, {x: playerPos.x, y: playerPos.y}, $scope.game.particles, playerPos.r);
      }
      hyperspace(playerPos, $scope, asteroids, images);
    }

    playerPos.x += playerPos.d.x;
    playerPos.y += playerPos.d.y;

    if (playerPos.x > $scope.canvas.width)
        playerPos.x = 0;
    else if (playerPos.x < 0)
        playerPos.x = $scope.canvas.width;

    if (playerPos.y > $scope.canvas.height)
        playerPos.y = 0;
    else if (playerPos.y < 0)
        playerPos.y = $scope.canvas.height;
  }

  function updateParticles(particles, elapsedTime) {
    Particles.update(particles, elapsedTime);
  }

  function update ($scope, elapsedTime) {
    updateAsteroids($scope, $scope.canvas, $scope.game.asteroids, elapsedTime, $scope.game.player.pos, $scope.game.asteroidPic, $scope.game.lasers, $scope.game.player.score);
    
    if ($scope.game.player.lives > 0) {
      updateShipMovement($scope.game.player.pos, $scope, $scope.game.asteroids, $scope.game.asteroidPic, elapsedTime);
      updateLasers($scope.canvas, $scope.game.lasers, elapsedTime, $scope, $scope.game.player);
    } else {
      $scope.game.player.lives = 0;
      $scope.$apply();
    }

    updateLasers($scope.canvas, $scope.game.buddyLasers, elapsedTime, $scope, $scope.game.player);

    updateParticles($scope.game.particles, elapsedTime);
    updateUfos($scope, elapsedTime);

    $scope.socket.emit('buddyUpdate', {pos: $scope.game.player.pos});
  }

  function rotate (degrees) {
    this.r += degrees;
    this.dir.set(Math.sin(this.rot), -Math.cos(this.rot));
  }

  function accelerate() {
    this.travel.add(this.dir.mult(.2));
    var particlePos = this.pos.clone();
    particlePos.add(this.dir.unit().mult(-10));
  }

  function updateScore($scope,asteroid) {
    if(asteroid === 0) { 
      $scope.game.player.score += 15;      
    }
    if(asteroid === 1) {
      $scope.game.player.score += 10;
    }
    if(asteroid === 2) {
      $scope.game.player.score += 5;
    }
    $scope.$apply();
    $scope.socket.emit('updateScore', $scope.game.player.score);
  }

  function updateBackground($scope) {
    if(Math.abs($scope.backgroundVelocity) > $scope.backgroundImg.width) {
      $scope.backgroundVelocity = 0;
    }
    $scope.backgroundVelocity -= 2;
  }

  function hyperspace(playerPosition, $scope, asteroids, images) {
    var unsafe = true;
    var tempX = ~~(Math.random() * $scope.canvas.width);
    var tempY = ~~(Math.random() * $scope.canvas.height);

    $scope.game.asteroids.forEach(function (asteroid, aindex) {
      if (tempX < asteroid.pos.x + 20  && tempX > asteroid.pos.x - 20){
        if(tempY < asteroid.pos.y + 25  && tempY > asteroid.pos.y - 25){ 
          //collision detected!
          // position is not  safe! pick a new random
          tempX = ~~(Math.random() * $scope.canvas.width);
          tempY = ~~(Math.random() * $scope.canvas.height);
        }
      }
      else {
        playerPosition.x = tempX;
        playerPosition.y = tempY;
        playerPosition.d = {x: 0, y: 0};
        $scope.hyperspace = false;
        unsafe = false;
      }
    });
  }


//----------------------------------------------
//  AI AI AI AI AI AI AI AI AI AI AI AI AI AI ||
//----------------------------------------------

  function updateAILasers(canvas, lasers, elapsedTime, $scope, player) {
    
    var laserSpeed = 10,
        shotTime = 0.5,
        laserExpiration = 3;
    
    // When to have AI fire weapon
    var rand = Calc.random(0, 9);

    if (player.elapsedShotTime > shotTime && rand == 1) {

      $scope.laserShot.play(); // Play laser sound

      var dx = Math.cos(player.pos.r) * laserSpeed,
          dy = Math.sin(player.pos.r) * laserSpeed;

      var laser = {
        x: player.pos.x, 
        y: player.pos.y, 
        r: player.pos.r, 
        d: {x: dx, y: dy},
        duration: 0
      };
      lasers.push(
        laser
      );
      // $scope.socket.emit('lasers', laser);

      player.elapsedShotTime = 0;
    }

    player.elapsedShotTime += elapsedTime;
  }

  function updateAIShipMovement(playerPos, $scope, elapsedTime) {
    // get a new direction:

    $scope.game.buddy.changeTime += elapsedTime;

    if ($scope.game.buddy.changeTime > 1){
      var rand = Calc.random(0,4);
      // console.log(rand)
      if (rand == 1)
        $scope.game.buddy.key = 1;
      if (rand == 2)
        $scope.game.buddy.key = 2;
      if (rand == 3)
        $scope.game.buddy.key = 3;
      $scope.game.buddy.changeTime = 0;
    }


    // $scope.game.asteroids.forEach(function (asteroid, index) {
    //   if (asteroid.show){
    //     killThisAsteroid = asteroid;
    //   }
    // });
    // if (killThisAsteroid){
    //   if (killThisAsteroid.pos.y > playerPos.y) {
    //     if (killThisAsteroid.pos.x > playerPos.x) {
    //       //Q1
    //       if (playerPos.r >= 0 && playerPos.r <= Math.PI/2)
    //         right = true;
    //       else 
    //         left = true
    //     }
    //     else {
    //       //Q2
    //       if (playerPos.r >= Math.PI/2 && playerPos.r <= Math.PI)
    //         left = true;
    //     }
    //   }
    //   else {
    //     if (killThisAsteroid.pos.x > playerPos.x) {
    //       //Q4
    //       if (playerPos.r >= (Math.PI * 2)/3 && playerPos.r <= Math.PI * 2)
    //         left = true;
    //       else
    //         right = true;
    //     }
    //     else {
    //       //Q3
    //       if (playerPos.r >= Math.PI && playerPos.r <= (Math.PI * 2)/3)
    //         right = true;
    //     }
    //   }
      // Turn right
      if ($scope.game.buddy.key == 1) {
          playerPos.r -= .07;
      }
      // Turn Left
      if ($scope.game.buddy.key == 2) {
          playerPos.r += .07;
      }
      // Acceleration
      if((playerPos.d.x < 2) && (playerPos.d.x > -2)){
        if ($scope.game.buddy.key == 3) {
          playerPos.d.x += Math.cos(playerPos.r) * .1;
          playerPos.d.y += Math.sin(playerPos.r) * .1;
          Particles.create($scope.smokeSpec, {x: playerPos.x, y: playerPos.y}, $scope.game.particles, playerPos.r);
          Particles.create($scope.fireSpec, {x: playerPos.x, y: playerPos.y}, $scope.game.particles, playerPos.r);
          var p = $scope.game.particles;
          // console.log(p)
          $scope.socket.emit('particles', {});
        }
      }
    // } // end of ai  now just update accordingly
    playerPos.x += playerPos.d.x;
    playerPos.y += playerPos.d.y;

    if (playerPos.x > $scope.canvas.width)
        playerPos.x = 0;
    else if (playerPos.x < 0)
        playerPos.x = $scope.canvas.width;

    if (playerPos.y > $scope.canvas.height)
        playerPos.y = 0;
    else if (playerPos.y < 0)
        playerPos.y = $scope.canvas.height;
  }

  function singleUpdate ($scope, elapsedTime) {
    updateAsteroids($scope, $scope.canvas, $scope.game.asteroids, elapsedTime, 
      $scope.game.player.pos, $scope.game.asteroidPic, $scope.game.lasers, $scope.game.player.score);

    if ($scope.game.player.lives > 0) {
      updateShipMovement($scope.game.player.pos, $scope, elapsedTime);
    } else {
      $scope.game.player.lives = 0;
      $scope.$apply();
    }
    updateLasers($scope.canvas, $scope.game.lasers, elapsedTime, $scope, $scope.game.player);
    
    updateAIShipMovement($scope.game.buddy.pos, $scope, elapsedTime);

    updateUfos($scope, elapsedTime);
    updateAILasers($scope.canvas, $scope.game.lasers, elapsedTime, $scope, $scope.game.buddy);

    updateParticles($scope.game.particles, elapsedTime);

  }

  return {
    update : update,
    singleUpdate : singleUpdate,
    rotate : rotate,
    accelerate : accelerate,
    hyperspace : hyperspace
  };

})();