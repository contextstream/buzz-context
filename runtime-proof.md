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
| Goose 1.45.0 through `codex-acp` 1.1.9 | Pass | Pass | Pass | End-to-end proven; the signed reply retrieved and cited the demo PRD, ADR, and constraint |

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

## Goose evidence

A clean Goose 1.45.0 binary passed `run-agent.sh --check`, initialized through
the pinned Buzz `buzz-acp`, authenticated to the relay with a distinct identity,
joined its private proof channel, and published online presence. Two model
provider paths were exercised:

- `claude-acp` through `@agentclientprotocol/claude-agent-acp` 0.65.0;
- `codex-acp` through `@agentclientprotocol/codex-acp` 1.1.9.

The passing run used `codex-acp`, Buzz `acceptEdits`, and Goose `approve`. An
explicit mention event
`7cd2bb8559f97c3039ad1b4b7b18f3d29b27559942d97b86d208ee287d8d0849`
asked Goose to retrieve the approved invitation expiry, signed-token decision,
and no-new-store constraint without editing or preserving anything. Goose used
the canonical `contextstream` MCP server and published reply event
`be9a51d597dc1514c3e93604f3f879fb1f5c6a3aadcdc3a16d9b2dc471f96401`.
The answer cited:

- `DEMO — Invitation expiry requirements`
  (`31a6b6f7-099e-404f-b2e8-899d314c188d`);
- `DEMO ADR — Signed single-use invitation tokens`
  (`2fbc4197-de18-43e6-8d23-1e5f25e53fc9`);
- `DEMO constraint — no new invitation session store`
  (`d1ff8fcc-cf4e-4478-96e9-e80edc1f1450`).

The stored Nostr event was independently checked after retrieval: its computed
event hash matches its ID, its BIP-340 signature is valid, its author is the
distinct Goose identity, and its reply tag points to the explicit mention.

Separate later diagnostic runs did not finish within their observation window.
A wire trace showed a valid MCP initialize exchange followed by a complete
30-tool, 110,594-byte `tools/list` response. Reducing that response to eight
tools and 47,345 bytes did not make the later run complete. The successful
full-catalog run above and the reduced-catalog stall mean the evidence does not
support a simple tool-list-size incompatibility. Keep the intermittent startup
behavior as a diagnostic follow-up; it does not erase the verified pass.

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
