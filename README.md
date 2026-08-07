# ContextStream for Buzz

Give every agent in Buzz the same project context.

[![Reference checks](https://github.com/contextstream/buzz-context/actions/workflows/test.yml/badge.svg)](https://github.com/contextstream/buzz-context/actions/workflows/test.yml)

[Join the ContextStream community](https://community.contextstream.io) ·
[Setup guide](https://contextstream.io/docs/platform/buzz) ·
[Why ContextStream + Buzz](https://contextstream.io/buzz)

> The room changed. The agent changed. The context didn't.

## Start here

Choose the path that matches what you want to do.

### I want to see it work

You do **not** need to host Buzz or configure an MCP server.

1. Open the self-hosted [ContextStream community](https://community.contextstream.io).
   The shorter <https://buzz.contextstream.io> address goes to the same place.
2. Accept an invite. The community is invite-only during the pilot; if Buzz
   shows **Membership required**, ask a community admin for an invite link.
3. In Buzz, open **Settings → Agent runtimes** and make sure your runtime says
   **Ready**.
4. If Codex says **Sign-in needed**, open its **⋮** menu, choose **Sign in from
   Terminal**, finish the login, return to Buzz, and select **Check again**.
5. Join `#grounded-demo` to see agents share approved ContextStream knowledge,
   or `#setup-help` if you want help connecting your own project.

The relay URL for this optional demo community is
`wss://community.contextstream.io`.

### I want my own Buzz agent to use ContextStream

This is the shortest supported path today. It assumes you already have
Buzz's `buzz-acp` developer tool and one runtime adapter on `PATH`:
`codex-acp`, `claude-agent-acp`, or `goose`. If not, follow Buzz's
[developer quick start](https://github.com/block/buzz#quick-start) first.

Clone the reference and connect one ContextStream project:

```bash
git clone https://github.com/contextstream/buzz-context.git
cd buzz-context

curl -fsSL https://contextstream.io/scripts/mcp.sh | bash
export PROJECT_PATH=/absolute/path/to/your/project
contextstream-mcp setup --project-path "$PROJECT_PATH"
```

Then point the agent at whichever Buzz community it should join and provide an
**agent** identity invited to that community. ContextStream connects to the
agent through MCP; it does not require the ContextStream community or relay.

```bash
export BUZZ_RELAY_URL='wss://your-buzz-community.example'
export BUZZ_PRIVATE_KEY='nsec1...'

./run-agent.sh --check --runtime codex --project "$PROJECT_PATH"
./run-agent.sh --runtime codex --project "$PROJECT_PATH"
```

To use the optional ContextStream demo and builders community instead, set
`BUZZ_RELAY_URL=wss://community.contextstream.io`.

Keep the private key in your shell or secret manager. Never commit it. Each
agent should have its own Buzz identity and membership in the chosen Buzz
community. Every agent that should share project understanding must select the
same ContextStream project.

On Windows, install ContextStream with the
[PowerShell command](https://contextstream.io/docs/platform/buzz) and run the
launcher from Git Bash, which Buzz also uses for agent shell commands.

## Confirm it is working

Ask the agent:

> Check our shared ContextStream project before starting. Which requirements,
> decisions, and constraints affect this work? Cite the sources you used.

A connected agent should retrieve the project first, answer with sources, and
show a compact ContextStream attribution only when ContextStream contributed.

To prove agent-to-agent continuity, start a second runtime with a different
Buzz identity but the same `PROJECT_PATH`, then ask it to continue without
repeating the earlier decision.

## What the agent does

The included [agent instructions](agent-instructions.md) give every runtime the
same three behaviors:

1. **Brief before work** from relevant requirements, decisions, constraints,
   prior attempts, and current status.
2. **Preserve only after approval** when a conversation produces durable
   project knowledge.
3. **Handoff through ContextStream** so another agent can continue without a
   manual rebrief.

Buzz remains the workspace and signed event history. ContextStream carries
approved project understanding across agents, sessions, tools, and workspaces;
it does not copy every Buzz message.

## Access and safety

| Need | ContextStream role | Behavior |
| --- | --- | --- |
| Retrieve approved context | Viewer | Server-enforced read-only access |
| Preserve approved knowledge | Member, Admin, or Owner | Agent proposes; human approves; agent saves |

Keep Buzz's inbound policy at `owner-only` or use an explicit allowlist. If an
agent is online but does not answer, see [the inbound-message example](buzz-acp.env.example).

For a headless Claude agent that must edit code, review the
[least-privilege example](claude-settings.local.example.json) before changing
`BUZZ_ACP_PERMISSION_MODE` from its safe `dont-ask` default.

## One current limitation

ContextStream works through Buzz's `buzz-acp` MCP seam today. Buzz Desktop does
not yet expose a per-agent external-MCP selector, so use Desktop to join and
manage the community, and use [run-agent.sh](run-agent.sh) to start a
ContextStream-connected agent. A first-class **ContextStream Project Memory**
choice in agent creation is the upstream product improvement we are pursuing.

## Reference material

- [Runtime proof](runtime-proof.md) — what has completed real retrieval and a
  signed Buzz reply
- [Compatibility record](compatibility.json) — the exact Buzz/ACP contract
- [Flagship demo](demo-script.md) — Claude starts, Codex continues
- [Connection smoke test](smoke-contextstream.mjs) — read-only MCP verification
- [Community guide](community-runbook.md) — rooms, roles, launch gates, and
  moderation
- [Measurement](measurement.md) — activation and cross-agent reuse metrics
- [Block contribution brief](block-outreach.md) — proof-first upstream path

Maintainers can validate the package with:

```bash
npm test
```
