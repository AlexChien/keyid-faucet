var app = require('express')()

app.use(require('express').static(__dirname + '/public'))
app.use(require('morgan')('dev'))
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(require('express-session')({
  resave: false, saveUninitialized: false,
  secret: require('./getenv.js')('SESSION_SECRET')
}))

require('./passport.js')(app)

// app.use(require('./user-parse.js'))
app.use(function (request, response, next) {
  request.parsed_user = {
    provider: 'twitter', name: 'foo', date: new Date().toISOString()
  }
  next()
})

app.get('/user.raw.json', function (request, response) {
  response.json(request.user)
})

app.get('/user.json', function (request, response) {
  response.json({ user: request.parsed_user })
})

app.post(
  '/accounts',
  require('./user-validate.js'),
  require('./call-backend.js')
)

app.listen(require('./getenv.js')('PORT'))
