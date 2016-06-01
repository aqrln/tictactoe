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

  var ws;

  var joinButton = document.getElementById('join');
  joinButton.addEventListener('click', function () {
    ws = new WebSocket(wsUrl);

    ws.onopen = function () {
      console.log('connected to server');
    };

    ws.onmessage = function (message) {
      var event = JSON.parse(message.data),
          handler = eventHandlers[event.type];
      handler(event);
    };
  });

  var eventHandlers = {
    create: function (event) {
      var gamePane = document.getElementById('game');
      gamePane.innerHTML = '';

      var table = document.createElement('table'),
          tbody = document.createElement('tbody');
      table.appendChild(tbody);

      for (var i = 0; i < event.side; i++) {
        var tr = document.createElement('tr');

        for (var j = 0; j < event.side; j++) {
          var td = document.createElement('td');
          td.innerHTML = '&nbsp;';
          td.id = getCellId(i, j);

          td.addEventListener('click', (function (row, column) {
            return function () {
              ws.send(JSON.stringify({
                row: row,
                column: column
              }));
            };
          })(i, j));

          tr.appendChild(td);
        }

        tbody.appendChild(tr);
      }

      gamePane.appendChild(table);
    },

    put: function (event) {
      var id = getCellId(event.row, event.column),
          cell = document.getElementById(id);
      cell.innerHTML = event.symbol.toUpperCase();
    },

    role: function (event) {
      var role = event.role,
          roleSpan = document.getElementById('role');
      if (role === 'player') {
        roleSpan.innerHTML = 'Player (' + event.symbol + ')'
      } else {
        roleSpan.innerHTML = 'Spectator';
      }
    }
  };

  function getCellId(row, column) {
    return 'cell_'+ row + '_' + column;
  }

})();
