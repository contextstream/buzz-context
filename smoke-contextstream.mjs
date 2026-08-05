#!/usr/bin/env node

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline";

function parseArgs(argv) {
  const options = {
    actor: "buzz-smoke",
    project: process.cwd(),
    command: process.env.CONTEXTSTREAM_MCP_COMMAND || "contextstream-mcp",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--actor" || arg === "--project" || arg === "--command") {
      const value = argv[index + 1];
      if (!value) throw new Error(`Missing value for ${arg}`);
      options[arg.slice(2)] = value;
      index += 1;
      continue;
    }
    if (arg === "-h" || arg === "--help") {
      console.log(
        "Usage: smoke-contextstream.mjs [--actor NAME] [--project ABSOLUTE_PATH] [--command PATH]",
      );
      process.exit(0);
    }
    throw new Error(`Unknown option: ${arg}`);
  }

  options.project = path.resolve(options.project);
  return options;
}

class McpClient {
  constructor(command, cwd) {
    this.nextId = 1;
    this.pending = new Map();
    this.stderr = "";
    this.child = spawn(command, [], {
      cwd,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.child.stderr.setEncoding("utf8");
    this.child.stderr.on("data", (chunk) => {
      this.stderr += chunk;
      if (this.stderr.length > 12_000) this.stderr = this.stderr.slice(-12_000);
    });

    const lines = readline.createInterface({ input: this.child.stdout });
    lines.on("line", (line) => {
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        return;
      }
      if (message.id === undefined) return;
      const waiter = this.pending.get(message.id);
      if (!waiter) return;
      this.pending.delete(message.id);
      clearTimeout(waiter.timer);
      if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
      else waiter.resolve(message.result);
    });

    this.child.on("exit", (code, signal) => {
      if (this.pending.size === 0) return;
      const detail = this.stderr.trim();
      const error = new Error(
        `contextstream-mcp exited before replying (code=${code}, signal=${signal})${detail ? `: ${detail}` : ""}`,
      );
      for (const waiter of this.pending.values()) {
        clearTimeout(waiter.timer);
        waiter.reject(error);
      }
      this.pending.clear();
    });
  }

  send(message) {
    this.child.stdin.write(`${JSON.stringify(message)}\n`);
  }

  request(method, params = {}, timeoutMs = 20_000) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.send({ jsonrpc: "2.0", id, method, params });
    });
  }

  notify(method, params = {}) {
    this.send({ jsonrpc: "2.0", method, params });
  }

  async tool(name, args, timeoutMs = 30_000) {
    const result = await this.request(
      "tools/call",
      { name, arguments: args },
      timeoutMs,
    );
    if (result?.isError) {
      const text = (result.content || [])
        .filter((item) => item.type === "text")
        .map((item) => item.text)
        .join("\n");
      throw new Error(`${name} failed${text ? `: ${text}` : ""}`);
    }
    return result;
  }

  close() {
    this.child.stdin.end();
    this.child.kill("SIGTERM");
  }
}

function textContent(result) {
  return (result?.content || [])
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n");
}

async function main() {
  const startedAt = Date.now();
  const options = parseArgs(process.argv.slice(2));
  await access(options.project);
  const client = new McpClient(options.command, options.project);
  const sessionId = `buzz-${options.actor}-${randomUUID()}`;

  try {
    const initialized = await client.request("initialize", {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: `contextstream-buzz-${options.actor}`, version: "1.0.0" },
    });
    client.notify("notifications/initialized");

    const listed = await client.request("tools/list");
    const toolNames = new Set((listed.tools || []).map((tool) => tool.name));
    const required = ["init", "context", "search", "memory", "session", "entity"];
    const missing = required.filter((name) => !toolNames.has(name));
    if (missing.length > 0) {
      throw new Error(`Required ContextStream tools are missing: ${missing.join(", ")}`);
    }

    const initResult = await client.tool("init", {
      folder_path: options.project,
      session_id: sessionId,
      client_name: `buzz-smoke-${options.actor}`,
      context_hint: "Verify that this Buzz agent can ground against the shared ContextStream project.",
    });
    const initText = textContent(initResult);
    if (!/Session ready|ContextStream initialized|workspace/i.test(initText)) {
      throw new Error("ContextStream init returned no recognizable workspace confirmation");
    }

    const contextResult = await client.tool("context", {
      folder_path: options.project,
      session_id: sessionId,
      client_name: `buzz-smoke-${options.actor}`,
      user_message: "Smoke test: ground this Buzz agent in the shared project context.",
      mode: "fast",
      save_exchange: false,
    });
    const groundedText = textContent(contextResult);
    if (!groundedText.trim()) {
      throw new Error("ContextStream context returned no grounding response");
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          actor: options.actor,
          project: options.project,
          server: initialized.serverInfo,
          negotiatedProtocol: initialized.protocolVersion,
          toolCount: listed.tools?.length || 0,
          requiredTools: required,
          initializedProject: true,
          grounded: true,
          durableWrites: 0,
          durationMs: Date.now() - startedAt,
        },
        null,
        2,
      ),
    );
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(`Buzz ContextStream smoke test failed: ${error.message}`);
  process.exitCode = 1;
});
