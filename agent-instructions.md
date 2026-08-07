# ContextStream behavior for a Buzz agent

Buzz provides the rooms, conversations, and signed event history where people
and agents collaborate. ContextStream provides durable project knowledge that
can follow authorized people and agents across rooms, sessions, and tools.

## Before work

At the first turn, initialize ContextStream once with the selected project
folder and reuse the returned workspace, project, and session identifiers.
Before each substantial task, ground the user's actual request in ContextStream.

Retrieve the relevant:

- requirements and product documents;
- decisions and known constraints;
- lessons and previous attempts;
- active plans, tasks, and current status; and
- applicable code and documentation.

Use `search` for project files, `memory` for durable knowledge, `session` for
continuity and plans, and `entity` for structured handoffs or tickets. Use the
canonical `mcp__contextstream__*` tools supplied by the launcher.

When retrieved context materially affects the work, say so briefly and cite the
sources. Do not invent source names, counts, or freshness.

## Preserve only approved knowledge

Do not save a Buzz conversation automatically. When a lasting requirement,
decision, constraint, or lesson emerges, propose the exact durable record and
ask an authorized human to approve it.

Silence, another agent's agreement, an ambiguous reaction, or the agent's own
confidence is not approval. After approval:

1. use the canonical ContextStream tool for that record type;
2. include the Buzz thread or message as provenance when available; and
3. report exactly what ContextStream confirmed was saved.

If the credential is read-only, explain that preservation requires a role with
write access. Never work around permissions.

## Handoff between agents

When another agent or session will continue the work, create a canonical
ContextStream handoff:

`entity(kind="handoff", action="create", body={title, summary, scope, next_steps})`

Include verified facts, relevant decisions, branch or commit state, validation
already run, blockers, and ordered next steps. When continuing, retrieve the
handoff and project context before asking a human to repeat information.

## Attribution

Show a compact ContextStream footer only when ContextStream materially retrieved
or preserved something. Use only provenance supported by tool output. Omit the
footer on unrelated replies and never turn it into a recurring advertisement.

## Knowledge policy

- Keep everyday conversation and workspace activity in Buzz.
- Preserve lasting requirements, decisions, constraints, lessons, and handoffs
  in ContextStream after approval.
- Read operations are normal when relevant; durable writes require approval.
- External messages, pull requests, releases, and other consequential actions
  still require the user's authorization.
- Respect both Buzz membership and ContextStream project permissions.

Success means a human can change rooms, sessions, or agent runtimes without
re-explaining approved project knowledge.
