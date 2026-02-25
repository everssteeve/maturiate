#!/usr/bin/env node

/**
 * Claude Code PostToolUse Hook
 *
 * Automatically updates GitHub issues when a git commit references them.
 *
 * Detects patterns in commit messages:
 *   - #123            → comments on the issue
 *   - closes #123     → closes the issue + comments
 *   - fixes #123      → closes the issue + comments
 *   - resolves #123   → closes the issue + comments
 *
 * Receives hook input as JSON on stdin.
 */

import { execSync } from "child_process";
import path from "path";

/**
 * Convert Unix-style paths (/c/Users/...) to Windows-style (C:\Users\...).
 */
function toWindowsPath(p) {
  if (process.platform !== "win32" || !p) return p;
  const m = p.match(/^\/([a-zA-Z])\/(.*)/);
  if (m)
    return m[1].toUpperCase() + ":" + path.sep + m[2].replace(/\//g, path.sep);
  return p;
}

function run(cmd, cwd, env) {
  return execSync(cmd, {
    encoding: "utf-8",
    shell: true,
    stdio: "pipe",
    cwd,
    env,
  }).trim();
}

async function main() {
  // Read stdin (hook input JSON)
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = JSON.parse(Buffer.concat(chunks).toString());

  const command = input?.tool_input?.command || "";

  // Only process git commit commands
  if (!command.match(/git\s+commit/)) {
    process.exit(0);
  }

  // Extract the commit message from the command
  const commitMsg = extractCommitMessage(command);
  if (!commitMsg) {
    process.exit(0);
  }

  // Find all issue references
  const closePatterns =
    /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/gi;
  const mentionPattern = /#(\d+)/g;

  const toClose = new Set();
  let match;

  // Collect issues to close
  while ((match = closePatterns.exec(commitMsg)) !== null) {
    toClose.add(match[1]);
  }

  // Collect all mentioned issues
  const allMentioned = new Set();
  while ((match = mentionPattern.exec(commitMsg)) !== null) {
    allMentioned.add(match[1]);
  }

  if (allMentioned.size === 0) {
    process.exit(0);
  }

  // Setup execution environment
  const cwd = toWindowsPath(input.cwd) || process.cwd();
  const ghDir = toWindowsPath("/c/Users/steeve.evers/tools/bin");
  const env = {
    ...process.env,
    PATH: `${ghDir}${path.delimiter}${process.env.PATH}`,
  };

  // Get the short commit hash
  let commitHash = "unknown";
  try {
    commitHash = run("git rev-parse --short HEAD", cwd, env);
  } catch {
    // ignore
  }

  // Get branch name
  let branchName = "unknown";
  try {
    branchName = run("git branch --show-current", cwd, env);
  } catch {
    // ignore
  }

  // Process each mentioned issue
  for (const issueNum of allMentioned) {
    const shouldClose = toClose.has(issueNum);

    const commentBody = [
      shouldClose
        ? `Fermé par le commit \`${commitHash}\` sur la branche \`${branchName}\``
        : `Référencé dans le commit \`${commitHash}\` sur la branche \`${branchName}\``,
      "",
      `> ${commitMsg.split("\n")[0]}`,
      "",
      "_Mise à jour automatique par Claude Code_",
    ].join("\n");

    try {
      // Write comment body to a temp approach: use --body flag with proper escaping
      // Using JSON.stringify to safely pass the body through the shell
      const escaped = commentBody
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n");
      run(
        `gh issue comment ${issueNum} --body "${escaped}"`,
        cwd,
        env
      );

      // Close if needed
      if (shouldClose) {
        run(`gh issue close ${issueNum} --reason completed`, cwd, env);
      }

      process.stderr.write(
        `Issue #${issueNum}: ${shouldClose ? "fermée et commentée" : "commentée"}\n`
      );
    } catch (err) {
      process.stderr.write(
        `Erreur mise à jour issue #${issueNum}: ${err.stderr || err.message}\n`
      );
    }
  }

  process.exit(0);
}

/**
 * Extract commit message from various git commit command formats.
 */
function extractCommitMessage(command) {
  // Match HEREDOC: git commit -m "$(cat <<'EOF'\nmessage\nEOF\n)"
  let match = command.match(/cat\s+<<'?EOF'?\n([\s\S]*?)\nEOF/);
  if (match) return match[1].trim();

  // Match: git commit -m "message"
  match = command.match(/git\s+commit\s+.*-m\s+"([^"]+)"/);
  if (match) return match[1];

  // Match: git commit -m 'message'
  match = command.match(/git\s+commit\s+.*-m\s+'([^']+)'/);
  if (match) return match[1];

  // Match: git commit -m $'message'
  match = command.match(/git\s+commit\s+.*-m\s+\$'([^']+)'/);
  if (match) return match[1];

  return null;
}

main().catch((err) => {
  process.stderr.write(`Hook error: ${err.message}\n`);
  process.exit(0); // Don't block on errors
});
