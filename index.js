const getSummary = {
  success: ':+1: Great! A changelog file has been found and it has been updated',
  neutral: ':warning: Oh oh. We could not found any changelog file nor has been updated.'
};

const getText = {
  success: 'No further action is required.',
  neutral: 'You can ask the contributor to run `chan [TYPE-OF-CHANGE] [message]`'
}

// Checks API example
// See: https://developer.github.com/v3/checks/ to learn more
module.exports = app => {
  app.on(['check_suite.requested', 'check_run.rerequested'], check)

  async function check (context) {
    // Do stuff
    const { head_branch, head_sha, head_commit } = context.payload.check_suite
    const { name, owner } = context.payload.repository
    // Probot API note: context.repo() => {username: 'hiimbex', repo: 'testing-things'}
    context.log('>>>>>> CHECK SUITE / CHECK RUN ')
    if (!head_commit) return;
    let commit;
    try {
      commit = await context.github.repos.getCommit({
        owner: owner.login,
        repo: name,
        sha: head_commit.id
      })
    }
    catch (err) {
      context.log({ err });
      return;
    }
    const { files } = commit.data;
    let found = false;
    for (let file of files) {
      const validName = file.filename.toLowerCase() === 'changelog.md';
      const validStatus = file.status === 'added' || file.status === 'modified';
      if (validName && validStatus) {
        found = true;
        break;
      };
    }

    const result = found ? 'success √' : 'neutral';

    return context.github.checks.create(context.repo({
      name: 'Chaas by GEUT',
      head_branch,
      head_sha,
      status: 'completed',
      conclusion: result,
      completed_at: new Date(),
      output: {
        title: 'Chaas check',
        summary: getSummary[result],
        text: getText[result]
      }
    }))
  }

  async function pr (context) {
    context.log('>>>>>> PULL REQUEST ')
    context.log({ payload: context.payload })
  }
}
