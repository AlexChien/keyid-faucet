var BACKEND_SECRET = require('./getenv.js')('BACKEND_SECRET')
var BACKEND_URL = require('./getenv.js')('BACKEND_URL')

module.exports = function (request, response) {
  console.log('request.body: %j', request.body)
  require('request').post({
    url: BACKEND_URL, json: request.body, headers: {
      authorization: require('hawk').client.header(BACKEND_URL, 'POST', {
        credentials: {
          id: 'faucet', key: BACKEND_SECRET, algorithm: 'sha256'
        }
      }).field
    }
  }, function (error, backend_response, body) {
    if (error) {
      response.status(500).send({ error: error.message })
    } else {
      response.send(body)
    }
  })
}
