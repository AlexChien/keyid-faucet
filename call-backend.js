var BACKEND_SECRET = require('./getenv.js')('BACKEND_SECRET')
var BACKEND_URL = require('./getenv.js')('BACKEND_URL')

module.exports = function (params, callback) {
  require('request').post({
    url: BACKEND_URL, json: params, headers: {
      authorization: require('hawk').client.header(BACKEND_URL, 'POST', {
        credentials: {
          id: 'not-used', key: BACKEND_SECRET, algorithm: 'sha256'
        }
      }).field
    }
  }, function (error, response, body) {
    callback(error, body)
  })
}
