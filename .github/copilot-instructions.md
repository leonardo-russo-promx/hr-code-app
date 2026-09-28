# proMX HR Portal — Copilot Instructions

## Design Guide
This project has a brand design guide at `design-guide.md` in the project root.

When creating or modifying UI components, always:
- Refer to `design-guide.md` for colour palette, typography, spacing, component patterns, and information architecture rules.
- Use the CSS custom properties defined in `src/styles/design-tokens.css` — never hardcode colour values, font stacks, or spacing.
- The **primary brand colour is proMX teal `#00acad`** (`--color-primary`). There is no orange in the palette.
- Follow the breakpoints and responsive behaviour described in the design guide.
- Match the navigation pattern (persistent left sidebar, deep teal) and 5-destination information architecture.
- Maintain WCAG AA contrast (use `--color-primary-dark` for small text on light backgrounds).

## Data Access
- Use the generated Dataverse services in `src/generated/services/` (e.g. `Promx_holidayrequestsService.getAll()`), never fetch/axios.
- FAQ uses `MicrosoftCopilotStudioService.ExecuteCopilotAsyncV2` with agent schema name `npmx_proMXHR`.
