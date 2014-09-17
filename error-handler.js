module.exports = function(error, request, response, next) {
  console.error(err.stack)
  response.status(500).send({
    error: 'Internal server error: ' + error.message
  })
}
