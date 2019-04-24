# chaas

> Check if your `CHANGELOG.md` has changed.

__A GitHub App built with [Probot](https://github.com/probot/probot)__

![chaas logo](./emblem/chaas_logo.png)

## Usage

`chaas` will run and check if your PR contains CHANGELOG changes.

### Configuration

Add a `.chaas.yml` file to your project root if you need to modify any default configuration.

- Options
    - `version {Number}`: `chaas` config schema version.
        - *Default*: `1`.
    - `ignore {Array}`: A list of files/globs to ignore files in PRs. If your PR contains **only** files ignored then `chaas` will report as `NEUTRAL`.
        - *Default*: `[]`.
        - **example**: If you don't want `chaas` to report when you only commit changes for markdown files:
        ```yml
            ignore: [ "**/*.md" ]
        ```
    - `branches {Array}`: A list of branches where `chaas` check should run if PRs are opened to merge into. Notice that if you specify this it overrides default configuration.
        - *Default*: [<_Repository default branch_>]. Usually `master`.
        - **example**: Run checks when PRs are created against `master` and `canary`branches.
        ```yml
            branches: ["master", "canary"]
        ```

## Development 

```sh
# Install dependencies
npm install

# Run the bot (locally)
npm run dev 
```

## Contributing

If you have suggestions for how chaas could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 GEUT <contact@geutstudio.com> (geutstudio.com)
