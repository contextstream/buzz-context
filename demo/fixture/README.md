# Invitation continuity fixture

This is the synthetic repository used by the flagship ContextStream × Buzz
demonstration. Copy it to a disposable directory before each run; do not let a
recording mutate this baseline.

The fixture issues HMAC-signed invitations and verifies their signatures. It
intentionally omits expiry enforcement so Claude can start the implementation
from approved ContextStream requirements. After a human approves a changed
admin-invitation policy, Codex must retrieve that durable decision in another
Buzz room and finish the implementation without being rebriefed.

Run the baseline tests with:

```bash
npm test
```

Everything here is demo-only and must not be treated as production guidance.
