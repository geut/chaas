
const serverless = require('probot-serverless-now')
const appFn = require('./index')
module.exports = serverless(appFn)
