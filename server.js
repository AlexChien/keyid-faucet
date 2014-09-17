function Getenv(name) {
  if (name in process.env) {
    return process.env[name]
  } else {
    throw new Error('Missing environment variable: ' + name)
  }
}

var APP_URL = Getenv('APP_URL')
var BACKEND_SECRET = Getenv('BACKEND_SECRET')
var BACKEND_URL = Getenv('BACKEND_URL')
var FACEBOOK_ID = Getenv('FACEBOOK_ID')
var FACEBOOK_SECRET = Getenv('FACEBOOK_SECRET')
var PORT = Getenv('PORT')
var SESSION_SECRET = Getenv('SESSION_SECRET')
var TWITTER_ID = Getenv('TWITTER_ID')
var TWITTER_SECRET = Getenv('TWITTER_SECRET')

var Express = require('express')
var Format = require('util').format
var Passport = require('passport')

function id(x, callback) { return callback(null, x) }
Passport.serializeUser(id)
Passport.deserializeUser(id)

var app = Express()

app.use(Express.static(__dirname + '/public'))
app.use(require('express-session')({ secret: SESSION_SECRET }))
app.use(Passport.initialize())
app.use(Passport.session())
app.use(require('body-parser')())

app.listen(PORT)

//----------------------------------------------------------------------------

app.get('/user.json', function (request, response) {
  response.json({ user: request.user && get_user_data(request.user) })
})

app.post('/register', function (request, response) {
  if (valid_user(request.user)) {
    var key = request.body.account_key
    var name = request.body.account_name
    register_account(key, name, function (error, body) {
      if (error) {
        response.writeHead(500)
        response.end(error.message)
      } else {
        response.end(body)
      }
    })
  } else {
    response.writeHead(401)
    response.end()
  }
})

function register_account(key, name, callback) {
  var log_prefix = Format('REGISTER %j %j', key, name)
  var payload = JSON.stringify({ account_key: key, account_name: name })

  console.log('%s', log_prefix)
  require('request').post({
    url: BACKEND_URL,
    json: {
      hmac_sha256_base64: HMAC(payload, BACKEND_SECRET),
      payload: payload
    }
  }, function (error, raw, body) {
    if (error) {
      console.error('%s ERR %s', log_prefix, error)
      callback(error)
    } else {
      console.log('%s OK', log_prefix)
      callback(null, body)
    }
  })
}

function HMAC(payload, secret) {
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

app.get('/auth/facebook', Passport.authenticate('facebook'))
app.get('/auth/facebook/callback', Passport.authenticate('facebook', {
  successRedirect: '/', failureRedirect: '/auth/error'
}))

Passport.use(new (require('passport-facebook').Strategy)({
  clientID: FACEBOOK_ID,
  clientSecret: FACEBOOK_SECRET,
  callbackURL: APP_URL + '/auth/facebook/callback'
}, function (access_token, refresh_token, profile, callback) {
  callback(null, profile)
}))

//----------------------------------------------------------------------------

app.get('/auth/twitter', Passport.authenticate('twitter'))
app.get('/auth/twitter/callback', Passport.authenticate('twitter', {
  successRedirect: '/', failureRedirect: '/auth/error'
}))

Passport.use(new (require('passport-twitter').Strategy)({
  consumerKey: TWITTER_ID,
  consumerSecret: TWITTER_SECRET,
  callbackURL: APP_URL + '/auth/twitter/callback'
}, function (token, token_secret, profile, callback) {
  callback(null, profile)
}))

//----------------------------------------------------------------------------

app.get('/auth/google', Passport.authenticate('google'))
app.get('/auth/google/callback', Passport.authenticate('google', {
  successRedirect: '/', failureRedirect: '/auth/error'
}))

Passport.use(new (require('passport-google').Strategy)({
  returnURL: APP_URL + '/auth/google/callback',
  realm: APP_URL
}, function (identifier, profile, callback) {
  callback(null, profile)
}))

//----------------------------------------------------------------------------

app.get('/debug/user.json', function (request, response) {
  response.json(request.user)
})
