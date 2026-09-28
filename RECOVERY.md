# Workspace loss & recovery — 28 Sep 2026

## What happened
The sandbox reset and the workspace snapshot came back **empty** (`/home/user` was 0 bytes).
The site was recovered from a full-workspace zip the owner had on Google Drive (135 MB),
pulled down with `curl` and extracted selectively.

## Root cause
The saved workspace was **129.3 MB — over the ~128 MB snapshot cap**. Snapshots are best-effort
capped; once past the ceiling the restore failed rather than restoring partially.

The website was never the problem. The weight breakdown of the zip was:

| Folder | Size | Role |
|---|---|---|
| `uploads/` | 85.2 MB | screenshots, PDFs, decks, photos — **ballast** |
| `daylight/` | 21.3 MB | reference clone of godaylight.com — not needed to run the site |
| `netso/` | 13.6 MB | **the actual website** |
| `research/` | 5.6 MB | reference material |
| `image-search/` | 3.6 MB | stock rooftops |

## What was restored to the live workspace
Only `netso/` (the site, with its git history) plus the three logo PNGs into `uploads/`.
The heavy folders were deliberately left **out** of the live workspace so the snapshot stays
well under the cap. They remain safe in the owner's Drive zip (and `/tmp/workspace.zip` for this
session only — `/tmp` is not persisted).

## Prevention — keep the live workspace lean
- Do **not** re-extract `uploads/`, `daylight/`, or `research/` into `/home/user`. Pull individual
  assets from `/tmp/workspace.zip` on demand:
  `unzip -j /tmp/workspace.zip 'uploads/<file>' -d /home/user/uploads`
- Keep large binaries (video, raw photo dumps, decks) out of the persisted tree. Park working
  copies in `/tmp` (excluded from snapshots) or fetch them from a link when needed.
- **Commit `netso/` work as you go.** The logo installation was lost the first time only because
  it was never committed — the download predated it. Git history is the real safety net.
