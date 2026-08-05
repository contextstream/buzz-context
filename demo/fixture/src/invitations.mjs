import { createHmac, timingSafeEqual } from "node:crypto";

function sign(encodedPayload, secret) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function issueInvitation({
  role = "member",
  issuedAtMs,
  nonce,
  secret,
}) {
  const payload = Buffer.from(
    JSON.stringify({ role, issuedAtMs, nonce }),
    "utf8",
  ).toString("base64url");

  return `${payload}.${sign(payload, secret)}`;
}

export function verifyInvitation(token, { secret, nowMs }) {
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) {
    return { valid: false, reason: "malformed" };
  }

  const expectedSignature = sign(payload, secret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return { valid: false, reason: "invalid_signature" };
  }

  const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

  // Deliberately incomplete. Demo agents must retrieve and implement the
  // approved expiry policy from the shared ContextStream project.
  void nowMs;
  return { valid: true, claims };
}
