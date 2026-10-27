# Design System — AICTE Security Deposit & FDR Management Portal

> **Purpose:** The single source of truth for the product's visual language and interaction patterns.
> **Reference:** Stripe's logged-in dashboard and financial operations UI—not its colorful marketing website.
> **Theme:** Light mode only. Blue-led palette. Professional, precise, accessible, data-first.
> **Rule:** Extend this system consistently. Do not invent a new visual style for each page.

---

## 1. Design principles

1. **Clarity over decoration.** Every visual element should help users understand information or complete a task.
2. **Data-first.** FDR identifiers, amounts, maturity dates, statuses, and review actions must be easy to scan.
3. **Consistent geometry.** Use the same spacing, typography, control heights, borders, and alignments throughout the application.
4. **Quiet surfaces.** Prefer white surfaces, subtle blue-gray backgrounds, thin borders, and minimal shadows.
5. **Honest interactions.** Every visible control must work. Never show success until the server confirms it.
6. **Accessible by default.** Keyboard support, visible focus, semantic HTML, readable contrast, and clear validation are mandatory.
7. **Role-aware.** Navigation, data, and actions must match the authenticated user's permissions.
8. **No decorative complexity.** Avoid excessive animation, gradients, glassmorphism, neon colors, and charts without a purpose.

## 2. Product visual direction

The interface should feel like a polished financial operations dashboard: restrained, trustworthy, efficient, and modern.

Use Stripe's dashboard as a reference for:
- Persistent left navigation.
- Compact top bar with search and account utilities.
- Clear page titles and section dividers.
- Financial summaries with strong numeric hierarchy.
- Subtle chart styling and date-range controls.
- Compact, legible tables and status indicators.
- Consistent padding and alignment.

Do **not** copy Stripe branding, logos, proprietary assets, or exact product-specific UI. Do not imitate Stripe's marketing-site gradients. The portal must have its own blue identity appropriate to an institutional FDR workflow.

## 3. Color tokens

Use these tokens rather than ad hoc color values.

### Brand and surfaces

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#1D4ED8` | Primary buttons, active links, selected controls |
| `--color-primary-hover` | `#1E40AF` | Hover state for primary actions |
| `--color-primary-active` | `#1E3A8A` | Pressed state |
| `--color-primary-subtle` | `#EFF6FF` | Selected navigation and soft blue surfaces |
| `--color-primary-border` | `#BFDBFE` | Borders for selected/blue surfaces |
| `--color-page` | `#FFFFFF` | Main page canvas, Stripe-inspired |
| `--color-surface` | `#FFFFFF` | Cards, tables, dialogs, menus |
| `--color-surface-subtle` | `#F6F8FB` | Muted panels, filter areas, secondary surfaces |
| `--color-surface-hover` | `#F1F5F9` | Hover rows and interactive surface hover |
| `--color-border` | `#E2E8F0` | Default dividers and borders |
| `--color-border-strong` | `#CBD5E1` | Emphasized borders |
| `--color-focus` | `#2563EB` | Visible keyboard focus ring |

### Text

| Token | Value | Usage |
|---|---|---|
| `--color-text` | `#0F172A` | Main headings and primary content |
| `--color-text-secondary` | `#475569` | Supporting text and descriptions |
| `--color-text-muted` | `#64748B` | Metadata and low-emphasis labels |
| `--color-text-inverse` | `#FFFFFF` | Text on dark/primary filled controls |
| `--color-link` | `#1D4ED8` | Links |
| `--color-link-hover` | `#1E40AF` | Hovered links |

### Semantic status colors

| Status | Foreground | Background | Usage |
|---|---|---|---|
| Success | `#166534` | `#F0FDF4` | Completed or approved |
| Warning | `#92400E` | `#FFFBEB` | Attention required |
| Error | `#B91C1C` | `#FEF2F2` | Rejected, failed, or destructive context |
| Information | `#1D4ED8` | `#EFF6FF` | Informational state |
| Neutral | `#475569` | `#F1F5F9` | Draft or unspecified state |

Rules:
- Blue is the primary accent; **do not use purple as the primary or default accent**.
- Use semantic colors only to communicate meaning, not for decoration.
- Do not communicate a status through color alone; include text or an icon with an accessible label.
- Do not use gradients as standard surfaces or button fills.
- Maintain sufficient text and control contrast.
- Use red only for errors and destructive actions, not as a general accent.
- If official branding requirements are provided later, reconcile them deliberately rather than introducing arbitrary colors.

## 4. Typography

### Font family
Use **Inter** where available, with a system sans-serif fallback:
`Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.

Use one type family throughout the application. Do not mix decorative display fonts with the interface font.

### Type scale

| Token | Size | Weight | Usage |
|---|---:|---:|---|
| Page title | 28px | 600 | Main page heading |
| Section heading | 20px | 600 | Major page sections |
| Card/section title | 16px | 600 | Card headings and table section titles |
| Body | 14px | 400 | Default interface text |
| Body emphasis | 14px | 500–600 | Important values and labels |
| Form label | 13px | 500 | Input labels |
| Table content | 13–14px | 400 | Dense operational data |
| Metadata | 12px | 400 | Timestamps and secondary metadata |
| Button text | 14px | 500 | Button labels |

Rules:
- Use sentence case for page titles, labels, buttons, and navigation.
- Keep heading hierarchy consistent; do not skip levels for visual styling.
- Use readable line heights: approximately 1.4–1.6 for body text.
- Avoid oversized headings on operational pages.
- Use tabular numerals for currency, totals, and aligned numeric data when supported.
- Do not use very light font weights for essential information.
- Do not shrink text to fit a crowded layout; adjust the layout instead.

## 5. Spacing and layout

Use a 4px-based spacing scale:

| Token | Value |
|---|---:|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |

Layout rules:
- Use a consistent content grid and align page titles, filters, tables, and cards to it.
- Desktop main-content horizontal padding: usually 32px; allow 24px on narrower viewports.
- Space between page title and its first content section: usually 24–32px.
- Space between related controls: 8–12px.
- Space between major sections: 24–32px.
- Use 16–24px internal card padding depending on density.
- Do not add arbitrary one-off margins to fix alignment.
- Avoid unnecessary nested cards and excessive empty space.
- The dashboard may be spacious, but record-heavy pages must remain operationally efficient.

## 6. Application shell

### Desktop
- Left sidebar: approximately 216–240px wide.
- Top application bar: approximately 56–64px high, excluding any separate environment/status banner.
- Main content uses the remaining viewport width.
- Use a subtle 1px divider between navigation and content.
- Sidebar may remain fixed while the main content scrolls.
- Avoid excessive shadows around the shell.

### Sidebar
Potential items, subject to approved requirements and user role:
- Overview
- FDR records
- New submission
- Review queue
- Maturity tracking
- Reports
- Audit history
- User management (authorized administrators only)

Rules:
- Use one consistent outline icon set, preferably Lucide.
- Icons should generally be 16–18px.
- Align icons and labels consistently.
- Active navigation uses blue text and a subtle blue background; avoid a large saturated block unless needed for contrast.
- Expandable groups must show clear expanded/collapsed state.
- Hide or disable unavailable features honestly; never imply a user can perform an unauthorized action.
- Use tooltips only where they improve clarity, not as a replacement for essential labels.

### Top bar
May include:
- Search, if it has real functionality.
- Breadcrumbs or page context where useful.
- Notifications, help, and profile controls if implemented.
- Environment label only for a real development/demo environment.

Do not create decorative or nonfunctional top-bar icons.

## 7. Page headers and content hierarchy

Every primary page should have:
1. A clear page title.
2. Optional short description when it adds context.
3. A primary action, if the user has permission and the page needs one.
4. Secondary actions grouped consistently.
5. A divider or spacing boundary before the main content when useful.

Rules:
- Do not repeat the same title in multiple adjacent cards.
- Keep actions in predictable locations.
- Use breadcrumbs only for meaningful hierarchy.
- Avoid promotional hero sections inside authenticated operational pages.
- Do not add page-level charts merely to fill whitespace.

## 8. Dashboard and metric cards

Dashboard content should answer:
- What is the current state?
- What needs attention?
- What should this user do next?

Possible metrics, only if required and backed by real data:
- Total FDR records.
- Pending review.
- Approved records.
- Records approaching maturity.
- Total secured amount, where users are authorized to see it.

Metric-card rules:
- Use white surfaces and subtle borders.
- Keep labels small and muted; make the value the visual focus.
- Use consistent card padding and heights within a row.
- Do not give every metric a different accent color.
- Do not use decorative illustrations inside metric cards.
- Use comparison values only when a meaningful and correctly computed comparison exists.
- Clearly label seeded demo data.
- Do not expose cross-institution totals to users without permission.

## 9. Charts and graphs

Charts must resemble restrained financial analytics—not decorative marketing graphics.

### Visual rules
- Use blue as the default data-series color: `#2563EB`.
- Use additional series only when comparisons require them; choose accessible, distinguishable colors.
- Use thin 1–1.5px gridlines in `#E2E8F0`.
- Use muted axis labels in `#64748B`, typically 12px.
- Keep chart backgrounds transparent or white.
- Avoid thick borders, gradients, 3D charts, and strong drop shadows.
- Use subtle point markers only when they aid interpretation.
- Use a restrained blue fill under a line only when it improves readability.
- Keep legends small and near the chart.
- Use a consistent tooltip surface with clear labels and formatted values.
- Do not animate charts in ways that delay access to information.

### Chart behavior
- Every chart needs a descriptive title and, where needed, a subtitle or unit.
- Include date-range controls only when they work.
- Use consistent date ranges and time zones.
- Show units for currency, counts, and percentages.
- Provide meaningful empty, loading, and error states.
- Tooltips must be keyboard-accessible where the charting library supports it.
- Never invent or hardcode live-looking analytics.
- Do not use a pie/donut chart when a simple number or table is clearer.
- Charts must respect the user's data permissions.

### Suitable FDR visualizations
Use only when they help a real workflow:
- FDR maturity timeline or maturity buckets.
- Monthly submission volume.
- Status distribution.
- Authorized aggregate amount over time.

Avoid charts that imply interest, returns, financial forecasts, or banking status unless the data and rules support those calculations.

## 10. Tables and data grids

Tables are core product components.

### Table appearance
- White background.
- Subtle horizontal row dividers.
- No heavy border around every cell.
- Header text: 12–13px, medium weight, muted color.
- Body text: 13–14px.
- Row height: usually 48–56px, adjusted for content.
- Consistent cell padding, usually 12–16px horizontally.
- Hover row background: `#F8FAFC` or `#F1F5F9`.
- Avoid decorative zebra stripes unless testing shows they improve readability.

### Alignment
- Text and reference identifiers: left aligned.
- Amounts and numeric values: right aligned where practical.
- Dates: consistent formatting.
- Row actions: consistently placed at the end of the row.

### Behavior
- Search, filters, sorting, and pagination must work if displayed.
- Clearly identify active filters and provide a way to clear them.
- Preserve filters when returning from a record detail page when practical.
- Provide empty, loading, error, and no-results states.
- Make long identifiers accessible in full and easy to copy when useful.
- Use responsive horizontal scrolling or a deliberate compact/card layout on narrow screens.
- Do not hide critical fields without an alternative way to inspect them.
- Apply authorization on the server; filtering the visible rows in the client is not a security boundary.

## 11. Forms and inputs

- Use visible labels for every field.
- Do not use placeholder text as the only label.
- Mark required fields and explain expected formats.
- Use consistent input heights, usually 40px; compact controls may be 36px when appropriate.
- Use 8px corner radii consistently.
- Use a 1px neutral border by default.
- On focus, use a clearly visible blue border and focus ring.
- Place help text and validation messages close to the relevant field.
- Keep related fields in logical sections.
- Use two-column layouts only when there is enough width and the fields are logically related.
- On mobile, stack form fields into one column.
- Preserve valid user-entered data after recoverable failures.
- Validate on the server even if client-side validation exists.
- Prevent repeated submission while a request is in progress.
- Show the actual outcome of the operation; do not display success before confirmation.

For long workflows, use a stepper only when it helps users understand progress. Provide a review step before final submission when appropriate.

## 12. Buttons and actions

### Primary
- Blue fill `#1D4ED8`, white text.
- Hover `#1E40AF`.
- Used for the main action on a page or form.

### Secondary
- White background, neutral border, dark text.
- Used for supporting actions.

### Tertiary
- Transparent background with readable text.
- Used for low-emphasis actions and inline controls.

### Destructive
- Reserved for destructive or high-risk actions.
- Use red text or red treatment appropriate to severity.
- Confirm irreversible actions.

General rules:
- Standard button height: 36–40px.
- Use 8px corner radii.
- Keep button labels concise and action-oriented, e.g. “Submit FDR” rather than “Continue” when possible.
- Include hover, focus, active, disabled, and loading states.
- Do not use color alone to distinguish critical actions.
- Do not render fake buttons or inert links.
- Confirmation must not replace server-side authorization or validation.

## 13. Status badges and workflow indicators

Use one shared status component everywhere.

Illustrative mapping; confirm actual statuses against the approved workflow:
- Draft: neutral.
- Submitted: blue.
- Under review: amber.
- Changes requested: amber/orange.
- Approved: green.
- Rejected: red.
- Matured/expired: neutral or warning according to the business rule.

Rules:
- Use a small pill with restrained padding and readable text.
- Use consistent colors across tables, detail pages, dashboards, and audit history.
- Always display a text label.
- Do not invent status values or allow transitions just because a UI option exists.
- Display status history and decision remarks where the workflow requires them.

## 14. Cards, panels, menus, and dialogs

### Cards and panels
- White background.
- 1px `#E2E8F0` border.
- 8–12px corner radius.
- Usually no shadow; use only a subtle shadow for meaningful elevation.
- 16–24px padding.
- Clear title/content/action hierarchy.

### Menus and popovers
- White surface with a subtle border and restrained shadow.
- Consistent item height and hover background.
- Clear keyboard focus and dismissal behavior.

### Dialogs
- Use for focused decisions, confirmation, and short workflows.
- Provide a clear title, concise explanation, and explicit actions.
- Support keyboard navigation and focus management.
- Do not use a dialog for a complex multi-section workflow that belongs on a page.

## 15. Notifications and feedback

- Success: green semantic treatment.
- Warning: amber semantic treatment.
- Error: red semantic treatment.
- Information: blue semantic treatment.

Rules:
- Keep messages concise, specific, and actionable.
- Use inline errors for field-specific problems.
- Use page-level alerts for broader failures.
- Toasts are for non-blocking feedback, not the only record of important decisions.
- Do not make important messages disappear before users can read them.
- Never suppress errors or replace them with false success messages.

## 16. FDR documents and file uploads

Upload interfaces must show:
- Accepted file types.
- Maximum file size.
- Upload progress.
- Success or failure.
- Filename and relevant metadata.
- Retry or remove actions where permitted.

Rules:
- Validate file type, size, and content as appropriate on the server.
- Store sensitive documents privately.
- Verify authorization before download or preview.
- Do not expose public storage URLs for private documents.
- Never show an upload as complete before storage confirms success.
- Make document status clear without relying on color alone.

## 17. Financial data and date formatting

- Use INR formatting for INR-denominated amounts, with Indian grouping where appropriate.
- Use consistent precision and decimal rules.
- Keep principal, interest, and maturity value separate if the approved model includes them.
- Never calculate or infer financial values without an approved business rule.
- Do not silently round stored values.
- Use a consistent, unambiguous date format across tables and details.
- Define the application's date and time zone policy explicitly.
- Handle maturity-date boundaries consistently.
- Display missing values as “Not available” or another consistent explicit label, not fabricated zeros.
- Use tabular numerals for aligned financial figures.
- Provide units and context for all financial charts and metrics.

## 18. Loading, empty, error, and permission states

Every data-driven page must handle:
- Initial loading.
- Empty data.
- No results after filtering.
- Failed request.
- Invalid input.
- Permission denied.
- Expired session, where applicable.
- Successful action.
- Partial failure, where relevant.

Rules:
- Use skeletons only where they improve perceived loading and match the content shape.
- Empty states should explain what is absent and provide a valid next action.
- Error states should be truthful and offer a safe retry when possible.
- Do not substitute sample data for a failed live request.
- Never leave a control loading indefinitely after failure.
- Never reveal whether another institution has a particular private record through error messages.

## 19. Responsive design

### Desktop
- Full sidebar.
- Multi-column dashboard when useful.
- Full operational tables.
- Main content aligned to a consistent grid.

### Tablet
- Collapsible sidebar.
- Adaptive metric-card grid.
- Tables may scroll horizontally within their container.

### Mobile
- Compact navigation.
- Single-column forms.
- Readable detail layouts.
- Touch-friendly interactive targets.
- No clipped primary actions or horizontal page overflow.
- Tables should use deliberate responsive behavior rather than shrinking text until unreadable.

Test at narrow mobile, tablet, and wide desktop widths. Responsive behavior must be designed, not left to accidental CSS wrapping.

## 20. Accessibility

Target WCAG 2.2 AA where practical and applicable.

- All interactive controls must work with a keyboard.
- Show a visible focus indicator.
- Use semantic HTML and correct heading order.
- Associate labels, instructions, and errors with form controls.
- Provide accessible names for icon-only buttons.
- Announce important status and validation changes to assistive technology.
- Maintain sufficient text and control contrast.
- Do not communicate status through color alone.
- Respect reduced-motion preferences.
- Do not disable browser zoom.
- Use charts with textual summaries or accessible data alternatives where possible.

## 21. Icons and imagery

- Prefer Lucide outline icons for interface controls.
- Use a consistent 16–20px icon size for most controls.
- Pair important icons with text labels.
- Do not use emoji as interface icons.
- Avoid stock imagery in operational dashboards.
- Do not invent official seals, government logos, or endorsements.
- Use official assets only when supplied and authorized.
- Avoid decorative illustrations in tables, forms, and record-detail screens.

## 22. Animation and transitions

- Keep motion subtle and purposeful.
- Short transitions may be used for hover, focus, dropdowns, and dialogs.
- Do not animate every element on page load.
- Avoid parallax, floating decorations, excessive blur, and attention-seeking motion.
- Never delay critical actions for an animation.
- Respect reduced-motion settings.
- Avoid chart animations that obscure or delay data interpretation.

## 23. Component reuse and implementation

Build and reuse shared components for:
- Application shell and navigation.
- Page header and breadcrumbs.
- Buttons and form controls.
- Status badges.
- Tables, filters, and pagination.
- Metric cards.
- Charts and chart tooltips.
- Dialogs, menus, and notifications.
- File uploads and document metadata.
- Empty, loading, error, and permission states.

Rules:
- Inspect existing components before creating new ones.
- Reuse design tokens rather than hardcoding values.
- Keep presentation separate from business logic where practical.
- Do not add a new component library without a clear reason and approval.
- Do not duplicate nearly identical components for different pages.
- Any approved exception must be documented.

## 24. Prohibited patterns

Do not introduce these without explicit approval:
- Purple as the primary accent.
- Dark mode.
- Unnecessary gradients or gradient-filled buttons.
- Glassmorphism-heavy surfaces.
- Neon colors.
- Inconsistent font families, radii, or spacing.
- Excessive shadows or nested cards.
- Decorative graphs without meaningful data.
- Fake search, filters, pagination, or buttons.
- Hardcoded production-looking metrics.
- Unapproved official branding.
- Color-only status indicators.
- Client-only authorization.
- Placeholder success messages.
- UI controls that imply unsupported workflow transitions.

## 25. Design acceptance checklist

Before marking a UI task complete, verify:

- [ ] Follows this design system and uses blue—not purple—as the primary accent.
- [ ] Uses the approved typography, spacing, borders, and component styles.
- [ ] Aligns page headings, filters, cards, charts, and tables consistently.
- [ ] Uses restrained financial chart styling and correctly labeled units.
- [ ] Works at desktop, tablet, and mobile sizes.
- [ ] Includes relevant loading, empty, error, and success states.
- [ ] Has accessible labels, focus states, and keyboard interaction.
- [ ] Displays real authorized data or clearly labeled demo data.
- [ ] Every visible control performs its advertised action.
- [ ] Does not imply unauthorized access or unsupported workflow transitions.
- [ ] Has been visually reviewed in the running application.
- [ ] Has passed relevant automated checks.

## Final rule

This document is the single source of truth for the application's visual language. Before creating or modifying UI, read this file and inspect the existing shared components. Extend the established system instead of inventing a new style for each screen.
