const http = require('http'),
      url  = require('url'),
      ws   = require('./ws'),
      querystring   = require('querystring'),
      staticHandler = require('./static');

var routes = {};

function routePath(path) {
  for (var route in routes) {
    var routeInfo = routes[route];

    var match = routeInfo.regex.exec(path);
    if (!match) {
      continue;
    }

    var args = match.slice(1),
        handler = routes[route].handler;

    var namedArgs = {};
    args.forEach((value, index) => {
      namedArgs[routeInfo.names[index]] = value;
    });

    return [handler, namedArgs];
  }

  if (!path.endsWith('/')) {
    return routePath(path + '/');
  }

  return [null, null];
}

function register(route, handler) {
  var routeInfo = { handler, names: [] };

  if (!route.startsWith('/')) {
    route = '/' + route;
  }

  var nextIndex = 0;
  var regexSource = route.replace(/<\w+>/, (name) => {
    routeInfo.names[nextIndex++] = name.slice(1, -1);
    return '(\\w+)';
  });

  regexSource = '^' + regexSource + '$';
  routeInfo.regex = new RegExp(regexSource);

  routes[route] = routeInfo;
}

const server = http.createServer((req, res) => {
  var parsedUrl = url.parse(req.url),
      path = parsedUrl.pathname;

  var [handler, args] = routePath(path);
  if (handler) {
    var query = querystring.parse(parsedUrl.query);
    handler(args, query, (result, options) => {
      if (options && options.redirect) {
        res.writeHead(303, {
          'Location': result
        });
        res.end();
      } else if (options && options.serveStatic) {
        serveStatic(result);
      } else {
        res.end(result);
      }
    });
  } else {
    serveStatic(path);
  }

  function serveStatic(path) {
    staticHandler.get(path, (err, contentType, data) => {
      if (err) {
        return notFound();
      }

      res.setHeader('content-type', contentType);
      res.end(data);
    });
  }

  function notFound() {
    res.writeHead(404);
    res.end('Not found');
  }
});

const wsServer = ws.init(server);

function listen(config) {
  staticHandler.init(config.clientPath, server);
  server.listen(config.port, () => {
    console.log('Server is listening on port', config.port);
  });
}

module.exports = {
  http: server,
  ws: wsServer,
  listen,
  register
};
