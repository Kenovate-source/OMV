# Is my repository actually in sync with this package?

Two Vercel build failures in this project have had the same cause: some
files from a delivered package reached the repository and others did not
(a new file calling into an old one, or the reverse). TypeScript then
reports an error that looks like a bug but is really a version mismatch.

`docs/FILE-MANIFEST.sha256` lists a SHA-256 checksum for every source
file in the package. Run this from the **repository root** (the folder
that contains `package.json`):

**Linux / Git Bash on Windows**
```bash
sha256sum -c docs/FILE-MANIFEST.sha256 2>/dev/null | grep -v ': OK$'
```

**macOS**
```bash
shasum -a 256 -c docs/FILE-MANIFEST.sha256 2>/dev/null | grep -v ': OK$'
```

* **No output** = every listed file matches the package exactly.
* `path: FAILED` = that file differs from the package (stale or edited).
* `path: FAILED open or read` = that file is missing from your repository.

Copy the files that are reported, then commit them **together**, and
re-run the command until it prints nothing.

Files you may have legitimately changed (and so may show FAILED
harmlessly): `package.json` (if you regenerated it), anything you edited
on purpose. Lockfiles are not in the manifest.

## Quick manual check for the specific error that prompted this file

```bash
grep -rn "signInAs\|LoginPicker" app components lib
```
This must print **nothing**. If it prints `components/admin/AdminShell.tsx`,
that file is the old version — replace it with the one in this package.

## After syncing

```bash
npm install          # also regenerates the Prisma client via postinstall
npx prisma validate
npm run build        # the authoritative type-check; this has never been run on this code
```
Commit the updated `package-lock.json` that `npm install` produces.
