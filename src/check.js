const { config } = require('./config')
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
      commit_sha: id
    })
  } catch (err) {
    context.log({ err })
    return
  }

  const result = processCommit({ config: cfg, commit })

  return context.github.checks.create(context.repo({
    name: 'Chaas by GEUT',
    head_branch,
    head_sha,
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

function processCommit ({ commit, config: { ignore } }) {
  const { files } = commit.data

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
