var Passport = require('passport')
var getenv = require('./getenv.js')

var APP_URL = getenv('APP_URL')

var PROVIDERS = 'google twitter facebook'
var PROVIDER_OPTIONS = { google: { scope: ['profile'] } }

Passport.serializeUser(function (x, ok) { return ok(null, x) })
Passport.deserializeUser(function (x, ok) { return ok(null, x) })

Passport.use(new (require('passport-google-oauth').OAuth2Strategy)({
  clientID: getenv('GOOGLE_ID'),
  clientSecret: getenv('GOOGLE_SECRET'),
  callbackURL: APP_URL + '/auth/google/callback'
}, function (identifier, profile, callback) {
  callback(null, profile)
}))

Passport.use(new (require('passport-facebook').Strategy)({
  clientID: getenv('FACEBOOK_ID'),
  clientSecret: getenv('FACEBOOK_SECRET'),
  callbackURL: APP_URL + '/auth/facebook/callback'
}, function (access_token, refresh_token, profile, callback) {
  callback(null, profile)
}))

Passport.use(new (require('passport-twitter').Strategy)({
  consumerKey: getenv('TWITTER_ID'),
  consumerSecret: getenv('TWITTER_SECRET'),
  callbackURL: APP_URL + '/auth/twitter/callback'
}, function (token, token_secret, profile, callback) {
  callback(null, profile)
}))

module.exports = function (app) {
  app.use(require('express-session')({
    resave: false, saveUninitialized: false,
    secret: require('./getenv.js')('SESSION_SECRET')
  }))

  app.use(Passport.initialize())
  app.use(Passport.session())

  PROVIDERS.split(' ').forEach(function (provider) {
    app.get('/auth/' + provider, Passport.authenticate(
      provider, PROVIDER_OPTIONS[provider]
    ))
    app.get('/auth/' + provider + '/callback', Passport.authenticate(
      provider, { successRedirect: '/', failureRedirect: '/auth/error' }
    ))
  })

  app.get('/auth/disconnect', function (request, response) {
    request.logout()
    response.redirect('/')
  })

  app.get('/auth/error', function (request, response) {
    response.status(401).end(
      'Error: Failed to authenticate with identity provider'
    )
  })
}
