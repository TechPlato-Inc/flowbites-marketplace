# Flowbites Marketplace - Design System

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

#### Success (Green)
```css
--success-light: #d1fae5;
--success: #10b981;
--success-dark: #065f46;
```
**Usage:** Success messages, completed states, approved badges

#### Warning (Amber)
```css
--warning-light: #fef3c7;
--warning: #f59e0b;
--warning-dark: #92400e;
```
**Usage:** Warning messages, pending states, review needed

#### Error (Red)
```css
--error-light: #fee2e2;
--error: #ef4444;
--error-dark: #991b1b;
```
**Usage:** Error messages, rejected states, destructive actions

#### Info (Blue)
```css
--info-light: #dbeafe;
--info: #3b82f6;
--info-dark: #1e3a8a;
```
**Usage:** Info messages, new badges, tips

---

## Spacing Scale

Based on 4px grid system:

```css
--spacing-0: 0px;
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
--spacing-20: 80px;
--spacing-24: 96px;
```

**Usage:**
- Small gaps: `gap-2` (8px)
- Card padding: `p-6` (24px)
- Section spacing: `mb-12` (48px)
- Large spacing: `mt-16` (64px)

---

## Border Radius

```css
--radius-none: 0px;
--radius-sm: 4px;      /* Badges, small elements */
--radius-DEFAULT: 8px; /* Buttons, inputs */
--radius-md: 12px;     /* Cards */
--radius-lg: 16px;     /* Modals, large cards */
--radius-xl: 24px;     /* Hero sections */
--radius-full: 9999px; /* Circular elements, pills */
```

---

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
```

**Usage:**
- Cards (default): `shadow-md`
- Cards (hover): `shadow-lg`
- Modals: `shadow-2xl`
- Dropdowns: `shadow-xl`

---

## Component Specifications

### 1. Button

#### Variants

**Primary (Main CTA):**
```css
bg-primary-500 hover:bg-primary-600 active:bg-primary-700
text-white font-semibold
rounded-lg shadow-sm hover:shadow-md
transition-all duration-200
```

**Secondary (Accents):**
```css
bg-secondary-500 hover:bg-secondary-600
text-white font-semibold
rounded-lg shadow-sm hover:shadow-md
```

**Outline (Secondary actions):**
```css
border-2 border-primary-500 hover:bg-primary-50
text-primary-600 hover:text-primary-700 font-semibold
rounded-lg bg-transparent
```

**Ghost (Tertiary actions):**
```css
text-primary-600 hover:bg-primary-50
font-semibold rounded-lg
```

**Danger (Destructive actions):**
```css
bg-error hover:bg-error-dark
text-white font-semibold
rounded-lg shadow-sm
```

#### Sizes

| Size | Height | Padding | Font Size | Class Example                    |
|------|--------|---------|-----------|----------------------------------|
| sm   | 32px   | 12px    | 14px      | `h-8 px-3 text-sm`              |
| md   | 40px   | 16px    | 16px      | `h-10 px-4 text-base` (default) |
| lg   | 48px   | 24px    | 18px      | `h-12 px-6 text-lg`             |

#### States

- **Default:** Base styling
- **Hover:** Darker background, larger shadow
- **Active:** Scale down (`scale-95`), darkest background
- **Disabled:** `opacity-50 cursor-not-allowed pointer-events-none`
- **Loading:** Spinner icon, disabled state

#### Icon Support

```jsx
// Left icon
<Button leftIcon={<FilterIcon />}>Filter</Button>

// Right icon
<Button rightIcon={<ArrowRightIcon />}>Continue</Button>

// Icon only
<Button iconOnly><CloseIcon /></Button>
```

---

### 2. Card (Template/Service/Shot)

#### Base Structure

```jsx
<div className="border border-neutral-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-all duration-200 hover:scale-102">
  {/* Image container */}
  <div className="aspect-[16/10] relative overflow-hidden bg-neutral-100">
    <img src="..." className="w-full h-full object-cover" />
    {/* Optional badge overlay */}
    <Badge className="absolute top-3 right-3">Featured</Badge>
  </div>

  {/* Content area */}
  <div className="p-4">
    <h3 className="font-semibold text-lg text-neutral-900 mb-2">
      Template Title
    </h3>
    <p className="text-sm text-neutral-500 mb-3">
      By Creator Name
    </p>
    <div className="flex items-center justify-between">
      <span className="text-xl font-bold text-neutral-900">$49</span>
      <Button size="sm">View Details</Button>
    </div>
  </div>
</div>
```

#### Variants

**Template Card:**
- Aspect ratio: 16:10
- Includes price badge
- Category pills at bottom
- Hover: Lift effect + shadow

**Service Card:**
- Aspect ratio: 4:3
- "From $X" pricing display
- Delivery time badge
- Features list preview

**UI Shot Card:**
- Aspect ratio: 4:3
- Like/save icons overlay (top right)
- Creator avatar (bottom left overlay)
- No border, shadow only

#### Skeleton Loading State

```jsx
<div className="border border-neutral-200 rounded-lg overflow-hidden">
  <div className="aspect-[16/10] bg-neutral-200 animate-pulse"></div>
  <div className="p-4 space-y-3">
    <div className="h-4 bg-neutral-200 rounded animate-pulse"></div>
    <div className="h-3 bg-neutral-200 rounded w-2/3 animate-pulse"></div>
    <div className="h-6 bg-neutral-200 rounded w-1/3 animate-pulse"></div>
  </div>
</div>
```

---

### 3. Badge

#### Variants

```css
/* Success */
bg-success-light text-success-dark
px-2.5 py-1 text-sm font-medium rounded-full

/* Warning */
bg-warning-light text-warning-dark
px-2.5 py-1 text-sm font-medium rounded-full

/* Error */
bg-error-light text-error-dark
px-2.5 py-1 text-sm font-medium rounded-full

/* Info */
bg-info-light text-info-dark
px-2.5 py-1 text-sm font-medium rounded-full

/* Neutral */
bg-neutral-100 text-neutral-700
px-2.5 py-1 text-sm font-medium rounded-full
```

#### Sizes

- **sm:** `px-2 py-0.5 text-xs`
- **md:** `px-2.5 py-1 text-sm` (default)

#### Usage Examples

- Approved: `<Badge variant="success">Approved</Badge>`
- Pending: `<Badge variant="warning">Pending Review</Badge>`
- Featured: `<Badge variant="info">Featured</Badge>`
- Rejected: `<Badge variant="error">Rejected</Badge>`

---

### 4. PillFilter (Horizontal Filter Pills)

#### Structure

```jsx
<div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
  <button className="px-4 h-9 rounded-full bg-primary-500 text-white font-medium whitespace-nowrap">
    All Templates
  </button>
  <button className="px-4 h-9 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 font-medium whitespace-nowrap">
    React
  </button>
  <button className="px-4 h-9 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 font-medium whitespace-nowrap">
    Next.js
  </button>
  {/* ... */}
</div>
```

#### States

- **Active:** `bg-primary-500 text-white ring-2 ring-primary-500`
- **Inactive:** `bg-neutral-100 text-neutral-700 hover:bg-neutral-200`

#### Responsive

- Mobile: Horizontal scroll (hide scrollbar)
- Tablet+: Wrap if needed

---

### 5. Input

#### Base Styling

```css
h-11 px-4 rounded-lg
border border-neutral-300
bg-white text-neutral-900
placeholder:text-neutral-400
focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none
transition-colors duration-200
```

#### Variants

**Default:**
```jsx
<input
  type="text"
  className="h-11 px-4 rounded-lg border border-neutral-300..."
  placeholder="Enter text"
/>
```

**With Error:**
```jsx
<input
  className="h-11 px-4 rounded-lg border-2 border-error..."
/>
<p className="text-sm text-error mt-1">This field is required</p>
```

**Disabled:**
```jsx
<input
  disabled
  className="h-11 px-4 rounded-lg bg-neutral-100 cursor-not-allowed..."
/>
```

#### With Icons

```jsx
{/* Left icon */}
<div className="relative">
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
  <input className="pl-10..." />
</div>

{/* Right icon */}
<div className="relative">
  <input className="pr-10..." />
  <CloseIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
</div>
```

#### Sizes

- **sm:** `h-9 px-3 text-sm`
- **md:** `h-11 px-4 text-base` (default)
- **lg:** `h-13 px-5 text-lg`

---

### 6. Modal

#### Structure

```jsx
{/* Overlay */}
<div className="fixed inset-0 bg-black/50 z-40 animate-fade-in"></div>

{/* Modal container */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-scale-in">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-neutral-200">
      <h2 className="text-2xl font-bold text-neutral-900">Modal Title</h2>
      <button className="text-neutral-400 hover:text-neutral-600">
        <CloseIcon />
      </button>
    </div>

    {/* Body (scrollable) */}
    <div className="p-6 max-h-[60vh] overflow-y-auto">
      Content goes here
    </div>

    {/* Footer */}
    <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </div>
  </div>
</div>
```

#### Sizes

- **sm:** `max-w-md`
- **md:** `max-w-lg` (default)
- **lg:** `max-w-2xl`
- **xl:** `max-w-4xl`
- **full:** `max-w-7xl`

#### Animations

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

---

### 7. Toast Notification

#### Structure

```jsx
<div className="fixed top-4 right-4 z-50 flex flex-col gap-2 animate-slide-in-right">
  <div className="bg-white rounded-lg shadow-xl border-l-4 border-success p-4 flex items-start gap-3 max-w-md">
    <CheckCircleIcon className="text-success flex-shrink-0" />
    <div className="flex-1">
      <h4 className="font-semibold text-neutral-900">Success!</h4>
      <p className="text-sm text-neutral-600">Your template has been published.</p>
    </div>
    <button className="text-neutral-400 hover:text-neutral-600">
      <CloseIcon size={16} />
    </button>
  </div>
</div>
```

#### Variants

- **Success:** `border-l-4 border-success` + green icon
- **Error:** `border-l-4 border-error` + red icon
- **Warning:** `border-l-4 border-warning` + amber icon
- **Info:** `border-l-4 border-info` + blue icon

#### Auto-dismiss Timing

- Success: 5 seconds
- Error: 7 seconds
- Warning: 6 seconds
- Info: 5 seconds

---

### 8. Pagination

#### Structure

```jsx
<div className="flex items-center justify-center gap-1">
  <button className="h-10 px-3 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-50">
    Previous
  </button>

  <button className="h-10 w-10 rounded-lg text-neutral-600 hover:bg-neutral-100">
    1
  </button>
  <span className="px-2 text-neutral-400">...</span>
  <button className="h-10 w-10 rounded-lg text-neutral-600 hover:bg-neutral-100">
    4
  </button>
  <button className="h-10 w-10 rounded-lg bg-primary-500 text-white">
    5
  </button>
  <button className="h-10 w-10 rounded-lg text-neutral-600 hover:bg-neutral-100">
    6
  </button>
  <span className="px-2 text-neutral-400">...</span>
  <button className="h-10 w-10 rounded-lg text-neutral-600 hover:bg-neutral-100">
    20
  </button>

  <button className="h-10 px-3 rounded-lg text-neutral-600 hover:bg-neutral-100">
    Next
  </button>
</div>
```

#### Pattern

Show: `1 ... 4 5 6 ... 20`
- Always show first page
- Always show last page
- Show current page + 1 before + 1 after
- Use `...` for gaps

---

### 9. Skeleton Loading

#### Variants

```jsx
{/* Text line */}
<div className="h-4 bg-neutral-200 rounded animate-pulse"></div>

{/* Heading */}
<div className="h-6 bg-neutral-200 rounded w-1/2 animate-pulse"></div>

{/* Circle (avatar) */}
<div className="w-12 h-12 bg-neutral-200 rounded-full animate-pulse"></div>

{/* Card */}
<div className="border border-neutral-200 rounded-lg p-4 space-y-3">
  <div className="h-32 bg-neutral-200 rounded animate-pulse"></div>
  <div className="h-4 bg-neutral-200 rounded animate-pulse"></div>
  <div className="h-3 bg-neutral-200 rounded w-2/3 animate-pulse"></div>
</div>
```

#### Animation

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

### 10. Tabs

#### Variants

**Underline Style (Default):**
```jsx
<div className="border-b border-neutral-200">
  <div className="flex gap-6">
    <button className="pb-3 border-b-2 border-primary-500 text-primary-600 font-semibold">
      Made by Flowbites
    </button>
    <button className="pb-3 border-b-2 border-transparent text-neutral-500 hover:text-neutral-700 font-medium">
      Community
    </button>
  </div>
</div>
```

**Pill Style:**
```jsx
<div className="flex gap-2 bg-neutral-100 p-1 rounded-lg">
  <button className="px-4 py-2 rounded-md bg-white shadow-sm text-neutral-900 font-medium">
    Templates
  </button>
  <button className="px-4 py-2 rounded-md text-neutral-600 hover:text-neutral-900 font-medium">
    UI Shorts
  </button>
</div>
```

---

## Layout System

### Container

```css
max-w-7xl mx-auto px-4 md:px-6 lg:px-8
```

**Max-widths:**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1400px (default)

### Grid for Listings

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Cards */}
</div>
```

**Responsive Columns:**
- Mobile (< 768px): 1 column
- Tablet (768px - 1023px): 2 columns
- Desktop (1024px - 1279px): 3 columns
- Wide (1280px+): 4 columns

### Breakpoints

```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

## Design Principles

### 1. Familiarity vs. Uniqueness

✅ **DO:**
- Use familiar e-commerce patterns (cards, filters, search)
- Follow marketplace conventions (pricing, badges, CTAs)
- Create a unique Flowbites visual identity

❌ **DON'T:**
- Copy Envato layout 1:1
- Clone UI components pixel-by-pixel
- Use Envato's colors or branding

### 2. Clean & Minimal

✅ **DO:**
- Use plenty of whitespace
- Clear typography hierarchy
- Focused attention on templates

❌ **DON'T:**
- Cluttered interfaces
- Too many competing CTAs
- Overwhelming information

### 3. Creator-First

✅ **DO:**
- Highlight creator names prominently
- Show creator avatars
- Link to creator profiles everywhere

❌ **DON'T:**
- Hide creator attribution
- Make creators feel like vendors
- Prioritize platform over creators

### 4. Quality Signals

✅ **DO:**
- Show preview images prominently
- Display ratings/reviews
- Highlight "verified" or "featured" badges

❌ **DON'T:**
- Bury quality indicators
- Show unvetted/low-quality content
- Mix approved with pending templates

---

## Implementation Notes

### Tailwind CSS Configuration

All design tokens should be added to `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* Sky blue shades */ },
        secondary: { /* Purple shades */ },
        // ... etc
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // ... spacing, shadows, etc.
    }
  }
}
```

### Component Library Structure

```
src/design-system/
├── tokens/
│   └── tokens.json
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.stories.tsx
│   ├── Card/
│   ├── Badge/
│   └── ... (all 10 components)
└── index.ts
```

---

**Document Version:** 1.0
**Last Updated:** February 13, 2026
**Owner:** Design Team / Frontend Lead
