var express = require('express')
var passport = require('passport')

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

app.listen(getenv('PORT'))

//----------------------------------------------------------------------------

app.get('/connect/facebook', passport.authenticate('facebook'))
app.get('/connect/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/', failureRedirect: '/'
}))

passport.use(new (require('passport-facebook').Strategy)({
  clientID: getenv('FACEBOOK_ID'),
  clientSecret: getenv('FACEBOOK_SECRET'),
  callbackURL: getenv('APP_URL') + '/connect/facebook/callback'
}, function(access_token, refresh_token, profile, done) {
  console.log('Facebook profile: %s', JSON.stringify(profile))
  done(null, { profile: profile })
}))

//----------------------------------------------------------------------------

app.get('/connect/twitter', passport.authenticate('twitter'))
app.get('/connect/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/', failureRedirect: '/'
}))

passport.use(new (require('passport-twitter').Strategy)({
  consumerKey: getenv('TWITTER_ID'),
  consumerSecret: getenv('TWITTER_SECRET'),
  callbackURL: getenv('APP_URL') + '/connect/twitter/callback'
}, function(token, token_secret, profile, done) {
  console.log('Twitter profile: %s', JSON.stringify(profile))
  done(null, { profile: profile })
}))

//----------------------------------------------------------------------------

app.get('/connect/google', passport.authenticate('google'))
app.get('/connect/google/callback', passport.authenticate('google', {
  successRedirect: '/', failureRedirect: '/'
}))

passport.use(new (require('passport-google').Strategy)({
  returnURL: getenv('APP_URL') + '/connect/google/callback',
  realm: getenv('APP_URL')
}, function (identifier, profile, done) {
  console.log('Google profile: %s', JSON.stringify(profile))
  done(null, { profile: profile })
}))
