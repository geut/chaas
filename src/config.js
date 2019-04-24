const path = require('path')
const yaml = require('js-yaml')

const CONFIG_FILE = '.chaas.yml'

const defaultConfig = {
  version: 1,
  ignore: [],
  branches: []
}

async function getConfig (context) {
  const params = context.repo({ path: path.posix.join('.', CONFIG_FILE) })

  defaultConfig.branches.push(context.payload.repository.default_branch)

  try {
    const res = await context.github.repos.getContents(params)
    const config = yaml.safeLoad(Buffer.from(res.data.content, 'base64').toString()) || {}

    return Object.assign({}, defaultConfig, config)
  } catch (err) {
    if (err.status === 404) {
      return defaultConfig
    } else {
      throw err
    }
  }
}

module.exports = {
  getConfig,
  CONFIG_FILE
}
