
const { toLambda } = require('probot-serverless-now')
const appFn = require('./src/index')
module.exports = toLambda(appFn)
