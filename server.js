var express  = require('express'),
    app      = express(),
    server   = require('http').createServer(app),
    io       = require('socket.io').listen(server),
    path     = require('path'),
    mongoose = require('mongoose'),
    database = require('./config/database'),

    // Custom modules
    game     = require('./app/game');


//configurations
mongoose.connect(database.url);


// all environments
app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.use(express.static(__dirname + '/public'));         // set the static files location /public/img will be /img for users
  app.use(express.logger('dev'));                         // log every request to the console
  app.use(express.bodyParser());                          // pull information from html in POST
  app.use(express.methodOverride());                      // simulate DELETE and PUT
});

// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://kevinrmann.com/');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  // res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// routes
require('./app/routes')(app);
game.logSomething();
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// socket connections
io.set('transports', ['websocket', 'xhr-polling', 'htmlfile']);
io.set('log level', 2);
require('./app/socket')(io);

// listen
// ------------------------------------------------------------
server.listen(app.get('port'), function(){
  console.log('Getting jiggy on port: ' + app.get('port'));
});
// ------------------------------------------------------------

// app.listen(app.get('port'));
// console.log('Gettin jiggy on port: ' + app.get('port'));
exports = module.exports = app;
