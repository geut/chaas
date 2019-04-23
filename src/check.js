const { getConfig } = require('./config')
const multimatch = require('multimatch')

const CHANGELOG = 'changelog.md'

const VALID_STATUS = ['added', 'modified']

const SUCCESS = 'success'
const NEUTRAL = 'neutral'
const FAILURE = 'failure'

const SUMMARY = {
  [SUCCESS]: ':+1: Great! A CHANGELOG file has been found and it has been updated',
  [NEUTRAL]: 'Your PR only contains ignored files. No CHANGELOG change required.',
  [FAILURE]: ':warning: Oh oh. We could not found any updated CHANGELOG entries.'
}

const MESSAGE = {
  [SUCCESS]: 'No further action is required.',
  [NEUTRAL]: 'No further action is required.',
  [FAILURE]: 'Modify your CHANGELOG file accordingly to introduced changes.'
}

async function check (context) {
  const config = await getConfig(context)
  let files

  try {
    files = await context.github.pulls.listFiles(context.issue())
  } catch (error) {
    context.log(error)
  }

  if (!files) return

  const result = await process({ files, config })

  return context.github.checks.create(context.repo({
    name: 'Chaas by GEUT',
    status: 'completed',
    conclusion: result,
    completed_at: new Date(),
    output: {
      title: 'Chaas Check',
      summary: SUMMARY[result],
      text: MESSAGE[result]
    }
  }))
}

async function process ({ files, config: { ignore } }) {
  const filtered = multimatch(
    files.map(f => f.filename),
    ['**', ...ignore.map(i => `!${i}`)]
  )

  if (!filtered.length) return NEUTRAL

  const hasChangelog = files.find(({ filename }) => filename.toLowerCase() === CHANGELOG)
  return hasChangelog && VALID_STATUS.includes(hasChangelog.status) ? SUCCESS : FAILURE
}

// Exports
module.exports = {
  check
}
