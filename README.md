# ContextStream for Buzz

## Shared context for every agent in Buzz

ContextStream gives Codex, Claude Code, Goose, and other Buzz agents the same
grounded project knowledge.

- Stop re-explaining the project when work moves between agents or rooms.
- Keep agents aligned with approved requirements, decisions, and constraints.
- Get answers backed by sources instead of vague recollections.
- Carry project understanding between Buzz and the other tools your team uses.

ContextStream works with **any Buzz community**. Joining the optional
[ContextStream Builders community](https://community.contextstream.io) is not
required.

## Quick start

If ContextStream already works in Codex or Claude Code, you do not need to
install it again for Buzz. Buzz starts that existing runtime, which loads its
existing MCP configuration.

### 1. Confirm the connection

Run the command for your agent runtime:

```bash
codex mcp list
# or
claude mcp list
```

Look for `contextstream` in the result. Then open **Buzz → Settings → Agent
runtimes** and make that runtime **Ready**.

### 2. Tell a Buzz team which project to use

Create or edit a Buzz team and select every agent that should share the same
project context. Add this to **Team Instructions**, replacing the workspace and
project names:

```text
Use ContextStream for this team's work with the YOUR_WORKSPACE workspace and
YOUR_PROJECT project. Before substantial work, initialize that project, ground
the current request in it, and use relevant sourced context. Cite the sources
used when they affect the answer. If the workspace or project cannot be
resolved unambiguously, show me the matches and ask which one to use. Ask
before saving anything.
```

Names are enough for normal setup; workspace and project IDs are not required.

Save the team, then start its agents. Restart an already-running agent if Buzz
shows that a restart is required or it continues using older instructions.

One Buzz team mapped to one ContextStream project is the recommended default.
The agents can use different runtimes; the shared Team Instructions keep their
context consistent.

### 3. Verify the handoff

Ask one agent:

> State the ContextStream workspace and project you are using. Ground this
> request there, then summarize the requirements, decisions, and constraints
> that currently matter. Cite the sources you used. Do not save anything.

Ask a second agent on the same team to continue from that context. Both should
report the same project and retrieve the same approved project knowledge
without a manual rebrief.

## If ContextStream is not connected

Install ContextStream MCP from the project folder you want to connect.

### macOS / Linux

```bash
cd /absolute/path/to/your/project
curl -fsSL https://contextstream.io/scripts/mcp.sh | bash
```

### Windows PowerShell

```powershell
Set-Location 'C:\path\to\your\project'
irm https://contextstream.io/scripts/mcp.ps1 | iex
```

The wizard signs you in, lets you choose or create a ContextStream workspace
and project, and configures the runtimes you select. Restart the runtime when
setup finishes, confirm it with `codex mcp list` or `claude mcp list`, and then
return to Buzz.

## Choose the mapping that fits your work

A Buzz team and a ContextStream workspace are different concepts. You choose
how they map:

| Need | Configuration |
| --- | --- |
| Several agents sharing one project | **Recommended:** name the workspace and project in Team Instructions. |
| Let the team choose a project | Name the workspace and tell the agent to show available projects and ask. |
| Choose a project for each task | Name only the workspace and require the agent to ask before work. |
| Different defaults for agents on one team | Put the workspace and project names in each agent's instructions instead. |
| Different projects by room | Use a project-bound agent per room, or an explicit room-to-project map. |
| Search several projects | Name the authorized projects for the read; keep one explicit destination for writes. |

Team Instructions are layered into each selected agent's prompt when Buzz
starts it. Agent instructions can therefore add specialized behavior without
duplicating the shared project policy. See Buzz's
[team-instruction implementation](https://github.com/block/buzz/blob/f53bbd1152464ecbb1de495e2d1d959e156138f0/crates/buzz-acp/src/pool.rs#L1304-L1317).

## What ContextStream adds

Connected agents can:

1. **Brief before work** from relevant requirements, decisions, constraints,
   prior attempts, code, documentation, and current status.
2. **Preserve after approval** when a conversation produces knowledge that
   should outlive the thread.
3. **Handoff through ContextStream** so another authorized agent can continue
   without asking people to repeat project history.

Buzz remains the collaboration workspace and signed event history.
ContextStream carries reusable project understanding between authorized agents
and tools. It does not copy every Buzz message or remember workplace chatter
automatically.

## Advanced setups

### Pin exact IDs only when needed

Names are the easiest default. Pin IDs only when names collide, an automated
setup requires deterministic routing, or you want an explicit immutable scope:

```text
Use ContextStream workspace_id "YOUR_WORKSPACE_ID" and project_id
"YOUR_PROJECT_ID" as this team's default context. Initialize ContextStream
with these exact IDs before substantial work. Do not switch projects unless
the user explicitly asks. Before a durable write, state the destination
project and ask for approval.
```

### Ask on every task

For a flexible team that works across many projects, use:

```text
Use ContextStream with the YOUR_WORKSPACE workspace. Before substantial work,
list the relevant projects and ask which one to use. Initialize the selected
project. Never reuse the last project silently. Before a durable write, state
the destination project and ask for approval.
```

This is more flexible than a pinned team, but adds a selection step to each
new task.

### Map rooms to projects

If one agent must serve several rooms, add an explicit map to its instructions:

```text
#api    -> ACME workspace, API project
#mobile -> ACME workspace, Mobile project

If a room has no mapping, ask which project to use. Never guess or reuse the
last active project.
```

### Run a project-bound agent from the command line

The included launcher is for explicit project-directory selection, custom or
self-hosted Buzz relays, and headless agents:

```bash
git clone https://github.com/contextstream/buzz-context.git
cd buzz-context

export BUZZ_RELAY_URL='wss://your-buzz-community.example'
export BUZZ_PRIVATE_KEY='nsec1...'

./run-agent.sh --runtime codex --project /absolute/path/to/your/project --check
./run-agent.sh --runtime codex --project /absolute/path/to/your/project
```

The launcher also supports `--runtime claude` and `--runtime goose`. It
requires `buzz-acp`, the selected ACP runtime, and `contextstream-mcp` on
`PATH`.

### Permissions

- Use a ContextStream Viewer credential for retrieval-only agents.
- Give write access only to agents that preserve human-approved knowledge.
- Keep Buzz inbound access at `owner-only` or use an explicit allowlist.
- Keep Buzz identities, model-provider credentials, and ContextStream
  credentials in a secret manager—never in the repository.

See [agent-instructions.md](agent-instructions.md) for reusable agent behavior
and [buzz-acp.env.example](buzz-acp.env.example) for launcher options.

## Help

- [ContextStream Buzz guide](https://contextstream.io/docs/platform/buzz)
- [Official Codex MCP documentation](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
- [Official Claude Code MCP documentation](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [Buzz ACP documentation](https://github.com/block/buzz/tree/main/crates/buzz-acp)
- [Optional ContextStream Builders community](https://community.contextstream.io)
