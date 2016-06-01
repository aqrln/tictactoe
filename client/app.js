(function () {

  var protocols = {
    'http:' : 'ws://',
    'https:': 'wss://'
  };

  var wsProtocol = protocols[document.location.protocol];

  var path = document.location.pathname,
      gameId = path.slice(path.lastIndexOf('/') + 1);

  var server = document.location.hostname;
  if (document.location.port !== '80') {
    server += ':' + document.location.port;
  }

  var wsUrl = wsProtocol + server + '/' + gameId;

  var ws = new WebSocket(wsUrl);

  ws.onopen = function () {
    console.log('connected to server');
  }

})();
