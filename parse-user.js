module.exports = function (request, response, next) {
  request.parsed_user = request.user ? parse(request.user) : null
  next()
}

function parse(user) {
  return {
    provider: user.provider,
    pretty_provider: get_pretty_provider(user),
    id: user.id,
    date: get_date(user)
  }
}

function get_pretty_provider(user) {
  return user.provider.charAt(0).toUpperCase() + user.provider.substring(1)
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
