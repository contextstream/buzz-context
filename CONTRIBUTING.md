# Contributing

Thanks for helping make ContextStream easier to use with Buzz.

Issues and pull requests are welcome for launcher improvements, runtime
compatibility, setup guidance, agent behavior, and verification coverage.

## Before opening a pull request

Run the local checks:

```bash
npm test
bash -n run-agent.sh
```

When a change affects the MCP connection, also run the authenticated smoke
check against a test project:

```bash
npm run smoke -- --project /absolute/path/to/a/test/project
```

## Contribution guidelines

- Verify Buzz flags and environment variables against the current
  [`buzz-acp` documentation](https://github.com/block/buzz/tree/main/crates/buzz-acp).
- Keep the default reply policy narrow and require human approval before an
  agent preserves durable project knowledge.
- Use placeholders in examples and tests. Never commit credentials, private
  project content, or customer data.
- Add or update tests when behavior changes.
- Keep setup instructions short enough for a new user to follow end to end.
