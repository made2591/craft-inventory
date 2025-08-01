# Color Palette Mapping

## New Color Palette
- **FBF5F3 (Snow)** - Light neutral for backgrounds, cards
- **E28413 (Fulvous)** - Warm orange for primary actions, highlights
- **000022 (Oxford Blue)** - Dark blue for text, headers, sidebar
- **DE3C4B (Rusty red)** - Red for errors, danger actions
- **C42847 (Cardinal)** - Deep red for accent elements

## CSS Variables Mapping

### Primary Colors
- `--snow: #FBF5F3` - Main light background
- `--fulvous: #E28413` - Primary action color (buttons, links)
- `--oxford-blue: #000022` - Primary text and sidebar
- `--rusty-red: #DE3C4B` - Error/danger states
- `--cardinal: #C42847` - Accent elements

### Derived Colors
- `--snow-dark: #F0E8E5` - Card backgrounds, table headers
- `--fulvous-light: #F5C670` - Light accent backgrounds
- `--fulvous-dark: #B8690F` - Hover states for orange buttons
- `--oxford-blue-light: #1A1A3E` - Secondary text, hover states
- `--oxford-blue-muted: #4A4A6A` - Muted text
- `--rusty-red-light: #F7A8B0` - Light error backgrounds
- `--cardinal-light: #E8677A` - Light accent backgrounds

### Semantic Colors
- `--primary: var(--oxford-blue)` - Primary brand color
- `--secondary: var(--fulvous)` - Secondary brand color
- `--accent: var(--cardinal)` - Accent color
- `--danger: var(--rusty-red)` - Error states
- `--warning: var(--fulvous)` - Warning states
- `--success: var(--fulvous-dark)` - Success states
- `--info: var(--oxford-blue-light)` - Info states

### Usage Guidelines

#### Buttons
- Primary actions: `--secondary` (Fulvous orange)
- Secondary actions: `--oxford-blue-muted` 
- Danger actions: `--danger` (Rusty red)

#### Backgrounds
- Main background: `--background` (Snow)
- Card/surface backgrounds: `--surface` (White)
- Table headers: `--snow-dark`
- Sidebar: `--oxford-blue`

#### Text
- Primary text: `--text-primary` (Oxford blue)
- Secondary text: `--text-secondary` (Oxford blue muted)
- Muted text: `--text-muted`

#### States
- Hover: Use darker variants of colors
- Active: Use accent colors (Cardinal)
- Focus: Use secondary color with transparency
- Error: Use danger color system
