const config = require('./config'),
      server = require('./lib/server'),
      staticFiles = require('./lib/static');

server.register('/hello/<id>', (args, cb) => {
  cb('Hello, ' + args.id + '!');
});

server.listen(config);
