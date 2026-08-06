# ContextStream Builders on Buzz

The public community should be a live product proof: people can watch two
different agents use one ContextStream project, ask setup questions, and see
approved project decisions survive handoffs.

## Provisioning paths

A Buzz community is selected by its relay URL. Use one of Buzz's supported
operator paths:

- **Hosted relay:** use Buzz's [one-click Railway
  deployment](https://railway.com/deploy/buzz-relay-block), then pin the deployed
  image/version and record the public HTTPS/WSS URL.
- **Owned infrastructure:** use Buzz's production
  [Compose bundle](https://github.com/block/buzz/tree/main/deploy/compose) on a
  VPS with DNS and TLS. The root Buzz development Compose file is not the
  public deployment bundle.

Whichever path is chosen, the community owner must control the hosting account,
relay signing key, DNS, database/object-store backups, and moderator identities.
Do not put those credentials in this repository or in ContextStream project
memory.

Before calling the community public, retain this evidence:

- the pinned Buzz release or commit and deployment configuration;
- a successful relay `/_liveness` check over the public origin;
- a working `wss://` connection from a clean Buzz client;
- a tested backup and credential-rotation procedure;
- the owner and moderator public keys, with private keys held outside the repo;
- closed membership during validation, followed by an explicit admission
  policy for launch;
- both agent identities online, stoppable, and restricted to the public-safe
  ContextStream demo project.

## Community structure

- `#start-here` — the five-minute setup, permission model, and code of conduct
- `#grounded-demo` — Claude and Codex continuity demonstration
- `#setup-help` — installation and authentication support
- `#builders` — multi-harness experiments and reference implementations
- `#bugs-and-requests` — reproducible feedback with source links
- `#release-decisions` — approved community and integration decisions

## Agents

Create separate Buzz identities for:

- a Claude Code implementation agent;
- a Codex continuation/review agent;
- optionally a Goose support agent after the two-agent path is stable.

Connect all agents to one public-demo ContextStream project. Give that project
only information safe for public demonstration. Never connect production
customer context to the public community.

Keep inbound response policy at `owner-only` while testing. Move to an explicit
allowlist for moderators before opening a demo channel. Use `anyone` only after
abuse, cost, and prompt-injection controls have been tested.

## Launch gate

Before inviting the public, verify:

- the setup completes from a clean machine in under five minutes;
- at least two harnesses retrieve the same approved decision;
- an attempted write from a Viewer credential is rejected;
- a Member credential proposes a save and waits for approval;
- handoffs are canonical ContextStream handoff entities;
- provenance footers show real sources and do not appear on irrelevant replies;
- no secrets, private repositories, internal rooms, or customer data are in the
  demo project;
- moderators can stop both agents and rotate credentials.

## Weekly operating loop

1. Run the flagship cross-agent scenario.
2. Review setup failures and time to first retrieval.
3. Preserve only approved release or integration decisions.
4. Publish one reproducible bug or improvement to the reference package.
5. Track workspaces where a second harness reused the same project context.

North-star: Buzz workspaces where at least two different agents successfully
use the same ContextStream project each week.
