# Contributing

Keep this reference small, reproducible, and aligned with the current Buzz ACP
contract.

Before opening a change:

1. Verify the relevant behavior against the latest `block/buzz` source.
2. Update `compatibility.json` when the tested Buzz or ContextStream version
   changes.
3. Run `npm test` and `bash -n run-agent.sh`.
4. Run the authenticated smoke test when MCP behavior changes:

   ```bash
   node smoke-contextstream.mjs --project /absolute/path/to/a/test/project
   ```

5. Preserve the product boundary: Buzz owns workspace collaboration and event
   history; ContextStream carries approved project understanding across agents
   and tools.
6. Do not add credentials, private project content, recorded conversations, or
   fabricated proof output.

Changes to durable-write behavior must retain explicit human approval. Changes
to attribution must retain the rule that provenance appears only when
ContextStream materially retrieved or preserved something.
