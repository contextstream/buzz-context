# ContextStream for Buzz

Give every agent in Buzz the same project context.

[![Reference checks](https://github.com/contextstream/buzz-context/actions/workflows/test.yml/badge.svg)](https://github.com/contextstream/buzz-context/actions/workflows/test.yml)

This reference package connects the `contextstream-mcp` stdio server to an
agent launched by Buzz's `buzz-acp` harness. Claude Code, Codex, Goose, and any
other conforming ACP agent can then retrieve the same approved ContextStream
project knowledge before work, preserve durable decisions after human
approval, and hand work to another agent without a manual rebrief.

> The room changed. The agent changed. The context didn't.

## What is verified today

This package was checked on 2026-08-05 against
[`block/buzz@06b60e6`](https://github.com/block/buzz/commit/06b60e682d5dd78e6cdcb8e93fe96c7ec4391e2a).

- `buzz-acp` accepts an optional stdio MCP command through
  `BUZZ_ACP_MCP_COMMAND`.
- It serializes that command into the ACP `session/new` request as an
  `mcpServers` entry with the required `name`, `command`, `args`, and `env`
  fields.
- The same harness supports Goose, Codex through `codex-acp`, and Claude Code
  through `claude-agent-acp`.
- `contextstream-mcp` works as that stdio command and connects to the hosted
  ContextStream service after normal ContextStream setup.

Buzz records collaboration inside a Buzz community. ContextStream carries
durable project understanding across agents, sessions, tools, and workspaces.
The integration does not copy every Buzz message or replace Buzz history.

## Five-minute setup

### 1. Install and authenticate ContextStream

macOS or Linux:

```bash
curl -fsSL https://contextstream.io/scripts/mcp.sh | bash
contextstream-mcp setup --project-path /absolute/path/to/your/project
contextstream-mcp verify-key
```

Windows PowerShell:

```powershell
irm https://contextstream.io/scripts/mcp.ps1 | iex
contextstream-mcp setup --project-path C:\absolute\path\to\your\project
contextstream-mcp verify-key
```

Select the ContextStream workspace and project that every Buzz agent should
share. Use a Viewer account for server-enforced read-only access. Use a Member,
Admin, or Owner account when the agent should be able to preserve approved
knowledge.

### 2. Install Buzz and an ACP runtime

Follow Buzz's
[developer quick start](https://github.com/block/buzz#quick-start) so
`buzz-acp` and `buzz` are on `PATH`. Install at least one supported runtime:

- Goose: `goose`
- Codex: `codex-acp`
- Claude Code: `claude-agent-acp`

Buzz agents need their normal `BUZZ_PRIVATE_KEY` and relay membership. Follow
Buzz's [key-generation and membership steps](https://github.com/block/buzz/tree/main/crates/buzz-acp#generating-keys),
mint a distinct identity for every agent, and keep each private key in the
environment or a secret manager—never in this repository.

### 3. Check the connection

From this repository:

```bash
node smoke-contextstream.mjs --project /absolute/path/to/your/project
./run-agent.sh --check --runtime codex --project /absolute/path/to/your/project
```

The smoke check starts the real `contextstream-mcp` process, negotiates MCP,
confirms the required tools, initializes the selected project, and grounds a
test turn. It performs no durable write.

### 4. Start the first Buzz agent

```bash
export BUZZ_PRIVATE_KEY='nsec1...'
export BUZZ_RELAY_URL='ws://localhost:3000'

# Directly generated agents may not have Buzz owner metadata. In that case,
# use an explicit human pubkey allowlist so the safe owner-only default does
# not drop every inbound message.
export BUZZ_ACP_RESPOND_TO='allowlist'
export BUZZ_ACP_RESPOND_TO_ALLOWLIST='<your-human-64-char-hex-pubkey>'

./run-agent.sh \
  --runtime claude \
  --project /absolute/path/to/your/project
```

The launcher supplies `contextstream-mcp` to `buzz-acp` and installs the
Buzz-specific behavior in [agent-instructions.md](agent-instructions.md).
If the agent was created through a path that records its owner, omit the two
allowlist variables and retain the launcher's `owner-only` default.

### 5. Start a second agent on the same project

Use a distinct Buzz identity, but the same ContextStream project:

```bash
export BUZZ_PRIVATE_KEY='nsec1...second-agent...'

./run-agent.sh \
  --runtime codex \
  --project /absolute/path/to/your/project
```

Add both agents to the appropriate Buzz room. Ask the first agent a project
question, approve one durable decision for preservation, then ask the second
agent to continue the work without restating that decision.

## The agent contract

The included teaching creates three visible behaviors:

1. **Brief before work.** The agent initializes and grounds against the shared
   ContextStream project before substantial work.
2. **Preserve after approval.** It proposes a concise durable record and waits
   for a human to approve the write.
3. **Handoff through ContextStream.** It creates a canonical ContextStream
   handoff when another agent or session will continue.

When ContextStream materially contributes, the agent adds a compact,
non-promotional provenance footer. It never invents source counts or freshness.

## Permissions

Use both systems' permission boundaries:

| Boundary | Read-only setup | Read/write setup |
| --- | --- | --- |
| ContextStream | Viewer workspace role | Member, Admin, or Owner role |
| Buzz inbound messages | `owner-only` or an explicit allowlist | Same; widen only deliberately |
| Durable preservation | Agent must not call write tools | Agent proposes, human approves, then agent writes |

The teaching layer is not an authorization layer. Server-enforced read-only
access comes from the ContextStream workspace role attached to the credential.

## Headless and hosted agents

`contextstream-mcp setup` is preferred on a developer machine. For a headless
Buzz agent, provide `CONTEXTSTREAM_API_KEY` through the deployment's secret
manager and never through a committed env file. The key inherits the user's
ContextStream workspace permissions.

## Current Buzz Desktop limitation

Buzz Desktop currently derives the MCP command from its compiled runtime
catalog. Its create/update agent API accepts `mcpCommand` only for wire
compatibility and deliberately ignores per-agent overrides. In the current
catalog, Codex and Buzz Agent receive `buzz-dev-mcp`; Goose and Claude do not
receive an extra MCP command from Desktop.

Therefore this reference uses the supported `buzz-acp` environment seam
directly. A first-class **ContextStream Project Memory** selector in Buzz
Desktop requires a small upstream product change: let an agent template select
an approved MCP command (and project credential) without permitting arbitrary
binary execution. The compatibility record is in
[compatibility.json](compatibility.json).

## Included assets

- [run-agent.sh](run-agent.sh) — safe launcher for Goose, Codex, and Claude
- [agent-instructions.md](agent-instructions.md) — brief, preserve, handoff,
  and attribution behavior
- [smoke-contextstream.mjs](smoke-contextstream.mjs) — real stdio MCP and
  hosted-grounding smoke test
- [demo-script.md](demo-script.md) — reproducible 60–90 second flagship demo
- [demo/fixture](demo/fixture) — disposable signed-invitation repository used
  for the Claude-to-Codex continuity proof
- [community-runbook.md](community-runbook.md) — public ContextStream Builders
  community launch checklist
- [block-outreach.md](block-outreach.md) — concise proof-first outreach and
  upstream contribution brief
- [upstream-doc.md](upstream-doc.md) — PR-ready vendor-neutral Buzz docs copy
- [compatibility.json](compatibility.json) — exact upstream contract verified
- [measurement.md](measurement.md) — north-star and activation measurement
  contract, including smoke-traffic exclusion

## Validate this reference

```bash
npm test
```

The upstream Buzz compatibility tests used while producing this package were:

```bash
cargo test -p buzz-acp mcp_command
cargo test -p buzz-acp session_new_mcp_server_has_required_fields
```

## Product boundary

ContextStream does not become the database for every Buzz message. Buzz remains
the signed event log and collaboration surface. ContextStream preserves
approved requirements, decisions, constraints, lessons, plans, and handoffs so
authorized humans can reach the same understanding through every authorized
agent.
