# MileGuard Frontend Rewire – Final Implementation

This package is frontend-only and is intended to be merged into the existing Angular frontend workspace.

## Completed architecture changes

- Preserved the existing business/API service layer and gateway boundary.
- Added/standardized PublicShell, AuthenticatedShell, CustomerShell, AgentShell, UnderwriterShell, ClaimsOfficerShell and AdminShell.
- Split routing into public, authentication, customer, agent, underwriter, claims-officer, admin and account route trees.
- Added role dashboards for Customer, Agent, Underwriter, Claims Officer and Admin.
- Added state/facade boundaries for Underwriting, Claims Officer and Admin workflows.
- Added the missing public landing screen and account-profile route.
- Normalized Claims Adjuster role handling while retaining legacy role-name compatibility.
- Added a MileGuard shared UI foundation and design tokens.
- Removed direct service-host references from the frontend source; browser-facing API calls continue through the gateway base URL.
- Fixed relative-source reconstruction paths and four existing claims unit-test class-name mismatches.
- Retained legacy route aliases where useful for compatibility.

## Scope boundary

The backend source was not modified and is not included in the ZIP.

Angular CLI, Angular packages and `node_modules` were not installed or generated.
The existing Angular workspace metadata and dependency versions are intentionally left to the user's existing frontend project.
