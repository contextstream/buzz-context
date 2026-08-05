import assert from "node:assert/strict";
import test from "node:test";

import { issueInvitation, verifyInvitation } from "../src/invitations.mjs";

const secret = "demo-secret";
const issuedAtMs = Date.UTC(2026, 7, 5, 12, 0, 0);

test("accepts an untampered signed invitation", () => {
  const token = issueInvitation({
    role: "member",
    issuedAtMs,
    nonce: "invite-1",
    secret,
  });

  const result = verifyInvitation(token, {
    secret,
    nowMs: issuedAtMs + 1_000,
  });

  assert.equal(result.valid, true);
  assert.equal(result.claims.role, "member");
});

test("rejects a tampered invitation", () => {
  const token = issueInvitation({
    role: "member",
    issuedAtMs,
    nonce: "invite-2",
    secret,
  });
  const tampered = `${token.slice(0, -1)}x`;

  assert.deepEqual(
    verifyInvitation(tampered, { secret, nowMs: issuedAtMs + 1_000 }),
    { valid: false, reason: "invalid_signature" },
  );
});
