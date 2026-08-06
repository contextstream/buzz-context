# Buzz runtime proof ledger

Last verified: 2026-08-06

This ledger separates three different claims that are easy to blur together:

1. Buzz knows how to launch a runtime.
2. Buzz passes a ContextStream MCP server through ACP `session/new`.
3. The runtime materially retrieves ContextStream knowledge and publishes a
   signed Buzz reply.

Only the third claim is an end-to-end retrieval pass. Process startup, online
presence, an initialized ACP session, or a spawned MCP child process are useful
diagnostics, but they are not retrieval proof.

## Current matrix

| Runtime | Buzz + ACP startup | Canonical ContextStream MCP | Sourced signed Buzz reply | Current result |
| --- | --- | --- | --- | --- |
| Claude Code 2.1.221 through `claude-agent-acp` 0.65.0 | Pass | Pass | Pass | End-to-end proven; the disposable fixture passed 5/5 tests |
| Codex CLI 0.146.1 through `codex-acp` 1.1.9 | Pass | Pass | Approval-gated | The second-agent continuation is deliberately waiting for explicit human approval |
| Goose 1.45.0 | Pass | MCP process starts | Not yet proven | An explicit mention enters the session, but the bounded run remains in extension initialization without a signed reply |

The Buzz harness contract supports all three runtimes. The matrix above records
what has actually completed with ContextStream rather than treating contract
support as end-to-end proof.

## Claude evidence

The Claude agent used its own Buzz identity and the same isolated ContextStream
project used by the continuing Codex agent. It retrieved the project PRD, ADR,
constraint, and repository map through `mcp__contextstream__*`, implemented the
approved 24-hour baseline, passed all five fixture tests, and published signed
Buzz reply event:

`5a7dc066781234a012ef8efe406e29fbb62a18b6949f003ad3fb9a377053e53e`

The later 30-minute admin-expiry proposal was neither preserved nor
implemented. It remains behind the documented human-approval gate.

## Goose finding

A clean Goose 1.45.0 binary passed `run-agent.sh --check`, initialized through
the pinned Buzz `buzz-acp`, authenticated to the relay with a distinct identity,
joined its private proof channel, and published online presence. Two model
provider paths were exercised:

- `claude-acp` through `@agentclientprotocol/claude-agent-acp` 0.65.0;
- `codex-acp` through `@agentclientprotocol/codex-acp` 1.1.9.

For both, an explicit Buzz mention entered a new Goose session and Goose
started the executable named `contextstream` in the selected project working
directory. The bounded run then remained in extension initialization and did
not publish a signed answer. Changing the outer Buzz permission mode from
`dontAsk` to `acceptEdits` did not change that stop, so permission wiring alone
does not explain it.

This is an open compatibility finding, not a successful retrieval. Keep Goose
in the launcher because Buzz supports it, but do not market Goose as
end-to-end verified until the signed-reply criterion below passes.

## Reproduction and pass criterion

1. Install and authenticate ContextStream, Buzz, and the runtime.
2. Run the read-only MCP smoke test.
3. Run `run-agent.sh --check` for the selected runtime.
4. Give the agent a distinct Buzz identity and add it to a private channel.
5. Start the agent with the canonical ContextStream alias from `run-agent.sh`.
6. Send an explicit Buzz mention asking for a known ContextStream requirement,
   decision, and constraint; prohibit edits and durable writes.
7. Read the resulting Buzz thread from the relay.

A runtime passes only when the thread contains a signed reply from that
runtime's distinct identity and the answer cites the attached ContextStream
sources. Record the runtime versions and reply event ID in
[`compatibility.json`](compatibility.json). A typing reaction, online presence,
or MCP subprocess is not sufficient.
