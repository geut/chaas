
const serverless = require('probot-serverless-now')
const appFn = require('./src/index')
module.exports = serverless(appFn)
