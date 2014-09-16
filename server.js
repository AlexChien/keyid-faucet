var express = require('express')
var passport = require('passport')

var SUCCESS_URL = '/'
var FAILURE_URL = '/auth/error'

function getenv(name) {
  if (name in process.env) {
    return process.env[name]
  } else {
    throw new Error('Missing environment variable: ' + name)
  }
}

passport.serializeUser(function (user, callback) { callback(null, user) })
passport.deserializeUser(function (user, callback) { callback(null, user) })

var app = express()

app.use(express.static(__dirname + '/public'))
app.use(require('express-session')({ secret: getenv('SESSION_SECRET') }))
app.use(passport.initialize())
app.use(passport.session())
app.use(require('body-parser')())

app.listen(getenv('PORT'))

app.get('/user.json', function (request, response) {
  response.json({ user: request.user && get_user_data(request.user) })
})

app.post('/register-account', function (request, response) {
  var key = request.body.account_key
  var name = request.body.account_name
  var payload = JSON.stringify({ account_key: key, account_name: name })
  var hmac = hmac_sha256_base64(payload, SECRET)
  console.log(
    'Registering name %s to key %s...',
    JSON.stringify(name), JSON.stringify(key)
  )
  var json = { hmac_sha256_base64: hmac, payload: payload }
  console.log(
    'Posting JSON: %s', JSON.stringify(json)
  )
  require('request').post({
    url: getenv('BACKEND_URL'),
    json: json
  }, function (error, response, body) {
    response.end(error ? error.toString() : JSON.stringify(body))
    console.log('Done registering: %s %s', error, body)
  })
})

function hmac_sha256_base64(payload, secret) {
  return require('crypto')
    .createHmac('sha256', secret)
    .update(payload).digest('base64')
}

app.get('/auth/disconnect', function (request, response) {
  request.logout()
  response.redirect('/')
})

app.get('/auth/error', function (request, response) {
  response.end('Error: Failed to authenticate with identity provider')
})

//----------------------------------------------------------------------------

function get_user_data(data) {
  return {
    provider: get_user_provider(data),
    name: get_user_name(data),
    image: get_user_image(data),
    date: get_user_date(data)
  }
}

function get_user_provider(data) {
  return data.provider.charAt(0).toUpperCase() + data.provider.substring(1)
}

function get_user_name(data) {
  switch (data.provider) {
  case 'twitter':
    return '@' + data.username
  default:
    return data.displayName
  }
}

function get_user_image(data) {
  return data.photos.length && data.photos[0].value
}

function get_user_date(data) {
  try {
    switch (data.provider) {
    case 'twitter':
      return new Date(data._json.created_at).toISOString()
    default:
      throw new Error
    }
  } catch (error) {
    // Pretend the account was just created
    return new Date().toISOString()
  }
}

//----------------------------------------------------------------------------

app.get('/auth/facebook', passport.authenticate('facebook'))
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: SUCCESS_URL, failureRedirect: FAILURE_URL
}))

passport.use(new (require('passport-facebook').Strategy)({
  clientID: getenv('FACEBOOK_ID'),
  clientSecret: getenv('FACEBOOK_SECRET'),
  callbackURL: getenv('APP_URL') + '/auth/facebook/callback'
}, function (access_token, refresh_token, profile, callback) {
  callback(null, profile)
}))

//----------------------------------------------------------------------------

app.get('/auth/twitter', passport.authenticate('twitter'))
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: SUCCESS_URL, failureRedirect: FAILURE_URL
}))

passport.use(new (require('passport-twitter').Strategy)({
  consumerKey: getenv('TWITTER_ID'),
  consumerSecret: getenv('TWITTER_SECRET'),
  callbackURL: getenv('APP_URL') + '/auth/twitter/callback'
}, function (token, token_secret, profile, callback) {
  callback(null, profile)
}))

//----------------------------------------------------------------------------

app.get('/auth/google', passport.authenticate('google'))
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: SUCCESS_URL, failureRedirect: FAILURE_URL
}))

passport.use(new (require('passport-google').Strategy)({
  returnURL: getenv('APP_URL') + '/auth/google/callback',
  realm: getenv('APP_URL')
}, function (identifier, profile, callback) {
  callback(null, profile)
}))

//----------------------------------------------------------------------------

app.get('/debug/user.json', function (request, response) {
  response.json(request.user)
})
