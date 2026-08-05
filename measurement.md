# Buzz connector measurement contract

The north-star metric is:

> Buzz workspaces where at least two different agent harnesses successfully use
> the same ContextStream project in a calendar week.

This is an outcome metric, not a count of raw MCP requests.

## Client identity convention

Production Buzz agents must send one of these `client_name` values on `init`
and `context`:

- `buzz-claude`
- `buzz-codex`
- `buzz-goose`
- `buzz-custom-<stable-harness-id>`

Reference smoke checks use `buzz-smoke-<actor>` and must be excluded from
product analytics. A restarted agent should keep its harness name but use a new
session identifier.

## North-star eligibility

Count one ContextStream project for one ISO week only when all conditions hold:

1. At least two distinct production `client_name` harness values beginning with
   `buzz-` successfully call `context` against the same project.
2. Each successful grounding returns non-empty task-relevant context. Transport
   initialization, `tools/list`, failed requests, and smoke sessions do not count.
3. At least one of the two harnesses uses a durable project item written before
   that turn, or retrieves a canonical handoff created for continuation.
4. Access stays within the workspace and project permissions attached to each
   credential.

Group by ContextStream `workspace_id`, `project_id`, and ISO week. Count the
project once regardless of additional calls or agents.

## Supporting metrics

| Metric | Definition |
| --- | --- |
| Buzz projects connected | Distinct projects with a successful production `buzz-*` init |
| Time to first successful retrieval | Time from a project's first production Buzz init to its first non-empty grounded context response |
| Retrieval within five minutes | Percentage of newly connected projects whose first successful retrieval occurs within 300 seconds |
| Agents connected per project | Distinct production Buzz harness identities with a successful init in 30 days |
| Multi-harness projects | Projects with two or more production Buzz harness values in 30 days |
| Approved records preserved from Buzz | Durable writes from a production Buzz session with explicit approval recorded in provenance |
| Reused by a second agent | A durable item written or first used by one Buzz harness and later retrieved by a different Buzz harness |
| Reused outside Buzz | A Buzz-originated durable item later retrieved by a non-`buzz-*` client |
| Seven-day connected-project retention | Projects with qualifying Buzz use in the week after first use |

## Funnel diagnostics

The `/buzz` page already emits the site's standard page, scroll-depth, and
time-on-page analytics. Diagnose the setup funnel in this order:

1. `/buzz` viewed;
2. setup guide viewed;
3. production `buzz-*` init succeeded;
4. first non-empty grounding succeeded;
5. second harness used the same project;
6. an approved record or handoff crossed the harness boundary;
7. the record was reused outside Buzz.

Landing-page events explain awareness. Hosted ContextStream session and
provenance data establish activation and cross-agent reuse. Never add hidden
telemetry to the launcher or collect Buzz private keys, prompts, room contents,
or ContextStream API keys for measurement.

## Weekly review

Report the north star, five-minute activation rate, second-harness conversion,
and outside-Buzz reuse together. A rise in MCP calls without a rise in
cross-harness reuse is not connector success.
