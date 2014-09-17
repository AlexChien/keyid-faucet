module.exports = function (name) {
  if (name in process.env) {
    return process.env[name]
  } else {
    throw new Error('Missing environment variable: ' + name)
  }
}
