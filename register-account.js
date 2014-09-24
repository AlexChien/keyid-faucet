module.exports = function (request, response) {
  require('./call-backend.js')({
    key: request.body.key,
    name: request.body.name,
    user: request.user
  }, function (error, body) {
    if (error) {
      response.send({ error: error.message })
    } else if (body.error) {
      response.send({ error: body.error })
    } else {
      response.send({ success: true })
    }
  })
}
