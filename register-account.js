module.exports = function (request, response) {
  require('./call-backend.js')({
    key: request.body.key,
    name: request.body.name,
    user: request.user
  }, function (error, body) {
    if (error || !body || body.error) {
      response.status(500).send({ error: error.message })
    } else {
      response.send({ success: true })
    }
  })
}
