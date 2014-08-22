angular.module('asteroids')

.controller('gameCtrl', ['$scope', '$http', function($scope, $http) {
  $scope.title = 'Choose a game type';
  $scope.hideForms = false;
  $scope.hideTitle = false;
  $scope.hideMessage = true;
  $scope.message = "Player found!";

  $scope.lastTimeStamp = performance.now();
  // CANVAS ELEMENTS
  $scope.canvas = document.getElementById('canvas');
  $scope.context = $scope.canvas.getContext('2d');
  $scope.backgroundCanvas = document.getElementById('background');
  $scope.backgroundCtx = $scope.backgroundCanvas.getContext('2d');
  $scope.backgroundImg = new Image();
  $scope.backgroundVelocity = 0;

  $scope.keyLeft = false, $scope.keyRight = false, $scope.keyUp = false, $scope.keyDown = false, $scope.keySpace = false, $scope.hyperspace = false;
  $scope.fire = 32;
  $scope.jump = 18; 
  $scope.rotateLeft = 37;
  $scope.rotateRight = 39;
  $scope.accelerate = 38;


  // CREATE OUR GAME OBJECT
  $scope.game = {
    player: {
      name: '',
      score: 0,
      wave: 1,
      lives: 3,
      image: new Image(),
      elapsedShotTime: 101
    },
    buddy: {
      name: 'Buddy',
      score: 0,
      wave: 1,
      lives: 3,
      image: new Image(),
      elapsedShotTime: 101
    },
    asteroidPic: [new Image(), new Image(), new Image()],
    lasers: [],
    buddyLasers: [],
    particles: [],
    ufos: [],
    ufoLasers: [],
    seenUfo: false
  };

  // PARTICLE OBJECTS
  var smokeImg = new Image();
  smokeImg.src = '/img/smoke.png';
  $scope.smokeSpec = {
    image: smokeImg,
    speed: {mean: 50, stdev: 25},
    lifetime: {mean: 1, stdev: 1}
  };

  var fireImg = new Image();
  fireImg.src = '/img/fire.png';
  $scope.fireSpec = {
    image: fireImg,
    speed: {mean: 50, stdev: 25},
    lifetime: {mean: 1, stdev: 1}
  };

  $scope.ufoImg1 = new Image();
  $scope.ufoImg1.src = '/img/plane_ufo_02_2_dark.png';

  $scope.ufoImg2 = new Image();
  $scope.ufoImg2.src = '/img/green_ufo_01_1.png';

  // IMAGE SOURCE PATHS
  $scope.game.player.image.src = '/img/ship-red.png';
  $scope.game.buddy.image.src = '/img/ship-blue.png';
  $scope.game.asteroidPic[2].src = '/img/large-asteroid.png';
  $scope.game.asteroidPic[1].src = '/img/medium-asteroid.png';
  $scope.game.asteroidPic[0].src = '/img/small-asteroid.png';

  // AUDIO SOURCES
  $scope.laserShot = new Audio('/sound/laser-1.mp3');
  $scope.explosion = new Audio('/sound/explosion-1.mp3');
  $scope.explosion2 = new Audio('/sound/explosion-2.mp3');

  // Create the connection to socket.io

  // development
  $scope.socket = io.connect('http://localhost:3000');

  // production
  // $scope.socket = io.connect('http://kevinrmann.com:3000');

  $scope.socket.on('sync', function(data) {
    console.log(data);
    console.log("RECIEVED START SIGNAL");
    if (data.length > 2){
      $scope.game.player.pos = data[0];
      $scope.game.buddy.pos = data[1];
      $scope.game.asteroids = data[2];
    }
    else {
      $scope.game.asteroids = data[0];
    }
    console.log($scope.game);

    document.onkeydown = keydown;
    document.onkeyup = keyup;
  });

  $scope.socket.on('start', function(data) {
    $scope.hideMessage = false;
    $scope.hideTitle = true;
    $scope.$apply();
    setTimeout(function () {
      $scope.message = "3";
      $scope.$apply();
    }, 1000);
    setTimeout(function () {
      $scope.message = "2";
      $scope.$apply();
    }, 2000);
    setTimeout(function () {
      $scope.message = "1";
      $scope.$apply();
    }, 3000);
    setTimeout(function () {
      $scope.message = "Go!";
      $scope.$apply();
    }, 4000);
    setTimeout(function () {
      $scope.hideMessage = true;
      $scope.$apply();
      requestAnimationFrame(gameLoop);
    }, 5000);
  });

  $scope.socket.on('startSingleMode', function(data) {
    $scope.hideMessage = false;
    $scope.hideTitle = true;
    $scope.$apply();
    setTimeout(function () {
      $scope.message = "3";
      $scope.$apply();
    }, 1000);
    setTimeout(function () {
      $scope.message = "2";
      $scope.$apply();
    }, 2000);
    setTimeout(function () {
      $scope.message = "1";
      $scope.$apply();
    }, 3000);
    setTimeout(function () {
      $scope.message = "Go!";
      $scope.$apply();
    }, 4000);
    setTimeout(function () {
      $scope.hideMessage = true;
      $scope.$apply();
      requestAnimationFrame(singleGameLoop);
    }, 5000);
  });

  $scope.socket.on('startWave', function(data) {
    $scope.game.seenUfo = false;
    $scope.game.ufos = [];
    $scope.game.player.wave = data;
    $scope.message = "Wave: " + String(data);
    $scope.hideMessage = false;
    $scope.$apply();
    setTimeout(function () {
      $scope.hideMessage = true;
      $scope.$apply();
    }, 2500);

  });

  $scope.socket.on('buddyUpdate', function(data) {
    $scope.game.buddy.pos = data.pos;
  });

  $scope.socket.on('lasers', function(data) {
    $scope.game.buddyLasers = data;
  });

  $scope.socket.on('createUfo', function(data) {
    if ($scope.game.player.wave%2 === 0) {
      console.log($scope.game.player.wave%2);
      console.log('created UFO!');
      Ufos.create($scope.ufoImg1, data, $scope.game.ufos, $scope.game);
    }
    else {
      console.log($scope.game.player.wave%2);
      console.log('created UFO!');
      Ufos.create($scope.ufoImg2, data, $scope.game.ufos, $scope.game);
    }
    $scope.game.seenUfo = true;
  });

  $scope.socket.on('lives', function(data) {
    $scope.game.buddy.lives = data;
  });

  $scope.socket.on('updateScore', function(data) {
    $scope.game.buddy.score = data;
  });

  $scope.socket.on('ufo', function(data) {
    $scope.game.ufos = data;
  });

  $scope.socket.on('removeAsteroid', function(data) {
    $scope.game.asteroids[data.id].show = false;
  });

  $scope.socket.on('addAsteroids', function(data) {
    $scope.game.asteroids.push(data.one);
    $scope.game.asteroids.push(data.two);
  });

  $scope.socket.on('particles', function(data) {
    Particles.create(
      $scope.fireSpec, 
      {x: $scope.game.buddy.pos.x, y: $scope.game.buddy.pos.y},
      $scope.game.particles,
      $scope.game.buddy.pos.r
    );
    Particles.create(
      $scope.smokeSpec, 
      {x: $scope.game.buddy.pos.x, y: $scope.game.buddy.pos.y},
      $scope.game.particles,
      $scope.game.buddy.pos.r
    );
  });

  $scope.init = function() {
    $scope.socket.emit('init', {
      name: $scope.game.player.name,
      game: $scope.game.name,
      asteroids: [],
      currentLevel: 1,
      singlePlayer: false
    });

    $scope.hideForms = true;
    $scope.title = "Finding player...";
  };

  function getUniqueName()
  {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 14; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  $scope.initSingle = function() {
    $scope.game.name = getUniqueName();
    $scope.game.player.name = $scope.game.singlePlayer.name;
    $scope.game.single = true;
    $scope.socket.emit('init', {
      name: $scope.game.singlePlayer.name,
      game: $scope.game.name,
      asteroids: [],
      currentLevel: 1,
      singlePlayer: true
    });
    $scope.game.buddy.changeTime = 0;
    $scope.game.buddy.key = 0;

    $scope.hideForms = true;
  };

  $scope.saveAccelerate = function($event) {
    $scope.accelerate = $event.which;
  }

  $scope.saveRotateLeft = function($event) {
    $scope.rotateLeft = $event.which;
  }

  $scope.saveRotateRight = function($event) {
    $scope.rotateRight = $event.which;
  }

  $scope.saveFire = function($event) {
    $scope.fire = $event.which;
  }

  $scope.saveHyperspace = function($event) {
    $scope.jump = $event.which;
  }

  keydown = function(e) {
    switch(e.keyCode) {
      case $scope.rotateLeft:
        e.preventDefault();
        $scope.keyLeft = true;
        break;
      case $scope.rotateRight:
        e.preventDefault();
        $scope.keyRight = true;
        break;
      case $scope.accelerate:
        e.preventDefault();
        $scope.keyUp = true;
        break;
      case 40: //down arrow
      case 83: // S
        e.preventDefault();
        $scope.keyDown = true;
        break;
      case $scope.fire:
        e.preventDefault();
        $scope.keySpace = true;
        break;
      case $scope.jump:
        e.preventDefault();
        $scope.hyperspace = true;
    }
  }

  keyup = function(e) {
    switch(e.keyCode) {
      case $scope.rotateLeft:
      $scope.keyLeft = false;
        break;
      case $scope.rotateRight:
        $scope.keyRight = false;
        break;
      case $scope.accelerate:
        $scope.keyUp = false;
        break;
      case 40: 
      case 83: 
        $scope.keyDown = false;
        break;
      case $scope.fire:
        $scope.keySpace = false;
        $scope.shooting = false;
        break;
      case $scope.jump:
        $scope.hyperspace = false;
        break;
    }
  }

  gameLoop = function(time) {
    elapsedTime = (time - $scope.lastTimeStamp) /1000;
    $scope.lastTimeStamp = time;

    Updater.update($scope, elapsedTime);
    Renderer.render($scope);
    if ($scope.game.player.lives > 0 || $scope.game.buddy.lives > 0) {
      requestAnimationFrame(gameLoop);
    } else {
      $scope.message = "Game Over";
      $scope.hideMessage = false;
      $scope.$apply();
      // Save stuff to the DB
      $http.post('/v1/high-scores', {name: $scope.game.player.name, score: $scope.game.player.score});
      $scope.socket.emit('gameover', {name: $scope.game.name});
    }
  }

  singleGameLoop = function(time) {
    elapsedTime = (time - $scope.lastTimeStamp) /1000;
    $scope.lastTimeStamp = time;

    Updater.singleUpdate($scope, elapsedTime);
    Renderer.render($scope);
    if ($scope.game.player.lives > 0 || $scope.game.buddy.lives > 0) {
      requestAnimationFrame(singleGameLoop);
    } else {
      $scope.message = "Game Over";
      $scope.hideMessage = false;
      $scope.$apply();
      // Save stuff to the DB
      $http.post('/v1/high-scores', {name: $scope.game.player.name, score: $scope.game.player.score});
      console.log("posted data");
    }
  }

}]);
