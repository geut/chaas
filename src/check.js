const { config } = require('./config')
const multimatch = require('multimatch')

const CHANGELOG = 'changelog.md'

const VALID_STATUS = ['added', 'modified']

const SUCCESS = 'success'
const NEUTRAL = 'neutral'

const SUMMARY = {
  [SUCCESS]: ':+1: Great! A changelog file has been found and it has been updated',
  [NEUTRAL]: ':warning: Oh oh. We could not found any changelog file nor has been updated.'
}

const MESSAGE = {
  [SUCCESS]: 'No further action is required.',
  [NEUTRAL]: 'You can ask the contributor to run `chan [TYPE-OF-CHANGE] [message]`'
}

async function check (context) {
  const cfg = await config(context)
  /* eslint-disable camelcase */
  const { head_branch, head_sha, head_commit: { id } = {} } = context.payload.check_suite
  const { name, owner } = context.payload.repository
  let commit

  // Probot API note: context.repo() => {username: 'hiimbex', repo: 'testing-things'}
  if (!id) return

  try {
    commit = await context.github.repos.getCommit({
      owner: owner.login,
      repo: name,
      sha: id
    })
  } catch (err) {
    context.log({ err })
    return
  }

  // const { files } = commit.data
  // const found = files.find(({ filename, status }) => (filename.toLowerCase() === CHANGELOG && (VALID_STATUS.includes(status))))
  // const result = found ? SUCCESS : NEUTRAL
  const result = processCommit({ config: cfg, commit })

  return context.github.checks.create(context.repo({
    name: 'Chaas by GEUT',
    head_branch,
    head_sha,
    status: 'completed',
    conclusion: result,
    completed_at: new Date(),
    output: {
      title: 'Chaas check',
      summary: SUMMARY[result],
      text: MESSAGE[result]
    }
  }))
}

function processCommit ({ commit, config: { ignore } }) {
  const { files } = commit.data

  const filtered = multimatch(
    files.map(f => f.filename),
    ['*', ...ignore.map(i => `!${i}`)]
  )

  if (!filtered.length) return NEUTRAL

  const hasChangelog = files.find(({ filename }) => filename.toLowerCase() === CHANGELOG)

  return hasChangelog && VALID_STATUS.includes(hasChangelog.status) ? SUCCESS : NEUTRAL
}

// Exports
module.exports = {
  check
}
