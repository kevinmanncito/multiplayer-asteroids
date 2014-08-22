var games = {},
    usePrevious = false,
    y2;

function nextGaussian(mean, stdDev) {
  if (usePrevious) {
      usePrevious = false;
      return mean + y2 * stdDev;
  }
  
  usePrevious = true;
  
  var x1 = 0,
      x2 = 0,
      y1 = 0,
      z  = 0;
  
  do {
    x1 = 2 * Math.random() - 1;
    x2 = 2 * Math.random() - 1;
    z = (x1 * x1) + (x2 * x2);
  } while (z >= 1);
  
  z = Math.sqrt((-2 * Math.log(z)) / z);
  y1 = x1 * z;
  y2 = x2 * z;
    
    return mean + y1 * stdDev;
}

function randomUfoSpec(wave) {
  var x = Math.floor((Math.random() * 2)),
      y = Math.floor((Math.random() * 2)),
      center = {x: 0, y: 0},
      direction = {x: 0.2, y: 0.3};
  if (x === 1)
    center.x = 900;
  if (y === 1)
    center.y = 600;
  if (x === 1)
    direction.x = -0.2;
  if (y === 1)
    direction.y = -0.3;
  return {
    size: nextGaussian((75-wave), 15),
    center: center,
    direction: direction,
    speed: nextGaussian((60+wave), 15)
  }
}

function random (max, min) {
  number =  Math.floor(Math.random() * (max - min + 1)) + min;
  if (number === 0) {
    number = 1;
  }
  return number;
};

function nextCircleVector() {
  var angle = Math.random() * 2 * Math.PI;
  return {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
}

function getAsteroids(level) {
  var numberOfAsteroids = level + 3,
      asteroids = [];

  for (var i = 0; i < numberOfAsteroids; i++){
    asteroids.push({
      pos: { x: random(0, -750), y: random(0, -750)},
      s: 2,
      speed: nextGaussian(100, 25),
      rot: nextGaussian(30, 15),
      dir: nextCircleVector(),
      show: true
    });
  }

  return asteroids;
};

module.exports = function(io) {

  io.sockets.on('connection', function(socket) {
    console.log("Someone has joind the game!");

    socket.on('init', function (data) {
      // check if game exists ? join : create

      // console.log(data);

      if (data.singlePlayer) {
        games[data.game] = data;
        var player1 = {x: 350, y: 350, r: 0, d: {x: 0, y: 0}};
        var player2 = {x: 600, y: 350, r: 0, d: {x: 0, y: 0}};
        var asteroids = getAsteroids(games[data.game].currentLevel);
        games[data.game].asteroids = asteroids;
        socket.emit('sync', [player1, player2, asteroids]); //send data to last player to join
        io.sockets.emit('startSingleMode');
      } 
      else {
        if (games.hasOwnProperty(data.game)) {
          var player1 = {x: 350, y: 350, r: 0, d: {x: 0, y: 0}};
          var player2 = {x: 600, y: 350, r: 0, d: {x: 0, y: 0}};
          var asteroids = getAsteroids(games[data.game].currentLevel);
          games[data.game].asteroids = asteroids;
          socket.emit('sync', [player1, player2, asteroids]); //send data to last player to join
          socket.broadcast.emit('sync', [player2, player1, asteroids]); //send game data to first player
          io.sockets.emit('start');
        }
        else {
          games[data.game] = data;
          console.log(games);
        }
      }

    });

    // Just pushes the update to the other player
    socket.on('buddyUpdate', function (data) {
      socket.broadcast.emit('buddyUpdate', data);
    });

    socket.on('lasers', function (data) {
      socket.broadcast.emit('lasers', data);
    });

    socket.on('particles', function(data) {
      socket.broadcast.emit('particles', data);
    });

    socket.on('lives', function(data) {
      socket.broadcast.emit('lives', data);
    });

    socket.on('updateScore', function(data) {
      socket.broadcast.emit('updateScore', data);
    });

    socket.on('ufo', function(data) {
      socket.broadcast.emit('ufo', data);
    });

    socket.on('gameover', function(data) {
      games = {};
    });

    socket.on('removeAsteroid', function(data){
      socket.broadcast.emit('removeAsteroid', {id: data.id});
      
      // Find which asteroid needs to be removed
      games[data.game].asteroids[data.id].show = false;
      if (data.s > 0) {
        var s = data.s - 1;
        var a1 = {
          pos: { x: data.x, y: data.y},
          s: s,
          speed: nextGaussian(100, 25),
          rot: nextGaussian(30, 15),
          dir: nextCircleVector(),
          show: true
        }
        var a2 = {
          pos: { x: data.x, y: data.y},
          s: s,
          speed: nextGaussian(100, 25),
          rot: nextGaussian(30, 15),
          dir: nextCircleVector(),
          show: true
        }
        io.sockets.emit('addAsteroids', {one: a1, two: a2});
        games[data.game].asteroids.push(a1);
        games[data.game].asteroids.push(a2);
      }
      // This checks if it is time to send a ufo
      if (games[data.game].asteroids.length > 10 && data.seenUfo === false) {
        io.sockets.emit('createUfo', randomUfoSpec(data.wave));
      }

      // This checks if all asteroids are gone and if
      // it is time to start a new level
      var allGone = true;
      for (var i = 0; i < games[data.game].asteroids.length; i++) {
        if (games[data.game].asteroids[i].show === true) {
          allGone = false;
        }
      }
      if (allGone) {
        var player1 = {x: 350, y: 350, r: 0, d: {x: 0, y: 0}};
        var player2 = {x: 600, y: 350, r: 0, d: {x: 0, y: 0}};
        games[data.game].currentLevel++;
        games[data.game].asteroids.length = 0;
        games[data.game].asteroids = getAsteroids(games[data.game].currentLevel);

        io.sockets.emit('sync', [games[data.game].asteroids]);
        io.sockets.emit('startWave', games[data.game].currentLevel);
      }

    });


  });
}










