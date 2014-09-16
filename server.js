var express = require('express')
var passport = require('passport')

var SUCCESS_URL = '/'
var FAILURE_URL = '/connect/error'

function getenv(name) {
  if (name in process.env) {
    return process.env[name]
  } else {
    throw new Error('Missing environment variable: ' + name)
  }
}

var app = express()

app.use(express.static(__dirname + '/public'))
app.use(require('express-session')({ secret: getenv('SESSION_SECRET') }))
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function (user, callback) { callback(null, user) })
passport.deserializeUser(function (user, callback) { callback(null, user) })

app.get('/user.json', function (request, response) {
  response.json({ user: request.user && format_user(request.user) })
})

function format_user(data) {
  return {
    provider: data.provider,
    name: data.displayName,
    image: data.photos.length && data.photos[0].value,
    date: get_user_creation_date(data).toISOString()
  }
}

function get_user_creation_date(data) {
  switch (data.provider) {
  case 'twitter':
    var date = data._raw.created_at
    try {
      return new Date(new Date(date).toISOString())
    } catch (error) {
      console.error('Failed to parse date: %s', date)
      console.error('Data: ', JSON.stringify(date, null, 2))
      return new Date
    }
  default:
    return new Date
  }
}

app.get('/connect/error', function (request, response) {
  response.end('Error: Failed to authenticate with identity provider')
})

app.get('/disconnect', function (request, response) {
  response.logout()
  response.redirect('/')
})

app.listen(getenv('PORT'))

//----------------------------------------------------------------------------

app.get('/connect/facebook', passport.authenticate('facebook'))
app.get('/connect/facebook/callback', passport.authenticate('facebook', {
  successRedirect: SUCCESS_URL, failureRedirect: FAILURE_URL
}))

passport.use(new (require('passport-facebook').Strategy)({
  clientID: getenv('FACEBOOK_ID'),
  clientSecret: getenv('FACEBOOK_SECRET'),
  callbackURL: getenv('APP_URL') + '/connect/facebook/callback'
}, function (access_token, refresh_token, profile, callback) {
  callback(null, profile)
}))

//----------------------------------------------------------------------------

app.get('/connect/twitter', passport.authenticate('twitter'))
app.get('/connect/twitter/callback', passport.authenticate('twitter', {
  successRedirect: SUCCESS_URL, failureRedirect: FAILURE_URL
}))

passport.use(new (require('passport-twitter').Strategy)({
  consumerKey: getenv('TWITTER_ID'),
  consumerSecret: getenv('TWITTER_SECRET'),
  callbackURL: getenv('APP_URL') + '/connect/twitter/callback'
}, function (token, token_secret, profile, callback) {
  callback(null, profile)
}))

//----------------------------------------------------------------------------

app.get('/connect/google', passport.authenticate('google'))
app.get('/connect/google/callback', passport.authenticate('google', {
  successRedirect: SUCCESS_URL, failureRedirect: FAILURE_URL
}))

passport.use(new (require('passport-google').Strategy)({
  returnURL: getenv('APP_URL') + '/connect/google/callback',
  realm: getenv('APP_URL')
}, function (identifier, profile, callback) {
  callback(null, profile)
}))
