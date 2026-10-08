# MileGuard Frontend — Completed Architecture Rewire

This package contains the frontend source reconstructed from the files supplied in the conversation and updated to the MileGuard architecture blueprint.

## What was completed

- PublicShell + public/auth route ownership
- AuthenticatedShell composition
- CustomerShell
- AgentShell
- UnderwriterShell
- ClaimsOfficerShell
- AdminShell
- Role-aware dashboard entry points
- Role-specific route files
- Legacy URL compatibility redirects
- Claims Adjuster / ClaimsOfficer role-name compatibility
- Signal-based Underwriter / Claims Officer / Admin state boundaries
- Shared MileGuard design tokens and global styling
- Shared icon primitive used by the supplied account profile page
- Public/system workflow state routes
- Existing service/page dumps retained in their original feature-oriented structure so the backend-facing API code stays unchanged

## Intentionally not included

The supplied material did not include the existing Angular workspace metadata (`package.json`, `angular.json`, lockfile, etc.). Those files were not invented. Angular was not installed and no dependency installation was performed.

Use this source tree as the implementation to overlay onto the existing Angular workspace, retaining that workspace's package/configuration files.

Backend code is not changed by this package.


## Final rewiring scope
- PublicShell, AuthenticatedShell and role-specific shells for Customer, Agent, Underwriter, Claims Officer and Admin.
- Route trees split by role, with compatibility redirects retained where practical.
- Role dashboards added for all authenticated roles.
- Underwriter, Claims Officer and Admin facade/state boundaries added.
- Account profile routed separately from insurance profile.
- Existing business APIs and backend contracts are preserved; backend files are not included.
- Angular CLI/package installation was not performed.

## Shared UI foundation
The final overlay includes lightweight standalone MileGuard shared components for buttons, cards, status badges, page/section headers, loading/error/empty states, confirmation dialogs, action cards and the reusable journey progress treatment.

## Integration note
Copy/merge this `src/` tree and `index.html` into your existing Angular frontend workspace. Keep your existing Angular CLI metadata and dependency versions (for example `package.json`, `angular.json`, lock files, and installed packages). They were not supplied with the source dumps and were intentionally not fabricated here.
