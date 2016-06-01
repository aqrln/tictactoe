const config = require('./config'),
      server = require('./lib/server'),
      game   = require('./lib/game.js');

game.attach(server);
server.listen(config);
