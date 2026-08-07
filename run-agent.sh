#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME=""
PROJECT_DIR=""
CHECK_ONLY="false"
INSTRUCTIONS_FILE="$SCRIPT_DIR/agent-instructions.md"
EXTRA_ARGS=()

usage() {
  printf '%s\n' \
    'Usage: run-agent.sh [options] [-- buzz-acp arguments]' \
    '' \
    'Options:' \
    '  --runtime goose|codex|claude   ACP runtime (required)' \
    '  --project ABSOLUTE_PATH        ContextStream project folder (required)' \
    '  --instructions PATH            Alternate Buzz agent teaching file' \
    '  --check                        Validate setup without starting an agent' \
    '  -h, --help                     Show this help'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --runtime)
      [[ $# -ge 2 ]] || { printf 'Missing value for --runtime\n' >&2; exit 2; }
      RUNTIME="$2"
      shift 2
      ;;
    --project)
      [[ $# -ge 2 ]] || { printf 'Missing value for --project\n' >&2; exit 2; }
      PROJECT_DIR="$2"
      shift 2
      ;;
    --instructions)
      [[ $# -ge 2 ]] || { printf 'Missing value for --instructions\n' >&2; exit 2; }
      INSTRUCTIONS_FILE="$2"
      shift 2
      ;;
    --check)
      CHECK_ONLY="true"
      shift
      ;;
    --)
      shift
      EXTRA_ARGS=("$@")
      break
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown option: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

[[ -n "$RUNTIME" ]] || {
  printf 'Missing required option: --runtime\n' >&2
  usage >&2
  exit 2
}

[[ -n "$PROJECT_DIR" ]] || {
  printf 'Missing required option: --project\n' >&2
  usage >&2
  exit 2
}

case "$RUNTIME" in
  goose)
    AGENT_COMMAND="goose"
    AGENT_ARGS="acp"
    ;;
  codex)
    AGENT_COMMAND="codex-acp"
    AGENT_ARGS=""
    ;;
  claude)
    AGENT_COMMAND="claude-agent-acp"
    AGENT_ARGS=""
    ;;
  *)
    printf 'Unsupported runtime: %s (expected goose, codex, or claude)\n' "$RUNTIME" >&2
    exit 2
    ;;
esac

[[ "$PROJECT_DIR" = /* ]] || {
  printf 'The project path must be absolute: %s\n' "$PROJECT_DIR" >&2
  exit 2
}

[[ -d "$PROJECT_DIR" ]] || {
  printf 'Project directory does not exist: %s\n' "$PROJECT_DIR" >&2
  exit 2
}

[[ -f "$INSTRUCTIONS_FILE" ]] || {
  printf 'Instructions file does not exist: %s\n' "$INSTRUCTIONS_FILE" >&2
  exit 2
}

for required_command in contextstream-mcp buzz-acp "$AGENT_COMMAND"; do
  command -v "$required_command" >/dev/null 2>&1 || {
    printf 'Required command is not on PATH: %s\n' "$required_command" >&2
    exit 1
  }
done

# Buzz derives the ACP MCP-server name from the command's file stem. The
# canonical `contextstream` name matters because ContextStream-aware harness
# guards and permission rules key on `mcp__contextstream__*`. Keep the installed
# binary untouched and expose it through a private, executable cache alias.
CONTEXTSTREAM_MCP_REAL="$(command -v contextstream-mcp)"
CONTEXTSTREAM_BUZZ_CACHE_ROOT="${CONTEXTSTREAM_BUZZ_BIN_DIR:-${XDG_CACHE_HOME:-${HOME}/.cache}/contextstream/buzz/bin}"
CONTEXTSTREAM_MCP_ALIAS="$CONTEXTSTREAM_BUZZ_CACHE_ROOT/contextstream"
mkdir -p "$CONTEXTSTREAM_BUZZ_CACHE_ROOT"

if [[ -e "$CONTEXTSTREAM_MCP_ALIAS" || -L "$CONTEXTSTREAM_MCP_ALIAS" ]]; then
  if [[ ! -L "$CONTEXTSTREAM_MCP_ALIAS" ]]; then
    printf 'Refusing to replace non-symlink MCP alias: %s\n' "$CONTEXTSTREAM_MCP_ALIAS" >&2
    exit 1
  fi
  if [[ "$(readlink "$CONTEXTSTREAM_MCP_ALIAS")" != "$CONTEXTSTREAM_MCP_REAL" ]]; then
    ln -sfn "$CONTEXTSTREAM_MCP_REAL" "$CONTEXTSTREAM_MCP_ALIAS"
  fi
else
  ln -s "$CONTEXTSTREAM_MCP_REAL" "$CONTEXTSTREAM_MCP_ALIAS"
fi

if ! "$CONTEXTSTREAM_MCP_ALIAS" --version >/dev/null 2>&1; then
  printf 'The canonical MCP alias is not executable: %s\n' "$CONTEXTSTREAM_MCP_ALIAS" >&2
  printf 'Set CONTEXTSTREAM_BUZZ_BIN_DIR to a user-owned executable directory.\n' >&2
  exit 1
fi

[[ -n "${BUZZ_RELAY_URL:-}" ]] || {
  printf 'BUZZ_RELAY_URL is required. Set it to the Buzz community this agent should join.\n' >&2
  exit 1
}

[[ -n "${BUZZ_PRIVATE_KEY:-}" ]] || {
  printf 'BUZZ_PRIVATE_KEY is required. Use a dedicated identity for this agent.\n' >&2
  exit 1
}

AUTH_JSON="$(contextstream-mcp verify-key --json)"
if [[ "$AUTH_JSON" != *'"valid": true'* && "$AUTH_JSON" != *'"valid":true'* ]]; then
  printf 'ContextStream authentication is not valid. Run: contextstream-mcp setup\n' >&2
  exit 1
fi

if [[ "$CHECK_ONLY" = "true" ]]; then
  printf 'ContextStream for Buzz local check passed.\n'
  printf '  runtime: %s (%s)\n' "$RUNTIME" "$AGENT_COMMAND"
  printf '  project: %s\n' "$PROJECT_DIR"
  printf '  relay:   %s\n' "$BUZZ_RELAY_URL"
  printf '  MCP:     %s -> %s\n' "$CONTEXTSTREAM_MCP_ALIAS" "$CONTEXTSTREAM_MCP_REAL"
  printf '  policy:  %s\n' "${BUZZ_ACP_RESPOND_TO:-owner-only}"
  exit 0
fi

export BUZZ_ACP_RESPOND_TO="${BUZZ_ACP_RESPOND_TO:-owner-only}"
export BUZZ_ACP_AGENT_COMMAND="$AGENT_COMMAND"
export BUZZ_ACP_AGENT_ARGS="$AGENT_ARGS"
export BUZZ_ACP_MCP_COMMAND="$CONTEXTSTREAM_MCP_ALIAS"

cd "$PROJECT_DIR"
exec buzz-acp --system-prompt-file "$INSTRUCTIONS_FILE" "${EXTRA_ARGS[@]}"
