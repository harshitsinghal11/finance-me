# 04 UI UX

## Typography
- Google `Quicksand` is loaded in `app/layout.tsx` and exposed as `--font-quicksand`.
- `app/globals.css` also defines `--font-sans` and `--font-mono` tokens, but the body currently uses `Arial, Helvetica, sans-serif`.

## Visual Direction
- The active color system is a light theme with emerald brand accents and slate neutrals.
- Shared tokens are defined in `app/globals.css` for:
  brand, background, surface, border, text, button, focus, and semantic colors.

## Layout Patterns
- `Navbar` is used on dashboard and member routes.
- `Footer`, `Toaster`, and `GlobalHelp` are mounted globally in the root layout.
- Most primary screens use card-based surfaces with borders and subtle shadows.

## Motion
- Page transitions use `AnimatedPage`.
- Modals and overlays in dashboard metrics, financial summary, help, and status menus use Framer Motion.

## Loading States
- Login shows a spinner during Google sign-in.
- Setup, member save, family save, delete actions, installment update, and status update all expose in-button loading states.

## Empty States
- Due Today widget:
  shows an "All Caught Up" state when nothing is due.
- Recent Members widget:
  shows a "No Members Yet" state.
- Members table:
  shows a no-results state for searches or empty lists.
- Installment table:
  shows a no-installments state.
- Family section:
  shows a no-family-members state.

## Interaction Patterns
- Search input is debounced.
- Filter and sort are controlled from URL query parameters.
- Global help opens with `?` and closes with `Escape`.
- Several modal views close on `Escape`.

## Forms
- Member entry is split into:
  personal details, family members, financial details, guarantor details, checklist, and document uploads.
- Numeric and phone inputs are restricted at input level in shared field components.
