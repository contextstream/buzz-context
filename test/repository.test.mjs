import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function read(name) {
  return readFile(new URL(name, root), "utf8");
}

test("repository ships the integration files", async () => {
  const ignored = new Set([".git", "node_modules"]);
  const actual = (await readdir(root))
    .filter((name) => !ignored.has(name))
    .sort();
  const expected = [
    ".github",
    ".gitignore",
    "CONTRIBUTING.md",
    "LICENSE",
    "README.md",
    "agent-instructions.md",
    "buzz-acp.env.example",
    "package.json",
    "run-agent.sh",
    "smoke-contextstream.mjs",
    "test",
  ].sort();

  assert.deepEqual(actual, expected);
});

test("README explains the integration and provides a runnable setup", async () => {
  const readme = await read("README.md");

  assert.match(readme, /Shared context for every agent in Buzz/i);
  assert.match(readme, /any Buzz community/i);
  assert.match(readme, /do not need to\s+install it again for Buzz/i);
  assert.match(readme, /codex mcp list/);
  assert.match(readme, /claude mcp list/);
  assert.match(readme, /Team Instructions/);
  assert.match(readme, /one Buzz team mapped to one ContextStream project/i);
  assert.match(readme, /workspace and project IDs are not required/i);
  assert.match(readme, /YOUR_WORKSPACE workspace and\s+YOUR_PROJECT project/i);
  assert.match(readme, /Pin exact IDs only when needed/i);
  assert.match(readme, /workspace_id \"YOUR_WORKSPACE_ID\"/);
  assert.match(readme, /project_id\s+\"YOUR_PROJECT_ID\"/);
  assert.match(readme, /If the workspace or project cannot be\s+resolved unambiguously/i);
  assert.match(readme, /Never reuse the last project silently/i);
  assert.match(readme, /curl -fsSL https:\/\/contextstream\.io\/scripts\/mcp\.sh \| bash/);
  assert.match(readme, /irm https:\/\/contextstream\.io\/scripts\/mcp\.ps1 \| iex/);
  assert.match(readme, /run-agent\.sh --runtime codex .* --check/);
  assert.match(readme, /Cite the sources\s+used/i);
  assert.match(readme, /does not copy every\s+Buzz message/i);
  assert.doesNotMatch(readme, /setup --project-path/);
  assert.ok(readme.split("\n").length <= 225, "README should remain easy to scan");
});

test("README local links resolve", async () => {
  const readme = await read("README.md");
  const targets = [...readme.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
    .map((match) => match[1])
    .filter((target) => !/^(?:https?:|#)/.test(target));

  await Promise.all(targets.map((target) => access(new URL(target, root))));
});

test("launcher supplies the canonical ContextStream MCP with safe defaults", async () => {
  const launcher = await read("run-agent.sh");

  assert.match(launcher, /BUZZ_ACP_MCP_COMMAND/);
  assert.match(launcher, /CONTEXTSTREAM_MCP_ALIAS/);
  assert.match(launcher, /--system-prompt-file/);
  assert.match(launcher, /BUZZ_ACP_RESPOND_TO:-owner-only/);
  assert.match(launcher, /BUZZ_RELAY_URL is required/);
  assert.match(launcher, /BUZZ_PRIVATE_KEY is required/);
});

test("launcher check succeeds with an explicit relay, identity, runtime, and project", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "buzz-context-check-"));
  const bin = join(fixture, "bin");
  const project = join(fixture, "project");
  await mkdir(bin);
  await mkdir(project);

  await writeFile(
    join(bin, "contextstream-mcp"),
    `#!/usr/bin/env bash
if [[ "\${1:-}" == "--version" ]]; then
  printf '%s\\n' 'contextstream-mcp test'
elif [[ "\${1:-}" == "verify-key" ]]; then
  printf '%s\\n' '{"valid":true}'
fi
`,
    { mode: 0o755 },
  );
  for (const command of ["buzz-acp", "codex-acp"]) {
    await writeFile(join(bin, command), "#!/usr/bin/env bash\nexit 0\n", {
      mode: 0o755,
    });
  }

  const result = spawnSync(
    "bash",
    [
      new URL("run-agent.sh", root).pathname,
      "--runtime",
      "codex",
      "--project",
      project,
      "--check",
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        BUZZ_RELAY_URL: "wss://team.example",
        BUZZ_PRIVATE_KEY: "test-only-placeholder",
        CONTEXTSTREAM_BUZZ_BIN_DIR: join(fixture, "contextstream-bin"),
      },
    },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /local check passed/i);
  assert.match(result.stdout, /runtime: codex \(codex-acp\)/);
  assert.match(result.stdout, /relay:\s+wss:\/\/team\.example/);
});

test("agent teaching covers grounding, approval, handoff, and attribution", async () => {
  const teaching = await read("agent-instructions.md");

  assert.match(teaching, /Before each substantial task, ground/i);
  assert.match(teaching, /authorized human to approve/i);
  assert.match(teaching, /entity\(kind="handoff", action="create"/);
  assert.match(teaching, /footer only when ContextStream materially/i);
  assert.match(teaching, /lasting requirements, decisions, constraints, lessons, and handoffs/i);
});

test("configuration uses safe placeholders", async () => {
  const env = await read("buzz-acp.env.example");

  assert.match(env, /BUZZ_RELAY_URL=wss:\/\/your-buzz-community\.example/);
  assert.match(env, /BUZZ_PRIVATE_KEY=nsec1_replace_me/);
  assert.match(env, /BUZZ_ACP_RESPOND_TO=owner-only/);
  assert.doesNotMatch(env, /cs_(live|test)_[A-Za-z0-9]{16,}/);
  assert.doesNotMatch(env, /nsec1[023456789acdefghjklmnpqrstuvwxyz]{24,}/);
});

test("documentation keeps credentials out of source control", async () => {
  const publicText = [
    await read("README.md"),
    await read("CONTRIBUTING.md"),
    await read("agent-instructions.md"),
    await read("buzz-acp.env.example"),
  ].join("\n");

  assert.match(publicText, /secret manager/i);
  assert.doesNotMatch(publicText, /cs_(live|test)_[A-Za-z0-9]{16,}/);
  assert.doesNotMatch(publicText, /nsec1[023456789acdefghjklmnpqrstuvwxyz]{24,}/);
});
