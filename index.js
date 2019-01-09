
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

// Checks API example
// See: https://developer.github.com/v3/checks/ to learn more
module.exports = app => {
  app.on(['check_suite.requested', 'check_run.rerequested'], check)

  async function check (context) {
    // Do stuff
    const { head_branch, head_sha, head_commit: { id } = {} } = context.payload.check_suite
    const { name, owner } = context.payload.repository
    // Probot API note: context.repo() => {username: 'hiimbex', repo: 'testing-things'}
    context.log('>>>>>> CHECK SUITE / CHECK RUN ')
    if (!id) return
    let commit
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
    const { files } = commit.data
    const found = files.find(({filename, status}) => (filename.toLowerCase() === CHANGELOG && (VALID_STATUS.includes(status))))
    const result = found ? SUCCESS : NEUTRAL

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

  // async function pr (context) {
  //   context.log('>>>>>> PULL REQUEST ')
  //   context.log({ payload: context.payload })
  // }
}
