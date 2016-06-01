const WebSocketServer = require('websocket').server,
      WebSocketRouter = require('websocket').router;

var wsServer, wsRouter;

function init(httpServer) {
  wsServer = new WebSocketServer({
    httpServer,
    autoAcceptConnections: false
  });

  wsRouter = new WebSocketRouter({
    server: wsServer
  });

  console.log('WebSocket server initialized');
};

function register(path, handler) {
  wsRouter.mount(path, '*', (request) => {
    var connection = request.accept();
    handler(connection, request);
  });
}

module.exports = {
  init,
  register
}
