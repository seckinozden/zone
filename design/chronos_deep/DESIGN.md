---
name: Chronos Deep
colors:
  surface: '#13131b'
  surface-dim: '#13131b'
  surface-bright: '#393841'
  surface-container-lowest: '#0d0d15'
  surface-container-low: '#1b1b23'
  surface-container: '#1f1f27'
  surface-container-high: '#292932'
  surface-container-highest: '#34343d'
  on-surface: '#e4e1ed'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e4e1ed'
  inverse-on-surface: '#303038'
  outline: '#908fa0'
  outline-variant: '#464555'
  surface-tint: '#c1c1ff'
  primary: '#c1c1ff'
  on-primary: '#1200a9'
  primary-container: '#5d5fef'
  on-primary-container: '#faf7ff'
  inverse-primary: '#4849da'
  secondary: '#ffb1c6'
  on-secondary: '#650030'
  secondary-container: '#b6005c'
  on-secondary-container: '#ffc6d4'
  tertiary: '#ffb689'
  on-tertiary: '#512300'
  tertiary-container: '#b65700'
  on-tertiary-container: '#fff6f3'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c1c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2e2bc2'
  secondary-fixed: '#ffd9e1'
  secondary-fixed-dim: '#ffb1c6'
  on-secondary-fixed: '#3f001b'
  on-secondary-fixed-variant: '#8e0046'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#ffb689'
  on-tertiary-fixed: '#321300'
  on-tertiary-fixed-variant: '#743500'
  background: '#13131b'
  on-background: '#e4e1ed'
  surface-variant: '#34343d'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  sidebar-width: 280px
---

## Brand & Style

The design system is centered on high-focus personal productivity. It targets individuals who value cognitive clarity and a "calm tech" experience. The personality is professional yet intimate, acting as a quiet companion rather than a demanding assistant.

The visual style is a blend of **Minimalism** and **Glassmorphism**. It utilizes a deep, monochromatic base to reduce eye strain, while employing translucent layers and vibrant task accents to guide attention. The aesthetic is premium and "pro-sumer," prioritizing information density without clutter.

- **Minimalism:** Strategic use of negative space around the calendar grid and sidebar.
- **Glassmorphism:** Subsurface blur on overlays (modals, popovers) and subtle transparency on inactive task states.
- **Calmness:** Soft transitions and a lack of aggressive borders create a seamless, fluid interface.

## Colors

The palette is anchored by a "Midnight Navy" base. We avoid pure black to maintain a softer, more premium feel and to keep the glass effects visible. 

- **Primary & Secondary:** Used for global actions, active states (e.g., today's date), and notifications.
- **Semantic Accents:** Task categories use high-chroma colors but are often rendered as thin "indicator" lines or soft, low-opacity fills to prevent the UI from feeling overwhelming.
- **Surface Tiers:**
    - `Background Canvas`: The deepest layer, used for the main app container.
    - `Background Surface`: Elevated panels like the sidebar or calendar headers.
    - `Glass Surface`: 60% opacity with a 12px backdrop blur for floating elements.

## Typography

The design system uses **Inter** exclusively to ensure maximum readability and a clean, systematic look. The type hierarchy relies on weight and subtle tracking adjustments rather than dramatic size shifts.

- **Display & Headlines:** Used for month names and major headers. We use a slight negative letter spacing for a tighter, more editorial feel.
- **Body Text:** Optimised for 15px to balance information density with legibility in the task list.
- **Labels:** Small caps are used for time markers (e.g., 10 AM) and metadata to distinguish them from actionable task titles.
- **Contrast:** Inactive text should drop to 50% opacity rather than shifting to a mid-grey to maintain the dark-mode harmony.

## Layout & Spacing

The design system employs a **Fluid Grid** for the calendar view and a **Fixed Sidebar** for navigation and task management.

- **The Calendar Grid:** Uses a flexible 7-column layout. Gutters are kept thin (1px or 2px) using subtle border lines (`#ffffff10`) to maximize the area for task blocks.
- **Rhythm:** An 8px base unit (4px sub-unit) dictates all padding and internal element spacing.
- **Breakpoints:**
    - **Desktop (>1024px):** Permanent sidebar, full 7-day or month view.
    - **Tablet (768px - 1023px):** Sidebar collapses into a drawer; 3-day "focus" view becomes the default.
    - **Mobile (<767px):** Single-day list view or vertical stack. Margins reduce to 16px.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Glassmorphism** rather than traditional heavy shadows.

- **Level 0 (Canvas):** Base background, used for the main workspace.
- **Level 1 (Sidebar/Header):** Slightly lighter than canvas, used to define structural zones.
- **Level 2 (Cards/Tasks):** Floating elements with a subtle 1px border (`#ffffff15`).
- **Level 3 (Overlays):** Used for task details or date pickers. These utilize a 20px backdrop blur and a soft, wide ambient shadow (0px 20px 40px rgba(0,0,0,0.4)) to separate them from the grid.
- **Indicators:** Use "Glow" effects (inner shadows or drop shadows matching the accent color) to indicate active "Now" status or high-priority alerts.

## Shapes

The shape language is "Soft-Modern." We use generous rounding to counteract the technical nature of a calendar grid.

- **Default (0.5rem):** Standard task blocks, input fields, and buttons.
- **Large (1rem):** Sidebar containers and main modals.
- **Pill:** Search bars, status chips, and the "Current Time" indicator on the timeline.
- **Consistency:** All nested elements (like checkboxes within a task card) should follow the same curvature ratio to maintain visual harmony.

## Components

- **Task Cards:** Use a left-aligned vertical accent bar (4px width) to denote category. The background should be a subtle 8% tint of the category color or a dark neutral.
- **Buttons:**
    - *Primary:* Solid fill with white or high-contrast text.
    - *Ghost:* No fill, 1px border, used for secondary grid actions.
- **Checkboxes:** Custom circular style. When checked, the task title should trigger a strike-through and drop to 40% opacity.
- **Inputs:** Minimalist with only a bottom border in the default state, expanding to a full-border glass box on focus.
- **Time Indicator:** A horizontal line across the calendar grid with a glowing "pill" head to mark the current time.
- **Chips/Badges:** Used for tags or attendee counts; these should be low-profile with `body-sm` typography.