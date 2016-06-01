(function () {

  var protocols = {
    'http:' : 'ws://',
    'https:': 'wss://'
  };

  var wsProtocol = protocols[document.location.protocol];

})();
