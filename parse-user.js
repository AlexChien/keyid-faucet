module.exports = function (request, response, next) {
  request.parsed_user = request.user ? parse(request.user) : null
  next()
}

function parse(user) {
  return {
    provider: get_provider(user),
    name: get_name(user),
    image: get_image(user),
    date: get_date(user)
  }
}

function get_provider(user) {
  return user.provider.charAt(0).toUpperCase() + user.provider.substring(1)
}

function get_name(user) {
  switch (user.provider) {
  case 'twitter':
    return '@' + user.username
  default:
    return user.displayName
  }
}

function get_image(user) {
  return user.photos && user.photos[0] && user.photos[0].value
}

function get_date(user) {
  try {
    switch (user.provider) {
    case 'twitter':
      return new Date(user._json.created_at).toISOString()
    default:
      throw new Error
    }
  } catch (error) {
    // Pretend the account was just created
    return new Date().toISOString()
  }
}
