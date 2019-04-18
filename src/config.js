const path = require('path')
const yaml = require('js-yaml')

const CONFIG_FILE = '.chaas.yml'

const defaultConfig = {
  ignore: []
}

async function config (context) {
  const params = context.repo({ path: path.posix.join('.', CONFIG_FILE) })

  try {
    const res = await context.github.repos.getContent(params)
    const config = yaml.safeLoad(Buffer.from(res.data.content, 'base64').toString()) || {}

    return Object.assign({}, defaultConfig, config)
  } catch (err) {
    if (err.code === 404) {
      return defaultConfig
    } else {
      throw err
    }
  }
}

module.exports = {
  config,
  CONFIG_FILE
}
