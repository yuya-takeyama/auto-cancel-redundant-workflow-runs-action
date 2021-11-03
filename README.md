# Auto-cancel redundant Workflow Runs

**🛑 This project is archived 🛑**

You can do it better using [`concurrency` with `cancel-in-progress: true`](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#concurrency).

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
