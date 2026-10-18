# Keeping the GitHub repository in sync with a delivered package

**A ZIP does not update GitHub.** Nothing in a package changes your
repository. Files only reach GitHub when *you* commit and push them, and
Vercel builds exactly the commit it is pointed at (shown on each
deployment).

## Why this file exists

Two Vercel build failures in this project were caused by the repository
holding a *mixture* of file versions rather than a bug in the code:

1. `OutfitSlot` — a new component used a type that an un-updated file
   did not yet define.
2. `signInAs` — the repository contained a **stray duplicate
   `AdminShell.tsx` at the repository root**, an old copy of
   `components/admin/AdminShell.tsx`. Nothing imported the root copy, but
   `tsconfig.json` includes `**/*.tsx`, so TypeScript checked it anyway
   and it failed against the updated auth context.

## Golden rules

1. **The package's manifest is the only source of truth** for what
   belongs in the repository. Never "fix" a mismatch by copying from an
   older ZIP, an old branch, a backup or another folder — that is how a
   stale file gets back in.
2. **A mismatch comes in three kinds, and each has a different remedy.**

   | Report | Meaning | What to do |
   |---|---|---|
   | `STALE` | file exists, content differs from the package | replace it with the package's version |
   | `MISSING` | package has it, repository doesn't | add it from the package |
   | `EXTRA` | repository has it, the package does **not** | **copy nothing.** Find out what imports it (`grep`), then normally delete it |

3. **Preserve folder paths when uploading.** Dragging individual files
   into GitHub's web uploader while at the repository root drops them
   *at the root*, ignoring their folders. That is the usual way a
   duplicate like a root-level `AdminShell.tsx` is created. Prefer the git
   command line, or upload whole folders.

## Procedure

```bash
# 1. Work on a branch so nothing is lost
git checkout -b sync-stage1-auth

# 2. Extract the package into a SEPARATE temp folder (not over the repo).
#    Copy into the repo only the files reported STALE or MISSING,
#    keeping each file's folder path.

# 3. See exactly where you stand
node scripts/verify-sync.js
```

`verify-sync.js` needs only Node (no install), works on Windows, macOS
and Linux, and **only reports — it never copies or deletes anything**. It
ignores `node_modules`, `.next`, `preview/`, `public/`, `package-lock.json`,
`REVIEW.pdf`, `.env*` and build artifacts.

### Removing a stray duplicate (the `AdminShell.tsx` case)

```bash
# the ONLY AdminShell import should be the canonical one:
grep -rnE "AdminShell" app components lib tests
#   expect exactly:  app/admin/layout.tsx: ... from "@/components/admin/AdminShell"

# if so, the root-level copy is unreferenced and safe to remove:
git rm AdminShell.tsx

# the removed prototype login must be gone everywhere:
grep -rn "signInAs\|LoginPicker" app components lib     # must print nothing
```

If the first `grep` shows something *other* than the canonical import,
stop and look at that importer before deleting anything.

### Then

```bash
node scripts/verify-sync.js     # repeat until it prints: OK
npm install                     # also generates the Prisma client (postinstall)
npx prisma validate
npm run build                   # runs the hygiene check first, then next build
git add -A && git commit -m "Sync Stage 1 auth package" && git push
```

`npm run build` runs `scripts/check-repo-hygiene.js` automatically
(`prebuild`). It stops early, in plain English, if it finds a stray
root-level source file, two same-named components in different folders,
or any reference to the removed `signInAs` / `LoginPicker`. It does not
replace or weaken `next build`'s own type-checking.

## What the tools cannot tell you

* Files you edited on purpose will show as `STALE` — that is correct;
  decide whether the edit should be kept.
* A clean `verify-sync` proves the repository matches the package. It does
  **not** prove the package builds; only a real `npm run build` does.
