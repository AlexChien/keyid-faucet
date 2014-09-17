var getenv = require('./getenv.js')
var passport = require('passport')

var APP_URL = getenv('APP_URL')
var PROVIDERS = 'google twitter facebook'.split(' ')
var PROVIDER_OPTIONS = { google: { scope: ['profile'] } }

passport.serializeUser(function (x, ok) { return ok(null, x) })
passport.deserializeUser(function (x, ok) { return ok(null, x) })

passport.use(new (require('passport-google-oauth').OAuth2Strategy)({
  clientID: getenv('GOOGLE_ID'),
  clientSecret: getenv('GOOGLE_SECRET'),
  callbackURL: APP_URL + '/auth/google/callback'
}, function (access_token, refresh_token, profile, callback) {
  callback(null, profile)
}))

passport.use(new (require('passport-facebook').Strategy)({
  clientID: getenv('FACEBOOK_ID'),
  clientSecret: getenv('FACEBOOK_SECRET'),
  callbackURL: APP_URL + '/auth/facebook/callback'
}, function (access_token, refresh_token, profile, callback) {
  callback(null, profile)
}))

passport.use(new (require('passport-twitter').Strategy)({
  consumerKey: getenv('TWITTER_ID'),
  consumerSecret: getenv('TWITTER_SECRET'),
  callbackURL: APP_URL + '/auth/twitter/callback'
}, function (token, token_secret, profile, callback) {
  callback(null, profile)
}))

module.exports = function (app) {
  app.use(require('express-session')({
    resave: false, saveUninitialized: false,
    secret: getenv('SESSION_SECRET')
  }))

  app.use(passport.initialize())
  app.use(passport.session())

  PROVIDERS.forEach(function (provider) {
    app.get('/auth/' + provider, passport.authenticate(
      provider, PROVIDER_OPTIONS[provider]
    ))
    app.get('/auth/' + provider + '/callback', passport.authenticate(
      provider, { successRedirect: '/', failureRedirect: '/auth/error' }
    ))
  })

  app.get('/auth/disconnect', function (request, response) {
    request.logout()
    response.redirect('/')
  })

  app.get('/auth/error', function (request, response) {
    // XXX: Handle this more gracefully
    response.status(401).end('Authentication failed')
  })
}
