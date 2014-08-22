var Calc = (function() {
    var  usePrevious = false,
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
  };

  function thrustCircleVector(angle) {
    // var angle = Math.random() * Math.PI;
    angle = nextGaussian(angle, Math.PI/6);
    return {
      x: -Math.cos(angle),
      y: -Math.sin(angle)
    };
  };

  return {
    nextGaussian : nextGaussian,
    random : random,
    nextCircleVector : nextCircleVector,
    thrustCircleVector : thrustCircleVector
  }

})();