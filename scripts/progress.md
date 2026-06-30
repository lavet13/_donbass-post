Where Ivan is with bash (as of last session)

Comfortable and tested: strict mode (set -euo pipefail), variables + quoting,
all expansion forms (:- :+ :? +x and the +x unset-check trick), if testing exit
codes, [ ] vs [[ ]], test conditions (string/file/number incl. -s), &&/||,
arithmetic $(( )) (+ floats via bc/awk), redirection (> >> 2> &> 2>&1 >&2 | <<<),
here-docs/here-strings, arrays + [@]/[*] and $@/$* (understands the difference is
about quoting, not the symbol), for/while/case (incl. the insight that a
`while [[ $# -gt 0 ]]` guard means the case `*` default only catches PROVIDED
unknown args, never no-args), functions with local, special vars, glob vs regex
matching, command builtin, . / source, export, set (options + positional params),
read flags (-r -p -s -n -t -a), argument-parsing template, curl | bash -s --
delivery, diff output (a/c/d edit commands, -u and -c formats).

Regex: knows ERE essentials (transfers from JS), knows bash has NO non-capturing
groups / \d / lookaround (POSIX ERE only, every ( ) populates BASH_REMATCH, a
repeated group keeps only its LAST match), knows sed defaults to BRE and -E
enables ERE, knows the BRE escaping rules (+ ? { } ( ) | are literal unless
backslashed).

Added to notes but only lightly exercised: tee, process substitution <(cmd),
trap + $LINENO/$FUNCNAME (parked as "error-trap only — low priority").

Built two real scripts: setup-debian.sh (Debian provisioning — Docker install,
UFW, deploy+splinter users via a create_user_with_ssh function, opt-in swap and
--harden-ssh) and health-check.sh (Approach A: runs locally, SSHes via an
ssh_exec helper, loops containers, tracks failures with a counter, exits 1).
Pending polish: move config to a sourced health-check.env (+ committed .example).

Learning style: wants every line/flag/symbol explained, fires many granular
follow-ups, keeps a bash-knowledge.md he curates himself (prefers pasted snippets
over a regenerated file). Prefers reproducing behavior manually over trusting it.
