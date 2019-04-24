const nock = require('nock')

// Requiring our app implementation
const myProbotApp = require('../src')
const { Application } = require('probot')

// Requiring Fixtures
// WebHook Events
const pullRequestOpened = require('./fixtures/pull_request.opened')
const pullRequestSynchronize = require('./fixtures/pull_request.synchronize')
// octokit githut.pulls.listFiles
const pullsListFilesWithChangelog = require('./fixtures/pulls.listFiles.withChangelog')
const pullsListFilesWithoutChangelog = require('./fixtures/pulls.listFiles.withoutChangelog')
// Check Responses
const checkRunSuccess = require('./fixtures/check_run.created')
const checkRunNeutral = require('./fixtures/check_run.neutral')
const checkRunFailure = require('./fixtures/check_run.failure')

nock.disableNetConnect()

describe('chaas', () => {
  let app
  let github

  beforeEach(() => {
    app = new Application({})
    // Load our app into probot
    app.load(myProbotApp)

    github = {
      pulls: {
        listFiles: jest.fn()
      },
      repos: {
        getContents: jest.fn()
      },
      checks: {
        create: jest.fn()
      }
    }

    app.auth = () => Promise.resolve(github)

    nock('https://api.github.com')
      .post('/app/installations/2/access_tokens')
      .reply(200, { token: 'test' })
  })

  describe('With no .chaas.yml configuration file', () => {
    beforeEach(() => {
      const error = new Error('Not Found')
      error.status = 404
      github.repos.getContents.mockImplementation(({ path }) => path.endsWith('.chaas.yml') ? Promise.reject(error) : null)
    })

    test('Run a successful check on a pull request opened (changelog found)', async () => {
      // Retrieve PR files with Changelog
      github.pulls.listFiles.mockReturnValueOnce(pullsListFilesWithChangelog)

      // Receive a webhook event pull_request.opened
      await app.receive({ name: 'pull_request', payload: pullRequestOpened })

      expect(github.checks.create).toBeCalledWith(
        expect.objectContaining(checkRunSuccess)
      )
    })

    test('Run a successful check on a pull request synchronize (changelog found)', async () => {
      // Retrieve PR files with Changelog
      github.pulls.listFiles.mockReturnValueOnce(pullsListFilesWithChangelog)

      // Receive a webhook event pull_request.synchronize
      await app.receive({ name: 'pull_request', payload: pullRequestSynchronize })

      expect(github.checks.create).toBeCalledWith(
        expect.objectContaining(checkRunSuccess)
      )
    })

    test('Run a failed check on a pull request opened (changelog not found)', async () => {
      // Retrieve PR files without Changelog
      github.pulls.listFiles.mockReturnValueOnce(pullsListFilesWithoutChangelog)

      // Receive a webhook event pull_request.opened
      await app.receive({ name: 'pull_request', payload: pullRequestOpened })

      expect(github.checks.create).toBeCalledWith(
        expect.objectContaining(checkRunFailure)
      )
    })

    test('Run a failed check on a pull request synchronize (changelog not found)', async () => {
      // Retrieve PR files without Changelog
      github.pulls.listFiles.mockReturnValueOnce(pullsListFilesWithoutChangelog)

      // Receive a webhook event pull_request.synchronize
      await app.receive({ name: 'pull_request', payload: pullRequestSynchronize })

      expect(github.checks.create).toBeCalledWith(
        expect.objectContaining(checkRunFailure)
      )
    })
  })

  describe('With .chaas.yml configuration ignore: ["**/*.js"]', () => {
    beforeEach(() => {
      const response = { data: { content: Buffer.from('ignore: ["**/*.js"]', 'binary').toString('base64') } }
      github.repos.getContents.mockImplementation(({ path }) => path.endsWith('.chaas.yml') ? Promise.resolve(response) : null)
    })

    test('Run a failed check on a pull request opened (all files changed are ignored)', async () => {
      // Retrieve PR files without Changelog
      github.pulls.listFiles.mockReturnValue(pullsListFilesWithoutChangelog)

      // Receive a webhook event pull_request.opened
      await app.receive({ name: 'pull_request', payload: pullRequestOpened })

      expect(github.checks.create).toBeCalledWith(
        expect.objectContaining(checkRunNeutral)
      )
    })

    test('Run a failed check on a pull request synchronize (all files changed are ignored)', async () => {
      // Retrieve PR files without Changelog
      github.pulls.listFiles.mockReturnValue(pullsListFilesWithoutChangelog)

      // Receive a webhook event pull_request.synchronize
      await app.receive({ name: 'pull_request', payload: pullRequestSynchronize })

      expect(github.checks.create).toBeCalledWith(
        expect.objectContaining(checkRunNeutral)
      )
    })
  })

  describe('With .chaas.yml configuration branches: ["not-current"]', () => {
    beforeEach(() => {
      const response = { data: { content: Buffer.from('branches: ["not-current"]', 'binary').toString('base64') } }
      github.repos.getContents.mockImplementation(({ path }) => path.endsWith('.chaas.yml') ? Promise.resolve(response) : null)
    })

    test('Skips checks if pull request opened against a not configured branch', async () => {
      // Retrieve PR files without Changelog
      github.pulls.listFiles.mockReturnValue(pullsListFilesWithoutChangelog)

      // Receive a webhook event pull_request.opened
      await app.receive({ name: 'pull_request', payload: pullRequestOpened })

      expect(github.checks.create).not.toHaveBeenCalled()
    })

    test('Skips checks if pull request synchronized against a not configured branch', async () => {
      // Retrieve PR files without Changelog
      github.pulls.listFiles.mockReturnValue(pullsListFilesWithoutChangelog)

      // Receive a webhook event pull_request.opened
      await app.receive({ name: 'pull_request', payload: pullRequestOpened })

      expect(github.checks.create).not.toHaveBeenCalled()
    })
  })
})
