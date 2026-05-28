# Design Reference:

## Overview
Design preference for the application: focus on **fast and delightful user experience**. Design philosophy centers on **humaneness, simplicity, and satisfaction in every interaction**. The application must offers a clean, minimal aesthetic that feels approachable and premium at the same time.

---

## Design Approach

### Core Philosophy
- **Human-first design**: The interface should feel personal, warm, and non-intimidating
- **Back to basics**: Strip away unnecessary complexity. Every element must earn its place
- **Delight in details**: Micro-interactions and subtle animations should bring satisfaction to every user action
- **Fast & intuitive**: The UI should never get in the way of the user’s primary goal (becoming fluent in Chinese)

### Visual Hierarchy
- Content-first layout with generous whitespace
- Clear typographic hierarchy using size, weight, and color contrast
- Minimal chrome — UI elements recede so content stands forward
- Rounded, friendly shapes throughout (no sharp corners)

### Interaction Design
- Smooth, purposeful micro-interactions (e.g., task completion animations, learning material transitions)
- Immediate visual feedback on every action
- No jarring state changes — everything flows naturally
- Hover and focus states that feel tactile and responsive

---

## Color Palette

### Light Theme
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#FFFFFF` | Primary page background |
| Surface | `#F5F5F7` | Cards, input fields, secondary containers |
| Primary Text | `#1D1D1F` | Headlines, primary content |
| Secondary Text | `#6E6E73` | Descriptions, metadata, placeholders |
| Accent | `#FF6B6B` or warm coral | Primary actions, CTAs, active states |
| Border | `#E5E5EA` | Subtle dividers, input borders |
| Success | `#34C759` | Completed tasks, positive states |
| Hover Surface | `#EBEBF0` | Subtle hover backgrounds |

### Dark Theme
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#1C1C1E` | Primary page background |
| Surface | `#2C2C2E` | Cards, input fields |
| Primary Text | `#FFFFFF` | Headlines, primary content |
| Secondary Text | `#8E8E93` | Descriptions, metadata |
| Accent | `#FF6B6B` or warm coral | Primary actions, CTAs |
| Border | `#38383A` | Subtle dividers |
| Success | `#30D158` | Completed tasks |
| Hover Surface | `#3A3A3C` | Hover backgrounds |

### Black Theme (OLED)
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#000000` | True black for OLED screens |
| Surface | `#1C1C1E` | Elevated surfaces |
| Primary Text | `#FFFFFF` | Content |
| Secondary Text | `#8E8E93` | Metadata |
| Accent | `#FF6B6B` | Actions |

### Color Usage Rules
- **Accent color is used sparingly** — only for primary actions, active navigation, and key highlights
- **Success green** for completed/positive states to create satisfying visual feedback
- **High contrast** between text and background for readability
- **Subtle borders** — almost invisible but enough to define structure

---

## Typography

### Font Family
- **Primary**: `Inter` or `SF Pro Display` (system-like, highly legible sans-serif)
- **Fallback stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Monospace** (for tags/codes if needed): `SF Mono`, `Menlo`, `monospace`

### Type Scale
| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| Display | `48px` | 700 (Bold) | 1.1 | `-0.02em` | Hero headlines |
| H1 | `32px` | 700 | 1.2 | `-0.01em` | Page titles |
| H2 | `24px` | 600 (Semibold) | 1.3 | `-0.01em` | Section headings |
| H3 | `20px` | 600 | 1.4 | `0` | Card titles, list headers |
| Body | `16px` | 400 (Regular) | 1.5 | `0` | Primary body text |
| Body Small | `14px` | 400 | 1.5 | `0` | Secondary descriptions |
| Caption | `12px` | 500 (Medium) | 1.4 | `0.01em` | Metadata, timestamps, labels |
| Button | `14px` | 600 | 1 | `0` | Button labels |
| Nav | `14px` | 500 | 1 | `0` | Navigation items |

### Typography Rules
- **Tight letter-spacing** on large headings for a modern, refined look
- **Slightly positive tracking** on small captions for readability
- **Semibold (600)** is the maximum weight for body text — avoid heavy/bulky text
- **Line height is generous** (1.5x) for body text to ensure comfortable reading
- **Color hierarchy**: Primary text `#1D1D1F` / `#FFFFFF`, secondary `#6E6E73` / `#8E8E93`

---

## Spacing & Layout

### Spacing Scale (8px Base)
| Token | Value |
|-------|-------|
| xs | `4px` |
| sm | `8px` |
| md | `16px` |
| lg | `24px` |
| xl | `32px` |
| 2xl | `48px` |
| 3xl | `64px` |
| 4xl | `96px` |

### Layout Principles
- **Max container width**: `1200px` centered with auto margins
- **Page padding**: `24px` on mobile, `48px` on tablet, `64px` on desktop
- **Card padding**: `16px` to `24px`
- **Section spacing**: `64px` to `96px` between major sections
- **Grid**: 12-column with `24px` gutter

### Component Spacing
- Buttons: `12px 24px` padding (generous, easy to tap)
- Inputs: `16px` height, `12px 16px` padding
- Cards: `16px` to `24px` padding, `12px` to `16px` border-radius
- Lists: `12px` gap between items

---

## Component Design

### Buttons
- **Primary**: Accent color background (`#FF6B6B`), white text, fully rounded (`border-radius: 9999px` or `24px`)
- **Secondary**: Transparent background, `1px` border in secondary text color, rounded
- **Ghost**: No border, text only with hover background
- **Padding**: `12px 24px`
- **Font**: `14px`, weight `600`
- **Shadow**: Very subtle on primary buttons (`0 1px 2px rgba(0,0,0,0.05)`)
- **Hover**: Slight scale (`1.02`) or brightness increase, smooth `200ms` transition

### Inputs / Text Fields
- **Background**: Surface color (`#F5F5F7` light, `#2C2C2E` dark)
- **Border**: `1px solid` border color, or borderless with only bottom border
- **Border-radius**: `12px` (rounded but not pill-shaped)
- **Padding**: `12px 16px`
- **Focus state**: Accent color border glow or bottom border highlight
- **Placeholder**: Secondary text color, italic optional
- **Font**: `16px` body size for comfortable typing

### Cards / Containers
- **Background**: Surface color
- **Border-radius**: `16px` to `24px`
- **Shadow**: Very subtle (`0 2px 8px rgba(0,0,0,0.04)`) or no shadow in light mode
- **Border**: Optional `1px` border in dark mode instead of shadow
- **Padding**: `24px`

### Lists (Task Items)
- **Item height**: `56px` minimum (generous tap target)
- **Gap between items**: `8px` to `12px`
- **Background**: Transparent or subtle surface on hover
- **Border-radius per item**: `12px`
- **Checkbox**: Custom styled, rounded square or circle, accent color when checked
- **Completed state**: Strikethrough text + secondary text color + success-colored checkmark
- **Swipe/Drag**: Smooth physics-based animation, subtle shadow during drag

### Navigation
- **Style**: Minimal top bar or sidebar
- **Height**: `64px` top bar
- **Links**: `14px`, weight `500`, secondary text color, accent on active
- **Background**: Transparent or blur backdrop (`backdrop-filter: blur(12px)`) with slight opacity

---

## Effects & Animations

### Shadows
- **Card shadow**: `0 2px 12px rgba(0, 0, 0, 0.06)`
- **Elevated shadow**: `0 8px 24px rgba(0, 0, 0, 0.08)`
- **Button shadow**: `0 1px 3px rgba(0, 0, 0, 0.1)`
- In dark mode, prefer borders over shadows

### Transitions
- **Default duration**: `200ms`
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out style)
- **Bouncy interactions**: `cubic-bezier(0.34, 1.56, 0.64, 1)` for satisfying micro-interactions

### Micro-interactions
- **Task completion**: Checkbox fills with accent color + subtle scale bounce + strikethrough animation
- **Add task**: Input field expands smoothly, new item slides in from top with fade
- **Delete**: Item slides out horizontally with opacity fade
- **Reorder**: Smooth lift shadow + scale during drag
- **Button press**: Scale to `0.97` on active, back to `1` on release
- **Page transitions**: Fade + slight upward slide (`20px`)

### Scroll Behavior
- **Smooth scrolling**: `scroll-behavior: smooth` globally
- **Scrollbars**: Hidden or minimal custom styled (thin, rounded track)

---

## Responsive Breakpoints

| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| Mobile | `< 640px` | Single column, full-width cards, bottom nav, larger touch targets |
| Tablet | `640px - 1024px` | 2 columns possible, adjusted padding |
| Desktop | `> 1024px` | Full layout, sidebar nav, max-width container |

---

## Assets & Icons

### Icon Style
- **Style**: Rounded, soft, minimal line icons (2px stroke)
- **Library**: `Phosphor Icons`, `Feather Icons`, or `Heroicons` (outline/rounded variants)
- **Size**: `20px` to `24px` standard, `16px` for inline
- **Color**: Inherit from text color or accent for active states

### Imagery
- **Illustrations**: Soft, rounded, friendly vector illustrations with pastel/warm tones
- **No harsh photography**: If photos used, apply soft blur or rounded corners (`16px`+)
- **Empty states**: Friendly illustrations with encouraging copy

---

## Accessibility

- **Minimum contrast ratio**: 4.5:1 for body text, 3:1 for large text
- **Focus indicators**: Visible focus rings (2px accent color outline, offset 2px)
- **Touch targets**: Minimum `44px` x `44px`
- **Reduced motion**: Respect `prefers-reduced-motion` — disable bouncy animations, keep simple fades
- **Screen reader friendly**: Proper heading hierarchy, ARIA labels on interactive elements

---

## Implementation Notes for Kimi Agent

When building a website with this design reference:

1. **Start with the color system** — define CSS custom properties for all tokens in both light and dark modes
2. **Use the spacing scale consistently** — every margin, padding, and gap should use the 8px-based scale
3. **Typography is critical** — use Inter or system fonts, respect the type scale, keep line heights generous
4. **Prioritize whitespace** — don’t crowd elements; let the design breathe
5. **Animate with purpose** — every animation should enhance understanding or provide satisfaction
6. **Test all three themes** — light, dark, and OLED black if applicable
7. **Keep it humane** — the interface should feel like a helpful companion, not a machine

---

*Reference extracted from dona.ai — "A more humane to-do list"*
*Last updated: 15 May 2026*
