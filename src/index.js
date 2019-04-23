
const { check } = require('./check')

// Checks API example
// See: https://developer.github.com/v3/checks/ to learn more
module.exports = app => {
  app.on(['pull_request.opened', 'pull_request.synchronize'], check)
}
