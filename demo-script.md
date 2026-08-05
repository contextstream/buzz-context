# Flagship demo: Claude starts it, Codex continues it

Target length: 75 seconds. This is a continuity proof, not a feature tour.

## Before recording

- Create one ContextStream project with a small repository, a product
  requirement, one architecture decision, and one known constraint.
- Start a Claude Code Buzz agent and a Codex Buzz agent through
  [run-agent.sh](run-agent.sh), each with a distinct Buzz identity and the same
  ContextStream project.
- Add the agents to different Buzz rooms.
- Keep the ContextStream project open in the dashboard so the approved decision
  and provenance can be shown.
- Run [smoke-contextstream.mjs](smoke-contextstream.mjs) once per actor and keep
  the passing output for the technical appendix.

## Shot list

### 0–8 seconds — establish the shared project

Show the ContextStream project containing:

- requirement: invite links expire after 24 hours;
- decision: invitations use signed, single-use tokens;
- constraint: no new persistent session store.

On-screen line: **One approved project context.**

### 8–25 seconds — Claude begins in Buzz

In the first Buzz room, ask Claude Code to implement invitation expiry.

Claude visibly says it checked ContextStream and names the three relevant
sources before changing code. Show its compact ContextStream provenance footer.

On-screen line: **Claude starts with the decisions already made.**

### 25–43 seconds — the human changes a requirement

The human changes expiry from 24 hours to 30 minutes for admin invitations.
Claude proposes a durable decision instead of silently saving the conversation:

> This appears to be a lasting project decision. Save it to ContextStream with
> this Buzz thread as the source?

The human explicitly approves. Show the confirmed ContextStream save and the
source reference in the dashboard.

On-screen line: **Humans approve what becomes durable.**

### 43–61 seconds — Codex continues elsewhere

Switch to a second Buzz room or later session. Ask Codex to finish the tests.
Do not repeat the changed requirement.

Codex retrieves the updated 30-minute rule from the same ContextStream project,
mentions its source and freshness, and writes the correct test.

On-screen line: **Codex continues without a rebrief.**

### 61–69 seconds — leave Buzz

Open another MCP client outside Buzz and ask for the admin-invitation expiry.
Show the same approved 30-minute rule and Buzz provenance.

On-screen line: **The understanding travels beyond one workspace.**

### 69–75 seconds — close

Final frame:

> **The room changed. The agent changed. The context didn't.**

Lockup:

> ContextStream · portable project context for humans and agents

CTA: **Add ContextStream to Buzz**

## Proof requirements

Do not publish the recording unless:

- Claude and Codex are distinct running harnesses, not renamed mock panels;
- both use one real ContextStream project;
- the requirement change is saved only after visible human approval;
- Codex retrieves the change without it being repeated in the second room;
- source attribution is legible;
- the outside-Buzz retrieval uses the same durable record;
- the video stays between 60 and 90 seconds.
