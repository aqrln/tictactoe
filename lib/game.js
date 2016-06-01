var server = null;

function attach(httpServer) {
  server = httpServer;

  server.register('/new', newGameHandler);
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
  callback(null, '0');
}

function gamePageHandler(args, query, callback) {
  callback('/game.html', { serveStatic: true })
}

module.exports = {
  attach
};
