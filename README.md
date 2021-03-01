<p align="center">
  <a href="https://github.com/yuya-takeyama/auto-cancel-redundant-workflow-runs-action"><img alt="auto-cancel-redundant-workflow-runs-action status" src="https://github.com/yuya-takeyama/auto-cancel-redundant-workflow-runs-action/workflows/build-test/badge.svg"></a>
</p>

# Auto-cancel redundant Workflow Runs

## Usage

```yaml
on:
  workflow_run:
    workflows:
      - '**'
    branches-ignore:
      - main
    types:
      - requested

jobs:
  auto-cancel:
    runs-on: ubuntu-latest
    steps:
      - uses: yuya-takeyama/auto-cancel-redundant-workflow-runs-action@v0.1.0
        with:
          github-token: ${{ secrets.REPO_GITHUB_TOKEN }}
```

## Inputs

| Name              | Required | Default | Description                               |
|-------------------|----------|---------|-------------------------------------------|
| `github-token`    | `true`   |         | GitHub API token                          |

### Required scopes for `github-token`

* `repo`

`secrets.GITHUB_TOKEN` doesn't work for it.
