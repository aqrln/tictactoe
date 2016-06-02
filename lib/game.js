const stringid = require('./stringid');

var server = null;

var games = {};

function attach(httpServer) {
  server = httpServer;

  server.register('/game/new', newGameHandler);
  server.register('/game/<id>', gamePageHandler);
}

function newGameHandler(args, query, callback) {
  var sideLength = +(query.sideLength || 3),
      victorySequence = +(query.victorySequence || sideLength),
      playerSign = (query.playerSign || 'x').toLowerCase();

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

function Game(side, victory, firstPlayer) {
  this.side = side;
  this.victory = victory;
  this.firstPlayerSymbol = firstPlayer;

  this.players = {
    x: null,
    o: null
  };

  this.spectators = [];
  this.currentPlayer = 'x';

  this.events = [{
    type: 'create',
    side: side
  }];

  this.gameField = [];

  for (var i = 0; i < side; i++) {
    var row = [];
    for (var j = 0; j < side; j++) {
      row.push(' ');
    }
    this.gameField.push(row);
  }

  this.stopped = false;
}

function startGame(side, victory, player, callback) {
  var id = stringid();
  games[id] = new Game(side, victory, player);

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
  var game = games[id];

  if (!game) {
    connection.drop(404, 'No such game');
    return;
  }

  var mode, symbol;

  if (!game.players[game.firstPlayerSymbol]) {
    symbol = game.firstPlayerSymbol;
    addPlayer();
  } else {
    symbol = oppositeSymbol(game.firstPlayerSymbol);
    if (!game.players[symbol]) {
      addPlayer();
    } else {
      game.spectators.push(connection);
      mode = 'spectator';
    }
  }

  var roleNotification = {
    type: 'role',
    role: mode
  };
  
  if (mode === 'player') {
    roleNotification.symbol = symbol;
  }

  connection.send(JSON.stringify(roleNotification));

  for (var event of game.events) {
    connection.send(JSON.stringify(event));
  }

  connection.on('message', (message) => {
    if (game.stopped) {
      return;
    }

    if (mode !== 'player') {
      return;
    }

    if (!game.players.x || !game.players.o) {
      return;
    }

    if (game.currentPlayer !== symbol) {
      return;
    }

    try {
      var event  = JSON.parse(message.utf8Data),
          row    = event.row,
          column = event.column;

      if (!validCoordinate(row) || !validCoordinate(column)) {
        throw new Error('malformed coordinates');
      }
    } catch (error) {
      connection.drop(400, 'Invalid request: ' + error);
    }

    if (game.gameField[row][column] !== ' ') {
      return;
    }

    var putEvent = {
      type: 'put',
      symbol,
      row, column
    };

    game.currentPlayer = oppositeSymbol(game.currentPlayer);

    game.events.push(putEvent);
    broadcast(putEvent);
  });

  function addPlayer() {
    game.players[symbol] = connection;
    mode = 'player';
  }

  function validCoordinate(coordinate) {
    return !isNaN(coordinate) && coordinate !== null;
  }

  function broadcast(event) {
    var eventString = JSON.stringify(event);
    
    game.players.x.send(eventString);
    game.players.o.send(eventString);

    for (var spectator of game.spectators) {
      spectator.send(eventString);
    }
  }

  function oppositeSymbol(symbol) {
    return symbol === 'x' ? 'o' : 'x';
  }
}

module.exports = {
  attach
};
