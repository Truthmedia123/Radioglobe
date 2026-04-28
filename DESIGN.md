---
colors:
  primary:
    value: "#F5A623"
    description: "Warm Signal Amber - The main brand color used for primary actions, indicators, and highlights"
  background:
    value: "#0B0E14"
    description: "Deep Receiving Black - The deepest background color, representing the void of late-night radio"
  surface:
    value: "#1A1F2E"
    description: "Midnight Station Blue - Secondary background for cards, modals, and elevated surfaces"
  error:
    value: "#E34A4A"
    description: "Dial Red - Used for errors, warnings, and critical states"
  success:
    value: "#4ECDC4"
    description: "Teal - Used for success states, recording indicators, and positive feedback"
  text:
    value: "#FFFFFF"
    description: "Primary text color for maximum contrast on dark backgrounds"
  textSecondary:
    value: "#C0C5CE"
    description: "Moonlight Silver - Secondary text for less prominent information"
  
  gradients:
    morning:
      start: "#FF8C42"
      end: "#FFD166"
      description: "Dawn gradient for morning commute hours (7-9 AM)"
    evening:
      start: "#F5A623"
      end: "#6A0572"
      description: "Sunset gradient for evening commute hours (5-7 PM)"
    night:
      start: "#1A1F2E"
      end: "#0B0E14"
      description: "Night gradient for off-peak hours"
  
  overlays:
    light:
      value: "rgba(255, 255, 255, 0.05)"
      description: "Subtle overlay for interactive elements"
    medium:
      value: "rgba(255, 255, 255, 0.1)"
      description: "Standard overlay for buttons and cards"
    strong:
      value: "rgba(255, 255, 255, 0.15)"
      description: "Prominent overlay for active states"
    modal:
      value: "rgba(0, 0, 0, 0.8)"
      description: "Dark overlay for modal backdrops"
    
  borders:
    subtle:
      value: "rgba(255, 255, 255, 0.1)"
      description: "Subtle border for dividers"
    default:
      value: "rgba(255, 255, 255, 0.2)"
      description: "Standard border for cards and inputs"
    strong:
      value: "rgba(255, 255, 255, 0.3)"
      description: "Strong border for emphasis"

typography:
  fonts:
    primary:
      value: "Inter"
      description: "Main UI font for body text and interface elements"
    headline:
      value: "Playfair Display"
      description: "Serif font for headlines and titles, evoking vintage radio elegance"
    mono:
      value: "JetBrains Mono"
      description: "Monospace font for data, technical information, and timestamps"
  
  sizes:
    xs:
      value: 10
      description: "Extra small text for minimal labels"
    sm:
      value: 12
      description: "Small text for captions and secondary information"
    base:
      value: 16
      description: "Base body text size"
    md:
      value: 18
      description: "Medium text for emphasis"
    lg:
      value: 20
      description: "Large text for subtitles"
    xl:
      value: 24
      description: "Extra large for section headers"
    xxl:
      value: 32
      description: "Double extra large for main titles"
  
  weights:
    regular:
      value: "400"
      description: "Regular weight for body text"
    medium:
      value: "500"
      description: "Medium weight for emphasis"
    semibold:
      value: "600"
      description: "Semi-bold for buttons and important text"
    bold:
      value: "700"
      description: "Bold for headlines and strong emphasis"
  
  styles:
    h1:
      fontFamily: "Playfair Display"
      fontSize: 32
      fontWeight: "700"
      color: "#FFFFFF"
      description: "Main page titles"
    h2:
      fontFamily: "Playfair Display"
      fontSize: 24
      fontWeight: "700"
      color: "#FFFFFF"
      description: "Section headers and modal titles"
    body:
      fontFamily: "Inter"
      fontSize: 16
      fontWeight: "400"
      color: "#FFFFFF"
      description: "Standard body text"
    caption:
      fontFamily: "Inter"
      fontSize: 12
      fontWeight: "400"
      color: "#C0C5CE"
      description: "Secondary text and captions"
    data:
      fontFamily: "JetBrains Mono"
      fontSize: 12
      fontWeight: "400"
      color: "#F5A623"
      description: "Technical data, frequencies, and timestamps"

spacing:
  xs:
    value: 4
    description: "Extra small spacing for tight layouts"
  sm:
    value: 6
    description: "Small spacing for icon margins"
  md:
    value: 8
    description: "Medium spacing for standard gaps"
  lg:
    value: 12
    description: "Large spacing for card margins"
  xl:
    value: 16
    description: "Extra large spacing for section padding"
  xxl:
    value: 20
    description: "Double extra large for modal padding"
  xxxl:
    value: 24
    description: "Triple extra large for major section separation"

radii:
  xs:
    value: 3
    description: "Extra small radius for minimal rounding"
  sm:
    value: 4
    description: "Small radius for subtle rounding"
  md:
    value: 8
    description: "Medium radius for buttons and small cards"
  lg:
    value: 12
    description: "Large radius for content areas"
  xl:
    value: 16
    description: "Extra large radius for modals and panels"
  xxl:
    value: 20
    description: "Double extra large radius for feature cards"
  full:
    value: 9999
    description: "Full radius for pills and circles"

elevation:
  none:
    shadowColor: "transparent"
    shadowOffset: { width: 0, height: 0 }
    shadowOpacity: 0
    shadowRadius: 0
    elevation: 0
    description: "No elevation for flat elements"
  
  low:
    shadowColor: "#000000"
    shadowOffset: { width: 0, height: 1 }
    shadowOpacity: 0.15
    shadowRadius: 2
    elevation: 2
    description: "Low elevation for subtle depth"
  
  medium:
    shadowColor: "#000000"
    shadowOffset: { width: 0, height: 2 }
    shadowOpacity: 0.2
    shadowRadius: 4
    elevation: 4
    description: "Medium elevation for cards and floating elements"
  
  high:
    shadowColor: "#F5A623"
    shadowOffset: { width: 0, height: 0 }
    shadowOpacity: 0.2
    shadowRadius: 8
    elevation: 6
    description: "High elevation with brand glow for special elements like QR codes"

motion:
  duration:
    fast:
      value: 150
      description: "Fast animations for micro-interactions"
    normal:
      value: 300
      description: "Normal duration for standard transitions"
    slow:
      value: 500
      description: "Slow animations for dramatic effects"
  
  easing:
    linear:
      value: "linear"
      description: "Linear easing for continuous animations"
    easeIn:
      value: "cubic-bezier(0.4, 0.0, 1.0, 1.0)"
      description: "Ease in for accelerating motion"
    easeOut:
      value: "cubic-bezier(0.0, 0.0, 0.2, 1.0)"
      description: "Ease out for decelerating motion"
    easeInOut:
      value: "cubic-bezier(0.4, 0.0, 0.2, 1.0)"
      description: "Ease in-out for smooth transitions"
    spring:
      tension: 100
      friction: 10
      description: "Spring animation for bouncy, natural feel"
  
  types:
    fade:
      type: "timing"
      duration: 300
      easing: "easeInOut"
      description: "Fade in/out for opacity transitions"
    slide:
      type: "timing"
      duration: 300
      easing: "easeOut"
      description: "Slide animations for modals and panels"
    bounce:
      type: "spring"
      tension: 100
      friction: 10
      description: "Bouncy animations for playful interactions"
    pulse:
      type: "sequence"
      description: "Pulsing animation for recording indicators and live states"
    vibrate:
      type: "sequence"
      description: "Quick vibration effect for audio-reactive elements"

---

# Radio App Design System

## Overview

This design system defines the visual language for a vintage-inspired modern radio application. The aesthetic blends nostalgic FM radio elements with contemporary mobile design patterns, creating an experience that feels both timeless and cutting-edge.

### Design Philosophy

**"Modern Nostalgia"** - The design honors the golden age of radio through warm amber accents, serif headlines, and analog-inspired visualizations, while embracing modern dark mode aesthetics, smooth animations, and accessible touch interfaces.

## Color System

### Primary Palette

The color palette is built around a warm, inviting amber that evokes the glow of vintage vacuum tubes and dial lights, set against deep midnight backgrounds that recall late-night radio listening.

**Warm Signal Amber (#F5A623)** serves as the primary brand color, used for:
- Primary action buttons
- Active state indicators
- Stream quality indicators (medium quality)
- Data display text
- Interactive element highlights

**Deep Receiving Black (#0B0E14)** forms the foundation of the dark theme:
- Main application background
- Night gradient endpoints
- Modal backdrops (with opacity)

**Midnight Station Blue (#1A1F2E)** provides depth and hierarchy:
- Card and modal backgrounds
- Elevated surface layers
- Night gradient start points

### Semantic Colors

**Dial Red (#E34A4A)** signals caution and urgency:
- Error states
- Low stream quality indicator
- Critical warnings
- Destructive actions (when needed)

**Teal (#4ECDC4)** represents success and activity:
- Recording indicators
- High stream quality
- Success confirmations
- Positive feedback states

### Functional Overlays

White overlays with varying opacity create depth and interaction states without introducing new hues:

- **5% opacity**: Subtle hover states, minimal depth
- **10% opacity**: Standard button backgrounds, card overlays
- **15% opacity**: Active states, selected items
- **20% opacity**: Strong borders, divider lines
- **30% opacity**: Prominent interactive elements
- **80% black**: Modal backdrops, focus dimming

### Time-Based Gradients

The app features dynamic gradients that respond to real-world time, connecting listeners globally through shared commute experiences:

**Morning Commute (7-9 AM)**
A warm dawn gradient transitioning from vibrant orange (#FF8C42) to soft yellow (#FFD166), evoking sunrise and the energy of starting the day.

**Evening Commute (5-7 PM)**
A rich sunset gradient flowing from brand amber (#F5A623) into deep purple (#6A0572), capturing the transition from day to night.

**Night Hours**
A subtle midnight gradient from station blue (#1A1F2E) to receiving black (#0B0E14), providing calm during off-peak hours.

## Typography

### Font Families

Three carefully selected typefaces create visual hierarchy and personality:

**Inter** - The workhorse of the interface, Inter provides excellent readability at all sizes with its humanist sans-serif design. Used for:
- Body copy
- Button labels
- Form inputs
- Navigation items

**Playfair Display** - A high-contrast serif that brings elegance and vintage radio character to headlines. Its dramatic thick-thin strokes recall classic print media and broadcast typography. Used for:
- Page titles
- Modal headers
- Section headings
- Feature callouts

**JetBrains Mono** - A monospaced font that adds technical authenticity to data display. Its clean, geometric forms evoke frequency displays and technical readouts. Used for:
- Frequency displays (e.g., "98.5 MHz")
- Timestamps
- Technical specifications
- Quality indicators

### Type Scale

The type scale follows a modular progression optimized for mobile readability:

| Size | Usage | Example |
|------|-------|---------|
| 10px | Minimal labels | Icon badges, tiny metadata |
| 12px | Captions & data | Secondary info, technical specs |
| 14px | Small body | Compact lists, dense content |
| 16px | Body text | Standard reading content |
| 18px | Emphasis | Lead paragraphs, important notes |
| 20px | Subtitles | Modal titles, card headers |
| 24px | Section heads | Page sections, major divisions |
| 32px | Display | Main titles, hero content |

### Weight System

Four weights provide sufficient contrast without overwhelming:

- **400 (Regular)**: Default body text, relaxed reading
- **500 (Medium)**: Slight emphasis, button labels
- **600 (SemiBold)**: Interactive elements, active states
- **700 (Bold)**: Headlines, maximum emphasis

## Layout & Spacing

### Spacing Scale

An 8-point grid system ensures consistent rhythm throughout the interface:

```
4px  - Tight internal spacing (icon to label)
6px  - Icon margins within buttons
8px  - Standard gap between related elements
12px - Card margins, list item spacing
16px - Section padding, component gaps
20px - Modal content padding
24px - Major section separation
```

### Component Spacing Patterns

**Cards**: 20px internal padding with 12px external margins
**Modals**: 20px edge padding with 24px section spacing
**Lists**: 12px vertical spacing between items
**Buttons**: 16px horizontal padding, 12px vertical padding
**Forms**: 8px label-to-input spacing, 16px field spacing

## Shape Language

### Border Radius System

Rounded corners soften the digital interface, creating approachable, tactile surfaces:

**3-4px (Subtle)**: Minimal rounding for technical elements, data displays
**8px (Standard)**: Buttons, input fields, small cards
**12px (Friendly)**: Content areas, medium cards
**16px (Smooth)**: Modal containers, large panels
**20px (Organic)**: Feature cards, hero elements
**Full (Circular)**: Pills, toggles, avatar placeholders

The generous radii on interactive elements (20px for feature cards) create a friendly, approachable feel that invites touch interaction.

### Shadow System

Shadows serve dual purposes: creating depth hierarchy and adding brand character.

**Standard Shadows** use neutral black with low opacity for natural depth:
- Offset: 0px horizontal, 2px vertical
- Opacity: 20%
- Radius: 4px
- Elevation: 4 (Android)

**Brand Glow Shadows** apply the primary amber color for special elements like QR codes or premium features:
- Offset: 0px (centered)
- Opacity: 20%
- Radius: 8px
- Creates a subtle luminous effect

## Motion Design

### Animation Principles

Motion in the radio app serves three purposes:
1. **Feedback**: Confirming user actions with immediate response
2. **Orientation**: Guiding attention through spatial transitions
3. **Delight**: Adding personality through playful, analog-inspired movements

### Animation Types

**Springs** are preferred for interactive elements, providing a bouncy, physical feel that mimics analog dials and switches:
- Tension: 100
- Friction: 10
- Used for: Needle movement, toggle switches, button presses

**Timing Animations** handle structural transitions:
- Duration: 300ms standard
- Easing: Ease-out for entrances, ease-in-out for internal transitions
- Used for: Modal slides, screen transitions, fades

**Sequence Animations** create complex behaviors:
- Combining multiple animations in series
- Used for: Recording pulses, audio-reactive vibrations, loading states

### Signature Animations

**Vintage Dial Needle**: The FM visualizer needle uses spring physics to track audio levels, with subtle vibration overlays that respond to signal strength—creating an authentic analog meter feel.

**Recording Pulse**: When recording, the indicator breathes with a gentle pulse animation, using sequence timing to expand and contract while maintaining visibility.

**Quality Indicator**: Network quality badges smoothly transition colors when conditions change, providing at-a-glance status without jarring cuts.

## Component Patterns

### Cards

Cards are the primary content container, featuring:
- 20px border radius for friendly appearance
- 20px internal padding for comfortable content density
- White overlay backgrounds (10-15% opacity) over gradient bases
- Subtle shadows for elevation
- Optional border (20% white) for definition

### Modals

Modals slide up from the bottom with:
- 20px top corner radius
- 80% max-height constraint
- Dark backdrop overlay
- Clear close button in header
- Scrollable content area

### Buttons

Interactive elements follow consistent patterns:
- 8px border radius for touch-friendly targets
- 16px horizontal padding minimum
- Clear visual states (default, pressed, disabled)
- Icon + text combinations when appropriate

### Indicators

Status indicators are compact but clear:
- Pill-shaped containers (16px radius)
- Icon + label combinations
- Color-coded states
- Accompanying explanatory text below

## Accessibility Considerations

### Contrast

All text maintains WCAG AA compliance:
- White text on dark backgrounds: 15:1+ contrast ratio
- Secondary text (Moonlight Silver): 7:1+ on dark backgrounds
- Brand amber used sparingly for non-critical information

### Touch Targets

All interactive elements meet minimum 44x44pt touch target size, achieved through:
- Generous padding on buttons
- Extended hit areas on icons
- Full-card tap zones on list items

### Motion Sensitivity

Animations respect system preferences:
- Reduced motion mode disables spring animations
- Essential feedback maintained through color changes
- No auto-playing animations without user initiation

## Visual Metaphors

### The Tuning Dial

The vintage dial visualization is the app's centerpiece, translating abstract audio data into tangible movement. The needle responds to real-time audio levels, creating a direct visual connection between listener and broadcast—just like classic FM radios.

### The Weather Wheel

Weather-based discovery uses a circular metaphor, with conditions mapped to music genres. This creates an intuitive, almost mystical connection between atmospheric conditions and musical mood.

### Global Commute Cards

Time-zone aware city cards show what's playing during commute hours worldwide, creating a sense of global community among radio listeners. Gradient backgrounds shift based on local time, making the connection between place, time, and sound visceral.

## Implementation Notes

### Platform Adaptation

While designed primarily for React Native, the token system translates to web and native platforms:
- iOS: Map to UIColor assets and SF Symbols where appropriate
- Android: Use Material Theme Builder compatibility
- Web: CSS custom properties for runtime theming

### Performance Considerations

- Prefer transform and opacity animations for 60fps performance
- Use native driver for animations when available
- Limit simultaneous animations to prevent jank
- Cache expensive computations (gradients, interpolations)

### Theming Architecture

The design supports future theme expansion:
- Token structure allows light theme addition
- Gradient system can extend to seasonal themes
- Color semantics enable high-contrast modes

---

*This design system evolves with the product. All tokens and patterns should be validated against actual implementations and user feedback.*
