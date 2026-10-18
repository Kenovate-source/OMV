#!/usr/bin/env node
/*
 * check-repo-hygiene.js — runs automatically before `npm run build`
 * (package.json "prebuild"). Fails FAST with a plain-English message for
 * repository mistakes that otherwise surface as confusing TypeScript
 * errors deep inside the build:
 *
 *   1. A source file sitting at the repository root that is not an
 *      expected config file (tsconfig.json includes "**\/*.tsx", so a
 *      stray root-level component is type-checked and can fail the build
 *      even though nothing imports it).
 *   2. Two component/lib files with the same name in different folders
 *      (a flattened upload typically creates exactly this).
 *   3. References to the removed prototype admin login (`signInAs`,
 *      `LoginPicker`). Real authentication must not regress to it.
 *
 * It does NOT type-check anything and does not weaken `next build`'s own
 * checks; it only adds earlier, clearer failures.
 */
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const ALLOWED_ROOT_SOURCE = new Set([
  "next.config.js", "postcss.config.js", "tailwind.config.ts", "vitest.config.ts", "next-env.d.ts",
]);
const SOURCE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const ROUTE_NAMES = /^(page|layout|route|loading|error|not-found|template|default|middleware)\.(ts|tsx)$/;
const problems = [];

// 1. stray root-level source files
for (const name of fs.readdirSync(root)) {
  const abs = path.join(root, name);
  if (fs.statSync(abs).isFile() && SOURCE.test(name) && !ALLOWED_ROOT_SOURCE.has(name)) {
    problems.push(
      `Stray source file at the repository root: ${name}\n` +
      `    tsconfig.json type-checks every .ts/.tsx file, so this can break the build.\n` +
      `    It is almost certainly a mis-placed copy of a file that belongs in a subfolder\n` +
      `    (e.g. components/...). Check it is not imported, then delete it:  git rm ${name}`
    );
  }
}

// collect source files under app/, components/, lib/
const files = [];
(function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "node_modules" && e.name !== ".next") walk(abs); }
    else if (/\.(ts|tsx)$/.test(e.name)) files.push(abs);
  }
})(path.join(root, "app"));
["components", "lib"].forEach((d) => (function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walk(abs); else if (/\.(ts|tsx)$/.test(e.name)) files.push(abs);
  }
})(path.join(root, d)));

// 2. duplicate basenames
const byName = new Map();
for (const f of files) {
  const base = path.basename(f);
  if (ROUTE_NAMES.test(base)) continue;
  if (!byName.has(base)) byName.set(base, []);
  byName.get(base).push(path.relative(root, f).split(path.sep).join("/"));
}
for (const [base, list] of byName) {
  if (list.length > 1) {
    problems.push(`Duplicate file name "${base}" in more than one place:\n    ${list.join("\n    ")}\n    Keep the canonical one and remove the other.`);
  }
}

// 3. removed prototype admin login must not come back
const FORBIDDEN = /\b(signInAs|LoginPicker)\b/;
for (const f of files) {
  if (FORBIDDEN.test(fs.readFileSync(f, "utf8"))) {
    problems.push(
      `Obsolete prototype admin-login reference in ${path.relative(root, f).split(path.sep).join("/")}\n` +
      `    (signInAs / LoginPicker). Admin sign-in must use signIn(email, password) from\n` +
      `    lib/admin/admin-auth-context.tsx. This is usually a stale copy of the file.`
    );
  }
}

if (problems.length) {
  console.error("\nRepository hygiene check FAILED — fix these before building:\n");
  problems.forEach((p, i) => console.error(`${i + 1}. ${p}\n`));
  process.exit(1);
}
console.log("Repository hygiene check passed.");
