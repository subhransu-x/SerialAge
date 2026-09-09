---
description: Run the project's checks, build, and browser verification, then fix any problems found.
---

# Test and Verify

Use this workflow after a meaningful code change or when the user asks to verify the project.

## 1. Understand the project

- Inspect package.json and the project's available scripts before running commands.
- Identify the appropriate test, lint, type-check, and build commands from the existing project.
- Do not invent commands that the project does not support.

## 2. Run automated checks

Run the relevant checks available in the project, prioritizing:

- TypeScript/type checking
- Linting
- Unit/integration tests
- Build

If one check fails:

- Inspect the actual error.
- Determine whether the failure was caused by the recent change.
- Fix the underlying problem.
- Re-run the failed check.

Do not simply suppress errors or weaken tests to make them pass.

## 3. Run the application

Start the development or preview server using the project's existing scripts when appropriate.

Check that:

- The application starts successfully.
- There are no obvious runtime errors.
- There are no unexpected console errors.

## 4. Browser verification

When browser access is available, verify the affected functionality in the actual rendered application.

For UI changes:

- Check the relevant page and interactions.
- Check desktop layout.
- Check mobile/responsive behavior.
- Check navigation and forms where relevant.
- Check loading, empty, and error states when relevant.

For SerialAge pages specifically:

- Verify the affected manufacturer/model functionality.
- Verify relevant URLs and navigation.
- Verify important visible SEO content renders correctly.
- Verify no unrelated manufacturer or page was accidentally changed.

## 5. Build and production-like verification

After fixing issues:

- Run the build again.
- When the project generates prerendered/static output, inspect the generated output relevant to the changed page.
- Verify important metadata and visible content when the change affects SEO or prerendering.

## 6. Final review

Before reporting completion:

- Review the Git diff.
- Confirm only intentional files were changed.
- Confirm no secrets, credentials, debug code, or temporary files were added.
- Confirm the final checks pass.

## Completion rule

Do not say the task is verified, fixed, working, or complete unless the relevant checks have actually been run and the result supports that claim.

If something could not be tested, clearly state what could not be tested and why.
