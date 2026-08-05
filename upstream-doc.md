# Proposed Buzz documentation: attach an external project-context MCP server

This file is PR-ready source for the smallest useful upstream contribution. Its
vendor-neutral explanation should remain in Buzz; the maintained ContextStream
details stay in the ContextStream repository.

## External MCP server

`buzz-acp` can attach one optional stdio MCP server to every ACP session it
creates. Set `BUZZ_ACP_MCP_COMMAND` to an executable on the agent host:

```bash
export BUZZ_ACP_MCP_COMMAND=/absolute/path/to/project-context-mcp
buzz-acp
```

The harness includes the command in `session/new.mcpServers`. The selected ACP
runtime is responsible for starting the server and exposing its tools to the
agent.

Treat the MCP process as part of the agent's authority boundary:

- install it from a trusted source;
- use an absolute path in production;
- keep credentials in the host's secret manager;
- scope the server credential to the minimum workspace/project role required;
- keep Buzz's inbound author gate at `owner-only` or an explicit allowlist;
- verify the command independently before inviting the agent into a room.

### ContextStream example

[ContextStream](https://contextstream.io/buzz) provides persistent, grounded
project context that can be shared by Claude Code, Codex, Goose, and other
authorized agents without replacing Buzz's event history.

```bash
contextstream-mcp setup --project-path /absolute/path/to/your/project
export BUZZ_ACP_MCP_COMMAND="$(command -v contextstream-mcp)"
buzz-acp
```

The maintained reference includes Buzz-specific agent teaching, permission
guidance, a connection smoke test, and a two-agent handoff scenario:

<https://github.com/contextstream/buzz-context>

Buzz remains the collaboration workspace and signed event log. ContextStream
preserves approved requirements, decisions, constraints, lessons, plans, and
handoffs that should travel beyond one room or agent.
