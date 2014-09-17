module.exports = function (request, response, next) {
  validate(request.parsed_user, function (error) {
    if (error) {
      response.status(401).send({ error: error.message })
    } else {
      next()
    }
  })
}

function validate(user, callback) {
  if (user) {
    callback(null)
  } else {
    callback(new Error('Invalid user'))
  }
}
