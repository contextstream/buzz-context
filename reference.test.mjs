import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("./", import.meta.url);

async function read(name) {
  return readFile(new URL(name, root), "utf8");
}

test("launcher supplies ContextStream through the verified Buzz seam", async () => {
  const launcher = await read("run-agent.sh");
  assert.match(launcher, /BUZZ_ACP_MCP_COMMAND/);
  assert.match(launcher, /contextstream-mcp/);
  assert.match(launcher, /CONTEXTSTREAM_MCP_ALIAS/);
  assert.match(launcher, /BUZZ_ACP_MCP_NAME/);
  assert.match(launcher, /--system-prompt-file/);
  assert.match(launcher, /BUZZ_ACP_RESPOND_TO:-owner-only/);
});

test("teaching includes brief, approval, handoff, and conditional attribution", async () => {
  const teaching = await read("agent-instructions.md");
  assert.match(teaching, /Brief before substantial work/);
  assert.match(teaching, /mcp__contextstream__/);
  assert.match(teaching, /Wait for an authorized human to approve/);
  assert.match(teaching, /entity\(kind="handoff", action="create"/);
  assert.match(
    teaching,
    /Omit the footer when ContextStream did\s+not materially contribute/,
  );
});

test("Claude headless policy is explicit and least-privilege by default", async () => {
  const settings = JSON.parse(await read("claude-settings.local.example.json"));
  const envExample = await read("buzz-acp.env.example");
  const allowed = settings.permissions.allow.join("\n");
  const denied = settings.permissions.deny.join("\n");

  assert.match(envExample, /BUZZ_ACP_PERMISSION_MODE=dont-ask/);
  assert.match(allowed, /mcp__contextstream__/);
  assert.match(allowed, /\/absolute\/path\/to\/buzz messages send/);
  assert.doesNotMatch(allowed, /\*buzz messages send/);
  assert.match(denied, /git reset/);
  assert.match(denied, /rm:/);
});

test("compatibility record pins the contract that was actually tested", async () => {
  const compatibility = JSON.parse(await read("compatibility.json"));
  assert.equal(compatibility.buzz.configuration_env, "BUZZ_ACP_MCP_COMMAND");
  assert.equal(compatibility.buzz.canonical_contextstream_server_name, "contextstream");
  assert.equal(compatibility.buzz.acp_field, "mcpServers");
  assert.equal(compatibility.buzz.desktop_per_agent_mcp_override, false);
  assert.match(compatibility.buzz.commit, /^[0-9a-f]{40}$/);
});

test("runtime proof never conflates process startup with sourced retrieval", async () => {
  const compatibility = JSON.parse(await read("compatibility.json"));
  const ledger = await read("runtime-proof.md");
  const matrix = compatibility.proof.runtime_matrix;

  assert.equal(matrix.claude.sourced_contextstream_retrieval, "passed");
  assert.equal(matrix.claude.signed_buzz_reply, "passed");
  assert.equal(matrix.codex.cross_agent_continuation, "pending_explicit_human_approval");
  assert.equal(matrix.goose.sourced_contextstream_retrieval, "not_yet_proven");
  assert.equal(matrix.goose.signed_buzz_reply, "not_yet_proven");
  assert.match(compatibility.proof.pass_standard, /signed Buzz reply/);
  assert.match(ledger, /Process startup.*not retrieval proof/is);
  assert.match(ledger, /open compatibility finding/i);
});

test("production and smoke clients remain separable for connector metrics", async () => {
  const teaching = await read("agent-instructions.md");
  const smoke = await read("smoke-contextstream.mjs");
  const measurement = await read("measurement.md");

  assert.match(teaching, /client_name="buzz-claude"/);
  assert.match(smoke, /client_name: `buzz-smoke-\$\{options\.actor\}`/);
  assert.match(measurement, /at least two different agent harnesses/i);
  assert.match(measurement, /raw MCP requests/i);
});

test("upstream contribution stays small and preserves the product boundary", async () => {
  const upstream = await read("upstream-doc.md");

  assert.match(upstream, /BUZZ_ACP_MCP_COMMAND/);
  assert.match(upstream, /session\/new\.mcpServers/);
  assert.match(upstream, /without replacing Buzz's event history/);
  assert.doesNotMatch(upstream, /install ContextStream as a Buzz dependency/i);
});

test("community runbook requires a real public relay and operator evidence", async () => {
  const runbook = await read("community-runbook.md");
  assert.match(runbook, /one-click Railway/);
  assert.match(runbook, /production\s+\[Compose bundle\]/);
  assert.match(runbook, /\/\_liveness/);
  assert.match(runbook, /working `wss:\/\//);
  assert.match(runbook, /tested backup and credential-rotation procedure/);
});

test("examples contain no live-looking ContextStream or Buzz secrets", async () => {
  const files = [
    await read("README.md"),
    await read("buzz-acp.env.example"),
    await read("demo-script.md"),
    await read("claude-settings.local.example.json"),
    await read("community-runbook.md"),
    await read("runtime-proof.md"),
  ].join("\n");
  assert.doesNotMatch(files, /cs_(live|test)_[A-Za-z0-9]{16,}/);
  assert.doesNotMatch(files, /nsec1[023456789acdefghjklmnpqrstuvwxyz]{24,}/);
});
