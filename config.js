const path = require('path');

module.exports = {
  port: process.env.PORT || 8080,
  clientPath: path.join(__dirname, 'client')
}
