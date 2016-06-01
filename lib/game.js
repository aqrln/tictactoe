const stringid = require('./stringid');

var server = null;

var games = {};

function attach(httpServer) {
  server = httpServer;

  server.register('/game/new', newGameHandler);
  server.register('/game/<id>', gamePageHandler);
}

function newGameHandler(args, query, callback) {
  var sideLength = +(args.sideLength || 3),
      victorySequence = +(args.victorySequence || sideLength),
      playerSign = (args.playerSign || 'x').toLowerCase();

  if (sideLength < 2) {
    return callback('Invalid side length');
  }

  if (victorySequence < 2 || victorySequence > sideLength) {
    return callback('Invalid victorious sequence length');
  }

  if (playerSign != 'x' && playerSign != 'o') {
    return callback('Invalid player sign');
  } 

  startGame(sideLength, victorySequence, playerSign, (err, id) => {
    if (err) {
      console.error(err);
      return callback('Error occured');
    }

    callback('/game/' + id, { redirect: true });
  });
}

function startGame(side, victory, player, callback) {
  var id = stringid();

  games[id] = {
    side, victory,
    firstPlayerSymbol: player
  };

  server.ws.register('/' + id, gameSocketHandler.bind(this, id));

  callback(null, id);
}

function gamePageHandler(args, query, callback) {
  if (!games[args.id]) {
    return callback('Game not found', { error: 404 });
  }
  callback('/game.html', { serveStatic: true })
}

function gameSocketHandler(id, connection) {
  console.log('New connection to game', id);
}

module.exports = {
  attach
};
