#!/usr/bin/env node
/*
 * verify-sync.js — is this repository an exact copy of the delivered package?
 *
 * Reads docs/FILE-MANIFEST.sha256 (one "<sha256>  <path>" per line, paths
 * relative to the repository root) and reports three DIFFERENT problems:
 *
 *   STALE   a file exists but its content differs from the package
 *   MISSING a file the package contains is absent from the repository
 *   EXTRA   a file exists in the repository that the package does NOT
 *           contain (e.g. a stray duplicate such as a root-level
 *           AdminShell.tsx). A checksum-only tool cannot see these — that
 *           blind spot is what let a stale duplicate break a build.
 *
 * Cross-platform (plain Node, no dependencies). CRLF is normalised to LF
 * before hashing so Windows checkouts with autocrlf don't produce false
 * STALE results. Exit code 1 if anything is reported.
 *
 * Usage (from the repository root):   node scripts/verify-sync.js
 *
 * IMPORTANT: this tool only REPORTS. It never copies or deletes files.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = process.cwd();
const manifestPath = path.join(root, "docs", "FILE-MANIFEST.sha256");
if (!fs.existsSync(manifestPath)) {
  console.error("docs/FILE-MANIFEST.sha256 not found. Run this from the repository root.");
  process.exit(2);
}

const sha = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const normalise = (buf) => Buffer.from(buf.toString("latin1").replace(/\r\n/g, "\n"), "latin1");

const manifest = new Map();
for (const line of fs.readFileSync(manifestPath, "utf8").split("\n")) {
  const m = line.match(/^([0-9a-f]{64})\s+\*?(.+)$/);
  if (m) manifest.set(m[2].trim(), m[1]);
}

// Directories/files that are never part of the manifest and never "extra".
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "preview", "public", ".vercel", "out"]);
const IGNORED_FILES = new Set([
  "package-lock.json", "REVIEW.pdf", "docs/FILE-MANIFEST.sha256", "next-env.d.ts", ".DS_Store",
]);
const isIgnored = (rel) =>
  IGNORED_FILES.has(rel) || /\.tsbuildinfo$/.test(rel) || /(^|\/)\.env(\..*)?$/.test(rel);

const present = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(root, abs).split(path.sep).join("/");
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(abs);
    } else {
      present.push(rel);
    }
  }
})(root);

const stale = [], missing = [], extra = [];
for (const [rel, expected] of manifest) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) { missing.push(rel); continue; }
  if (sha(normalise(fs.readFileSync(abs))) !== expected) stale.push(rel);
}
for (const rel of present) {
  if (!manifest.has(rel) && !isIgnored(rel)) extra.push(rel);
}

const SOURCE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const show = (title, hint, list) => {
  if (!list.length) return;
  console.log(`\n${title} (${list.length})\n  ${hint}`);
  for (const f of list.sort()) {
    const flag = title.startsWith("EXTRA") && SOURCE.test(f) ? "   <-- source file: possible stale duplicate" : "";
    console.log(`  - ${f}${flag}`);
  }
};

show("STALE", "Content differs from the package. Replace with the package's version.", stale);
show("MISSING", "In the package but absent here. Add it from the package.", missing);
show("EXTRA", "Not in the package. Investigate (grep for importers) before deleting; do NOT copy anything for these.", extra);

const problems = stale.length + missing.length + extra.length;
console.log(
  problems === 0
    ? `\nOK — ${manifest.size} files match the package; no extra files found.`
    : `\n${problems} problem(s) found across ${manifest.size} manifest entries.`
);
process.exit(problems === 0 ? 0 : 1);
