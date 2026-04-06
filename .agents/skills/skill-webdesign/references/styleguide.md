# Fund Investigator Design System

Reference: https://fund-investigator.pages.dev/styleguide/

## Typography - Fonts

### Font Families
| Token | Stack | Usage |
|-------|-------|-------|
| `font-sans` | Inter, system-ui, sans-serif | Primary - all UI and body text |
| `font-mono` | JetBrains Mono, Fira Code, monospace | Tabular data, code snippets |

### Font Loading
Ensure Inter is loaded in your HTML head:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Numeric Display
- Always use `tabular-nums` class for aligned numbers in tables
- Use `font-mono` for large data displays

## Color Palette

### Brand Colors (Tailwind classes)
| Token | Hex | Usage |
|-------|-----|-------|
| `navy-dark` | #152a45 | Deep backgrounds, emphasis |
| `navy` | #1E3A5F | Primary brand, headers, main CTAs |
| `navy-light` | #2d5278 | Hover states on navy |
| `gold-dark` | #b8962e | Pressed/active gold |
| `gold` | #D4AF37 | Accent, hover states, highlights |
| `gold-light` | #e0c160 | Subtle gold accents |
| `cream` | #fefce8 | Subtle backgrounds, badges |
| `cream-dark` | #fef9c3 | Cream hover states |
| `white` | #FFFFFF | Backgrounds, text on dark |
| `light-gray` | #94A3B8 | Tertiary text |
| `secondary-gray` | #64748B | Secondary text |

### Semantic Colors (with variants)
| Token | Default | Light | Dark |
|-------|---------|-------|------|
| `success` | #10b981 | #34d399 | #059669 |
| `warning` | #f59e0b | #fbbf24 | #d97706 |
| `error` | #ef4444 | #f87171 | #dc2626 |
| `info` | #3b82f6 | #60a5fa | #2563eb |

## Typography Classes

| Class | Usage |
|-------|-------|
| `text-display-xl` | Hero headlines |
| `text-display-lg` | Section headlines |
| `text-display-md` | Card titles, feature headers |
| `text-heading-xl` | Page titles |
| `text-heading-lg` | Section titles |
| `text-heading-md` | Subsection titles |
| `text-heading-sm` | Card headers |
| `text-body-lg` | Intro paragraphs, emphasis |
| `text-body-md` | Standard paragraphs |
| `text-body-sm` | Secondary content, captions, metadata |
| `text-caption` | Labels, uppercase small text |

## Components

### Buttons
Import: `import Button from '../components/ui/Button.astro';`

**Variants:** `primary` | `secondary` | `tertiary` | `outline`
**Sizes:** `sm` | `md` | `lg`
**Props:** `href`, `icon`, `iconPosition`, `fullWidth`, `disabled`

```astro
<Button variant="primary" size="lg" href="https://deepdive.fundinvestigator.com" icon="rocket">
  Launch Tool
</Button>
```

**Hierarchy:**
- Primary: Main page action (e.g., "Launch Tool")
- Secondary: Important but not primary (e.g., "Learn More")
- Tertiary: Low emphasis links (e.g., "View All")
- Outline: Special emphasis with gold accent

### Cards
Import: `import Card from '../components/ui/Card.astro';`

**Variants:** `default` | `elevated` | `bordered` | `glass`
**Padding:** `sm` | `md` | `lg`
**Props:** `hover` (boolean, default true)

### Badges
Import: `import Badge from '../components/ui/Badge.astro';`

**Variants:** `default` | `primary` | `secondary` | `success` | `warning` | `error` | `info`
**Sizes:** `sm` | `md` | `lg`
**Corner:** `pill` | `rounded`

### Section
Import: `import Section from '../components/ui/Section.astro';`

Wrapper for page sections with consistent vertical spacing.

### Hero
Import: `import Hero from '../components/ui/Hero.astro';`

Landing page hero component.

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `tight-gap` | 0.5rem / 8px | Inline elements |
| `element-gap` | 1rem / 16px | Between related items |
| `card-padding` | 1.5rem / 24px | Card internal padding |
| `card-gap` | 2rem / 32px | Between cards |
| `section-gap` | 4rem / 64px | Between sections |
| `section-y-sm` | 5rem / 80px | Small section padding |
| `section-y` | 8rem / 128px | Standard section padding |

## Shadow System

| Class | Usage |
|-------|-------|
| `shadow-xs` | Minimal, subtle elevation |
| `shadow-sm` | Cards at rest |
| `shadow` | Default interactive elements |
| `shadow-md` | Hover states |
| `shadow-lg` | Modals, dropdowns |
| `shadow-xl` | Popovers |
| `shadow-2xl` | Maximum elevation |
| `shadow-gold` | Brand accent shadow |
| `shadow-navy` | Dark accent shadow |

## Design Gaps (TODO)

Components that should be added to the styleguide page:

**Now Available (see components/):**
- ✅ Forms: Input, SearchInput, SubscribeForm, LoginForm
- ✅ Tables: Table (static), SortableTable (interactive)
- ✅ Alerts: Alert component with info/success/warning/error variants
- ✅ Loading: Spinner, Skeleton
- ✅ Empty State: EmptyState component
- ✅ Tooltip: Tooltip component
- ✅ Focus States: Global CSS for focus-visible

**Still Missing:**
- Navigation: Mobile menu states, breadcrumbs, active link styles
- Modal/Dialog: Overlay modal component
- Pagination: Page navigation for tables
- Tabs: Tab navigation component
- Accordion: Expandable sections