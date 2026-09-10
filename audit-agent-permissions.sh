#!/bin/bash
# audit-agent-permissions.sh
#
# Read-only audit of what an AI coding agent (or any process running as the
# current user, from the current app context) can access on this machine.
#
# Run it from an agent shell to see the agent's effective permissions.
# Run it from Terminal.app to compare TCC contexts (permissions are granted
# per parent application: Cursor, Terminal, iTerm, ...).
#
# Guarantees:
#   - Read-only: no file is modified, no secret VALUE is ever printed.
#   - Probes only test readability/existence and print names or counts.

set -u

B=$(tput bold 2>/dev/null || true)
N=$(tput sgr0 2>/dev/null || true)

ok()   { printf "  [OK]   %s\n" "$1"; }
warn() { printf "  [WARN] %s\n" "$1"; }
info() { printf "  [i]    %s\n" "$1"; }

section() { printf "\n%s== %s ==%s\n" "$B" "$1" "$N"; }

# Probe: is a file/dir readable? (never prints content)
readable() { [ -r "$1" ]; }

printf "%sAgent permission audit%s - %s\n" "$B" "$N" "$(date '+%Y-%m-%d %H:%M:%S')"
info "parent app context: ${TERM_PROGRAM:-unknown} (TCC permissions are per-app)"

# ---------------------------------------------------------------- identity
section "Identity & privilege escalation"
info "user: $(whoami) (uid $(id -u)), groups: $(id -Gn | tr ' ' ',')"
if id -Gn | grep -qw admin; then
  warn "user is in the 'admin' group (can sudo with password)"
else
  ok "user is not an admin"
fi
if sudo -n true 2>/dev/null; then
  warn "sudo works WITHOUT password -> agent can become root silently"
else
  ok "sudo requires a password (agent cannot escalate silently)"
fi

# ---------------------------------------------------------------- TCC / FDA
section "macOS TCC permissions (of the app this shell runs under)"
# Reading the user TCC database itself requires Full Disk Access.
TCC_DB="$HOME/Library/Application Support/com.apple.TCC/TCC.db"
FDA=false
if sqlite3 "$TCC_DB" "SELECT 1 LIMIT 1;" >/dev/null 2>&1; then
  FDA=true
  warn "FULL DISK ACCESS is granted to this app context"
else
  ok "no Full Disk Access (TCC.db unreadable)"
fi

# Classic FDA-protected probes (readable only with FDA)
for f in "$HOME/Library/Safari/History.db" \
         "$HOME/Library/Messages/chat.db" \
         "$HOME/Library/Mail"; do
  if readable "$f"; then
    warn "FDA-protected path readable: ${f/#$HOME/~}"
  fi
done

if $FDA; then
  info "apps with notable TCC grants (from TCC.db):"
  sqlite3 "$TCC_DB" \
    "SELECT service, client FROM access WHERE auth_value > 0 AND service IN
     ('kTCCServiceSystemPolicyAllFiles','kTCCServiceAccessibility',
      'kTCCServiceScreenCapture','kTCCServiceListenEvent',
      'kTCCServiceMicrophone','kTCCServiceCamera');" 2>/dev/null \
    | sed 's/^/         /'
fi

# ------------------------------------------------------------- filesystem
section "Reachable secrets on disk (names/counts only)"

# SSH
if [ -d "$HOME/.ssh" ]; then
  KEYS=$(find "$HOME/.ssh" -maxdepth 1 -type f \( -name "id_*" ! -name "*.pub" \) 2>/dev/null | wc -l | tr -d ' ')
  [ "$KEYS" -gt 0 ] && warn "$KEYS private SSH key(s) readable in ~/.ssh" || ok "no private SSH keys in ~/.ssh"
fi
if ssh-add -l >/dev/null 2>&1; then
  warn "ssh-agent has $(ssh-add -l 2>/dev/null | wc -l | tr -d ' ') key(s) loaded (usable by any process as this user)"
fi

# Cloud / dev credentials
CRED_PATHS=(
  "$HOME/.cache/huggingface/token:HuggingFace token"
  "$HOME/.huggingface/token:HuggingFace token (legacy)"
  "$HOME/.aws/credentials:AWS credentials"
  "$HOME/.config/gh/hosts.yml:GitHub CLI token"
  "$HOME/.netrc:netrc credentials"
  "$HOME/.npmrc:npm tokens"
  "$HOME/.pypirc:PyPI tokens"
  "$HOME/.docker/config.json:Docker registry auth"
  "$HOME/.kube/config:Kubernetes credentials"
  "$HOME/.config/gcloud/credentials.db:GCloud credentials"
)
for entry in "${CRED_PATHS[@]}"; do
  p="${entry%%:*}"; label="${entry#*:}"
  readable "$p" && warn "readable: ${p/#$HOME/~} ($label)"
done

# .env files across work projects
WORKDIR="$HOME/Documents/work-projects"
if [ -d "$WORKDIR" ]; then
  ENVS=$(find "$WORKDIR" -type f \( -name ".env" -o -name ".env.*" \) \
         ! -name "*.example" ! -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ')
  warn "$ENVS .env file(s) readable under ~/Documents/work-projects"
fi

# Keychain files (metadata only; secret values still need user unlock)
readable "$HOME/Library/Keychains" \
  && info "keychain files present (values require unlock prompts, metadata listable via 'security')"

# Browser profile dirs (cookies/passwords DBs)
for bp in "$HOME/Library/Application Support/Google/Chrome" \
          "$HOME/Library/Application Support/Firefox/Profiles" \
          "$HOME/Library/Application Support/Arc"; do
  readable "$bp" && warn "browser profile dir readable: ${bp/#$HOME/~} (cookie DBs; Chrome passwords need Keychain)"
done

# AI tool histories (see: tokens found in chat history)
for h in "$HOME/.cursor/projects" \
         "$HOME/Library/Application Support/Cursor/User/globalStorage" \
         "$HOME/.claude" "$HOME/.openclaw"; do
  readable "$h" && warn "AI history/config readable: ${h/#$HOME/~}"
done

# ------------------------------------------------------------- agent config
section "Agent tooling configuration"
for mcp in "$HOME/.cursor/mcp.json"; do
  if readable "$mcp"; then
    info "MCP servers configured in ${mcp/#$HOME/~}:"
    python3 -c "
import json
d = json.load(open('$mcp'))
for name in (d.get('mcpServers') or {}): print('         -', name)
" 2>/dev/null
  fi
done
HOOKS="$HOME/.cursor/hooks.json"
readable "$HOOKS" && info "global hooks file present: ~/.cursor/hooks.json" \
                  || info "no global hooks file (nothing filters what agents read/run)"

# ------------------------------------------------------------- write & net
section "Write & network reach"
T=$(mktemp "$HOME/.agent-audit-probe.XXXXXX" 2>/dev/null) && { rm -f "$T"; warn "can write anywhere in \$HOME (not sandboxed to workspace)"; }
if curl -s --max-time 5 -o /dev/null -w "%{http_code}" https://example.com | grep -q 200; then
  warn "unrestricted outbound network (exfiltration is one curl away)"
fi

printf "\n%sDone.%s Read-only audit; nothing was modified, no secret values were read.\n" "$B" "$N"
