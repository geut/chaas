const nock = require('nock')
// Requiring our app implementation
const myProbotApp = require('..')
const { Application } = require('probot')
// Requiring our fixtures
const checkSuitePayload = require('./fixtures/check_suite.requested')
const checkRunSuccess = require('./fixtures/check_run.created')
const checkRunNeutral = require('./fixtures/check_run.neutral')
const commitWithChangelog = require('./fixtures/commit_with_changelog')
const commitWithoutChangelog = require('./fixtures/commit_without_changelog')

nock.disableNetConnect()

describe('chaas', () => {
  let app
  let github

  beforeEach(() => {
    app = new Application({})
    // Load our app into probot
    app.load(myProbotApp)

    // just return a test token
    // app.app = () => 'test'
    github = {
      // Basic mocks, so we can perform `.not.toHaveBeenCalled()` assertions
      repos: {
      },
      checks: {
        create: jest.fn()
      }
    }
    app.auth = () => Promise.resolve(github)
  })

  test('Run a successful suite run request (gets the changelog and validates status)', async () => {
    nock('https://api.github.com')
      .post('/app/installations/2/access_tokens')
      .reply(200, { token: 'test' })

    github.repos.getCommit = jest.fn().mockReturnValueOnce(
      Promise.resolve({ data: commitWithChangelog })
    )

    // Receive a webhook event
    await app.receive({ name: 'check_suite', payload: checkSuitePayload })

    expect(github.checks.create).toBeCalledWith(
      expect.objectContaining(checkRunSuccess)
    )
  })
  test('Run a neutral suite request (changelog not found)', async () => {
    nock('https://api.github.com')
      .post('/app/installations/2/access_tokens')
      .reply(200, { token: 'test' })

    github.repos.getCommit = jest.fn().mockReturnValueOnce(
      Promise.resolve({ data: commitWithoutChangelog })
    )

    // Receive a webhook event
    await app.receive({ name: 'check_suite', payload: checkSuitePayload })

    expect(github.checks.create).toBeCalledWith(
      expect.objectContaining(checkRunNeutral)
    )
  })
})
