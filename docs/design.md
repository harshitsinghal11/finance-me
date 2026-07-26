# Design System & UI Guidelines

This document outlines the standard UI guidelines, typography, and styling rules to ensure the Finance-Me application remains perfectly consistent, clean, and professional.

## 1. Typography & Fonts

We use the standard font families defined in `globals.css` (`var(--font-sans)`). 

### Font Sizes (Desktop & Tablet)
- **Heading 1 (H1 - Page Titles):** `text-3xl font-bold` (30px)
- **Heading 2 (H2 - Section Titles):** `text-2xl font-semibold` (24px)
- **Heading 3 (H3 - Card Titles):** `text-xl font-medium` (20px)
- **Subheading / Lead Text:** `text-lg text-text-secondary` (18px)
- **Body Text:** `text-base text-text` (16px)
- **Small Text (Labels/Captions):** `text-sm text-text-secondary` (14px)
- **Micro Text (Badges/Tags):** `text-xs font-medium` (12px)

### Font Sizes (Mobile Consistency)
On mobile devices (`sm:` tailwind breakpoint and below), typography scales down slightly to prevent crowding:
- **H1:** `text-2xl font-bold`
- **H2:** `text-xl font-semibold`
- **H3:** `text-lg font-medium`
- **Body:** `text-base` (Never smaller than 16px to prevent iOS auto-zoom on inputs)

## 2. Icons
- **Library:** `lucide-react`
- **Standard Size:** `w-5 h-5` (20px)
- **Small/Inline Size:** `w-4 h-4` (16px)
- **Large Size (Empty States):** `w-12 h-12` (48px)
- **Color:** Icons should inherit the text color (`text-current`) or use `--color-text-secondary` for non-active states.

## 3. Styling Constraints (Strict Rules)

To maintain a highly professional, enterprise-grade aesthetic, adhere strictly to the following constraints:

### ❌ What to Avoid
1. **No Backdrop Filters:** Avoid using `backdrop-blur` or glassmorphism effects. They cause performance issues on low-end devices and distract from the financial data.
2. **Limit Rounded Corners:** Do not use `rounded-full` or `rounded-3xl` for standard containers. 
3. **Limit Shadows:** Do not apply box-shadows to every element. Flat design is preferred for financial data density.
4. **Limit Hover Effects:** Avoid excessive scaling (`hover:scale-105`), bouncing, or dramatic color shifts on hover. 

### ✅ What to Do Instead
1. **Standard Borders & Radius:** Use `rounded-md` or `rounded-lg` for cards, inputs, and buttons. Keep borders subtle (`border-border`).
2. **Subtle Shadows:** Use the shadows defined in `globals.css` (`var(--shadow-sm)`) only on primary interactive elements (like the main "Add Member" button or dropdown menus).
3. **Clean Hover States:** For buttons and links, simply darken the background slightly (`var(--color-button-hover)`) or change the text color. No layout-shifting hover animations.
4. **Solid Backgrounds:** Use the established `--color-background` and `--color-surface` variables for clear separation of content.
