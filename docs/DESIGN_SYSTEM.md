# Flowbites Design System

## Brand Identity

### Positioning
"The modern marketplace where designers sell premium templates and grow their creative business through services."

### Brand Personality
- **Professional but approachable** - Not corporate, not casual
- **Clean and trustworthy** - Quality-first marketplace
- **Creator-first mindset** - Empowering designers to build businesses
- **Quality over quantity** - Curated, not cluttered

### Tone of Voice
- **Clear, confident, helpful**
- **Avoid:** Corporate jargon, hype, pushy sales language
- **Use:** "your templates," "build your business," "quality work"

**Example Copy:**
- ❌ "Leverage our innovative marketplace ecosystem to monetize your creative assets"
- ✅ "Sell your templates and grow your design business"

---

## Typography System

### Font Stack (Google Fonts)

#### Primary Font: **Inter**
**Usage:** Navigation, body text, buttons, forms, UI elements

**Weights:**
- 400 (Regular) - Body text, paragraphs
- 500 (Medium) - Navigation links, subheadings
- 600 (Semibold) - Button labels, input labels
- 700 (Bold) - Important UI text

**Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

#### Display Font: **Manrope**
**Usage:** Page titles, hero headings, marketing copy, card titles

**Weights:**
- 600 (Semibold) - Section headings
- 700 (Bold) - Page titles
- 800 (Extrabold) - Hero headings, large display text

**Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&display=swap');
```

#### Monospace Font: **JetBrains Mono**
**Usage:** License keys, download tokens, code snippets

**Weight:** 400 (Regular)

**Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap');
```

### Typography Scale

| Name   | Size | Line Height | Usage                          |
|--------|------|-------------|--------------------------------|
| xs     | 12px | 16px        | Captions, metadata, timestamps |
| sm     | 14px | 20px        | Small body text, helper text   |
| base   | 16px | 24px        | Default body text              |
| lg     | 18px | 28px        | Large body text                |
| xl     | 20px | 28px        | Small headings                 |
| 2xl    | 24px | 32px        | Card titles, section headings  |
| 3xl    | 30px | 36px        | Page titles                    |
| 4xl    | 36px | 40px        | Large page titles              |
| 5xl    | 48px | 1 (tight)   | Hero headings                  |
| 6xl    | 60px | 1 (tight)   | Large hero headings            |

---

## Color Palette

### Primary: Sky Blue
**Usage:** CTAs, links, active states, brand moments

```css
--primary-50: #f0f9ff;
--primary-100: #e0f2fe;
--primary-200: #bae6fd;
--primary-300: #7dd3fc;
--primary-400: #38bdf8;
--primary-500: #0ea5e9;  /* Main brand color */
--primary-600: #0284c7;
--primary-700: #0369a1;
--primary-800: #075985;
--primary-900: #0c4a6e;
```

**Examples:**
- Primary buttons: `bg-primary-500 hover:bg-primary-600`
- Links: `text-primary-600 hover:text-primary-700`
- Active tabs: `border-b-2 border-primary-500`

### Secondary: Purple
**Usage:** Accents, creator profiles, premium badges, featured content

```css
--secondary-50: #faf5ff;
--secondary-100: #f3e8ff;
--secondary-200: #e9d5ff;
--secondary-300: #d8b4fe;
--secondary-400: #c084fc;
--secondary-500: #a855f7;  /* Main accent color */
--secondary-600: #9333ea;
--secondary-700: #7e22ce;
--secondary-800: #6b21a8;
--secondary-900: #581c87;
```

**Examples:**
- Creator badges: `bg-secondary-100 text-secondary-700`
- Premium features: `text-secondary-600`
- Accent icons: `text-secondary-500`

### Neutral: Grays
**Usage:** Backgrounds, text, borders, surfaces

```css
--neutral-50: #fafafa;   /* Lightest background */
--neutral-100: #f5f5f5;  /* Light background */
--neutral-200: #e5e5e5;  /* Borders */
--neutral-300: #d4d4d4;  /* Muted borders */
--neutral-400: #a3a3a3;  /* Disabled text */
--neutral-500: #737373;  /* Secondary text */
--neutral-600: #525252;  /* Primary text (light bg) */
--neutral-700: #404040;  /* Headings */
--neutral-800: #262626;  /* Dark background */
--neutral-900: #171717;  /* Darkest background */
--neutral-950: #0a0a0a;  /* True black */
```

**Text Hierarchy:**
- Headings: `text-neutral-900`
- Body text: `text-neutral-700`
- Secondary text: `text-neutral-500`
- Disabled: `text-neutral-400`

### Semantic Colors

**Success (Green):**
```css
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-500: #22c55e;  /* Main success color */
--success-600: #16a34a;
--success-700: #15803d;
```

**Warning (Amber):**
```css
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-500: #f59e0b;  /* Main warning color */
--warning-600: #d97706;
--warning-700: #b45309;
```

**Error (Red):**
```css
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-500: #ef4444;  /* Main error color */
--error-600: #dc2626;
--error-700: #b91c1c;
```

**Info (Blue):**
```css
--info-50: #eff6ff;
--info-100: #dbeafe;
--info-500: #3b82f6;  /* Main info color */
--info-600: #2563eb;
--info-700: #1d4ed8;
```

---

## Spacing System

### Base Scale (4px grid)

| Token    | Value | Pixels |
|----------|-------|--------|
| space-0  | 0     | 0px    |
| space-1  | 0.25  | 4px    |
| space-2  | 0.5   | 8px    |
| space-3  | 0.75  | 12px   |
| space-4  | 1     | 16px   |
| space-5  | 1.25  | 20px   |
| space-6  | 1.5   | 24px   |
| space-8  | 2     | 32px   |
| space-10 | 2.5   | 40px   |
| space-12 | 3     | 48px   |
| space-16 | 4     | 64px   |
| space-20 | 5     | 80px   |
| space-24 | 6     | 96px   |
| space-32 | 8     | 128px  |

**Common Patterns:**
- Section padding: `py-16` (64px)
- Card padding: `p-6` (24px)
- Button padding: `px-4 py-2` (16px x 8px)
- Form gap: `gap-4` (16px)

---

## Border Radius

| Token       | Value  | Usage                      |
|-------------|--------|----------------------------|
| rounded-sm  | 4px    | Tags, small chips          |
| rounded-md  | 6px    | Buttons, small cards       |
| rounded-lg  | 8px    | Cards, modals, inputs      |
| rounded-xl  | 12px   | Large cards, containers    |
| rounded-2xl | 16px   | Feature sections, panels   |
| rounded-3xl | 24px   | Hero cards, major CTAs     |
| rounded-full| 9999px | Pills, avatars, badges     |

---

## Shadows

| Token     | Value                                                                 | Usage              |
|-----------|-----------------------------------------------------------------------|--------------------|
| shadow-sm | `0 1px 2px 0 rgba(0, 0, 0, 0.05)`                                    | Subtle depth       |
| shadow-md | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)` | Cards, dropdowns   |
| shadow-lg | `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)` | Modals, popovers   |
| shadow-xl | `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)` | Overlays, drawers  |

---

## Layout

### Container Widths

| Size | Max Width | Usage              |
|------|-----------|--------------------|
| sm   | 640px     | Mobile content     |
| md   | 768px     | Tablet content     |
| lg   | 1024px    | Small desktop      |
| xl   | 1280px    | Standard desktop   |
| 2xl  | 1536px    | Large desktop      |

**Standard container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

### Grid System

**12-column grid** with responsive breakpoints:
- Mobile: 1 column default
- Tablet (md): 2 columns
- Desktop (lg): 3-4 columns
- Wide (xl): 4-6 columns

**Common layouts:**
- Template cards: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
- Feature grid: `grid grid-cols-1 md:grid-cols-3 gap-8`
- Sidebar: `grid grid-cols-1 lg:grid-cols-4 gap-8` (content spans 3 cols)

---

## Components

### Buttons

**Primary Button:**
- Background: `bg-primary-500 hover:bg-primary-600`
- Text: `text-white font-semibold`
- Padding: `px-6 py-3`
- Border radius: `rounded-lg`
- Shadow: `shadow-sm hover:shadow-md`

**Secondary Button:**
- Background: `bg-white hover:bg-neutral-50`
- Border: `border border-neutral-200`
- Text: `text-neutral-700 font-medium`
- Padding: `px-6 py-3`

**Ghost Button:**
- Background: `bg-transparent hover:bg-neutral-100`
- Text: `text-neutral-600 hover:text-neutral-900`

### Cards

**Template Card:**
- Background: `bg-white`
- Border radius: `rounded-xl`
- Shadow: `shadow-sm hover:shadow-md`
- Border: `border border-neutral-200`
- Padding: `p-0` (image bleeds), content `p-5`

**Feature Card:**
- Background: `bg-white` or `bg-primary-50`
- Border radius: `rounded-2xl`
- Padding: `p-8`
- Shadow: `shadow-sm`

### Forms

**Input:**
- Background: `bg-white`
- Border: `border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200`
- Border radius: `rounded-lg`
- Padding: `px-4 py-3`
- Text: `text-neutral-900 placeholder:text-neutral-400`

**Label:**
- Text: `text-sm font-medium text-neutral-700`
- Margin: `mb-1.5`

**Error Message:**
- Text: `text-sm text-error-600`
- Icon: Error icon prefix

### Badges

**Status Badge:**
- Success: `bg-success-100 text-success-700`
- Warning: `bg-warning-100 text-warning-700`
- Error: `bg-error-100 text-error-700`
- Info: `bg-info-100 text-info-700`

**Category Badge:**
- Background: `bg-primary-100`
- Text: `text-primary-700 text-xs font-medium`
- Padding: `px-2.5 py-0.5`
- Border radius: `rounded-full`

---

## Responsive Breakpoints

| Breakpoint | Width   | Tailwind Prefix |
|------------|---------|-----------------|
| Mobile     | < 640px | (default)       |
| sm         | ≥ 640px | `sm:`           |
| md         | ≥ 768px | `md:`           |
| lg         | ≥ 1024px| `lg:`           |
| xl         | ≥ 1280px| `xl:`           |
| 2xl        | ≥ 1536px| `2xl:`          |

---

## Animation & Transitions

### Standard Transitions

| Element | Duration | Easing                    |
|---------|----------|---------------------------|
| Buttons | 150ms    | `ease-in-out`             |
| Cards   | 200ms    | `ease-out`                |
| Modals  | 300ms    | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Toasts  | 300ms    | `ease-out`                |

### Hover Effects

- **Cards:** `hover:shadow-md hover:-translate-y-0.5`
- **Buttons:** `hover:shadow-md`
- **Links:** `hover:text-primary-600`

### Loading States

- Skeleton: `bg-neutral-200 animate-pulse`
- Spinner: `animate-spin`
- Pulse: `animate-pulse` (subtle opacity)
