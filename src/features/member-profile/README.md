# My profile editor (inactive)

These files retain the member profile editor for later use. This folder is outside `src/app`, so Next.js does not build or host its route. Directory contact profiles remain active.

To restore the editor, move `page.tsx`, `layout.tsx`, and `UpdateClient.tsx` back to `src/app/update`, restore the approved-member middleware matcher and navigation links, and restore the editor integration check. Its server-side access checks and submission API are retained.
