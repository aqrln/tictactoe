const fs = require('fs'),
      path = require('path'),
      mime = require('mime-types');

var clientPath = '.',
    server = null;

var cache = {};

function init(path, httpServer) {
  clientPath = path;
  server = httpServer;

  console.log('Serving static files from', clientPath);
}

function get(file, callback) {
  if (file === '/') {
    file = '/index.html';
  }

  if (cache[file]) {
    return onFound();
  }

  fs.readFile(path.join(clientPath, file), (err, data) => {
    if (err) {
      return callback(err);
    }

    cache[file] = {
      mimeType: mime.lookup(file),
      data
    };

    onFound();
  });

  function onFound() {
    callback(null, cache[file].mimeType, cache[file].data);
  }
}

module.exports = {
  init,
  get
};
