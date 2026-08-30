---
name: ui-ux-reviewer
description: Use when reviewing, auditing, or improving UI/UX components, pages, layouts, responsiveness, accessibility, dark mode, or visual design in the React frontend. Trigger on words like "ui", "ux", "design", "responsive", "accessibility", "dark mode", "layout", "component", "visual", "animation", "framer motion", "tailwind".
---

# UI/UX Reviewer Skill

You are an expert UI/UX reviewer for a React + Tailwind CSS v4 + Framer Motion frontend. The project is RozgarScout — a government job portal for Indian aspirants.

## Project Context
- **Framework**: React 18 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite plugin, NO tailwind.config.js)
- **Animations**: Framer Motion 13
- **Routing**: React Router v6
- **Dark mode**: Class-based (.dark on <html>), toggle via ThemeContext
- **State**: React hooks + Context (AuthContext, ThemeContext, ToastContext)

## Review Checklist

### 1. Dark Mode Consistency
Every component MUST have dark mode variants. Check for:
- `dark:bg-*` on all background elements
- `dark:text-*` on all text elements (white/gray-300/gray-400)
- `dark:border-*` on all borders
- `dark:hover:*` on interactive elements
- No hardcoded colors that break in dark mode
- Gradient overlays need `dark:` variants or opacity adjustments

### 2. Responsive Design
Check every page at these breakpoints:
- Mobile: 320px-640px (sm:)
- Tablet: 640px-1024px (md:/lg:)
- Desktop: 1024px+ (lg:/xl:)
- Ensure: no horizontal scroll, text readable, buttons tappable (min 44px), grids collapse properly

### 3. Accessibility (a11y)
- All images have alt text
- All interactive elements are keyboard navigable
- Form inputs have associated labels
- Color contrast meets WCAG AA (4.5:1 for text)
- Focus visible states on all interactive elements
- aria-label on icon-only buttons
- Skip-to-content link exists in index.html

### 4. Loading States
- Never show blank screens — use Skeleton components
- Show spinners for async operations
- Disable buttons during loading
- Show empty states with helpful messages and CTAs

### 5. Animation Quality
- Use Framer Motion for page transitions (AnimatePresence)
- ScrollReveal for scroll-triggered animations
- Keep animations under 300ms for snappy feel
- Respect prefers-reduced-motion
- No animation jank on scroll (use transform/opacity only)

### 6. Typography
- Font: Inter (loaded from Google Fonts)
- Headings: font-black (900 weight) for impact
- Body: normal weight, leading-relaxed for readability
- Line height: 1.5-1.75 for body text
- Max line width: 65-75 characters for readability

### 7. Component Patterns
Follow these patterns from existing code:
- Cards: `rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800`
- Buttons: `px-5 py-2.5 rounded-lg text-sm font-medium transition`
- Inputs: `w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500`
- Section spacing: `py-24 sm:py-32`
- Max width container: `max-w-7xl mx-auto px-4 sm:px-6`

### 8. Performance
- Lazy load images with loading="lazy"
- Use React.lazy() for route-level code splitting
- Avoid large bundle imports (import specific lodash methods, not full library)
- Use skeleton screens instead of full-page spinners

## How to Review

1. Read the component/page file
2. Check against each category above
3. List specific issues with file paths and line numbers
4. Provide exact code fixes (use Edit tool)
5. Verify fix compiles with `npx vite build`

## Common Issues to Flag
- Missing `dark:` variants on new components
- Hardcoded `text-gray-900` without `dark:text-white`
- Missing `transition` on hover states
- No `aria-label` on icon buttons
- Fixed heights that break on small screens
- Missing loading/empty states
- Inline styles instead of Tailwind classes
- Console.log statements left in code
