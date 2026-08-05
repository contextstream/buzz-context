# Block / Buzz proof-first outreach

Do not send this until the clean-room setup and flagship two-agent demo pass.

## Short note

Subject: ContextStream reference for shared project context across Buzz agents

> We connected Claude Code and Codex agents in Buzz to the same ContextStream
> MCP project through Buzz's existing ACP `mcpServers` path. One agent retrieved
> the project's requirements, a human approved a changed requirement for
> preservation, and the other agent retrieved it in a different room and
> continued without rebriefing. The same approved decision was then available
> outside Buzz.
>
> We packaged the configuration, Buzz-specific agent teaching, an under-five-
> minute setup, and an end-to-end demonstration as a small reference example.
> We would value technical review and guidance on the best examples or
> integrations location in `block/buzz`.

## Ask

- Review the use of `BUZZ_ACP_MCP_COMMAND` and ACP `session/new.mcpServers`.
- Recommend the smallest upstream docs/examples location.
- Consider listing ContextStream as a persistent external project-context
  example.
- Advise whether an approved MCP selector can fit the agent-creation flow.
- Discuss co-marketing only after the experience is reproducible.

## Evidence to attach

- public ContextStream reference commit;
- exact Buzz commit used for validation;
- passing ContextStream stdio smoke output;
- passing Buzz `mcp_command` and MCP serialization tests;
- 60–90 second Claude-to-Codex demo;
- clean-machine setup time;
- one screenshot of the approved decision and Buzz provenance;
- one screenshot of second-agent retrieval without a rebrief.

## Small upstream contribution

Prefer a documentation/example PR that:

1. explains `BUZZ_ACP_MCP_COMMAND` with a vendor-neutral stdio MCP example;
2. shows `contextstream-mcp` as one concrete external project-context server;
3. points to the maintained reference package;
4. adds no ContextStream dependency to Buzz;
5. does not change Buzz's event-history or community semantics.

Separately propose the product enhancement: a safe allowlisted MCP selector in
agent creation. Do not couple that larger UX decision to acceptance of the
small documentation example.

The ready-to-review source for that small contribution is
[upstream-doc.md](upstream-doc.md). Adjust its destination and local link style
after the Buzz maintainers recommend the correct documentation location.
