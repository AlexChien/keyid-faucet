var app = require('express')()

app.use(require('express').static(__dirname + '/public'))
app.use(require('morgan')('dev'))
app.use(require('body-parser').urlencoded({ extended: true }))
require('./passport.js')(app)
app.use(require('./parse-user.js'))

app.get('/user.json', function (request, response) {
  response.json({ user: request.parsed_user })
})

// XXX: For debugging
app.get('/user.raw.json', function (request, response) {
  response.json(request.user)
})

app.post(
  '/accounts',
  require('./authorize.js'),
  require('./call-backend.js')
)

app.listen(require('./getenv.js')('PORT'))
