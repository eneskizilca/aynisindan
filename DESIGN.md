---
name: Artisanal Trust System
colors:
  surface: '#fff8f6'
  surface-dim: '#e9d6d1'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ed'
  surface-container: '#feeae5'
  surface-container-high: '#f8e4df'
  surface-container-highest: '#f2ded9'
  on-surface: '#231916'
  on-surface-variant: '#56423d'
  inverse-surface: '#392e2b'
  inverse-on-surface: '#ffede8'
  outline: '#8a726b'
  outline-variant: '#ddc0b9'
  surface-tint: '#a04024'
  primary: '#9d3e22'
  on-primary: '#ffffff'
  primary-container: '#bd5538'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb5a0'
  secondary: '#5d5e61'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e5'
  on-secondary-container: '#636467'
  tertiary: '#5a5c5d'
  on-tertiary: '#ffffff'
  tertiary-container: '#737576'
  on-tertiary-container: '#fcfdfe'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#80290f'
  secondary-fixed: '#e2e2e5'
  secondary-fixed-dim: '#c6c6c9'
  on-secondary-fixed: '#1a1c1e'
  on-secondary-fixed-variant: '#454749'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#fff8f6'
  on-background: '#231916'
  surface-variant: '#f2ded9'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap: 80px
---

## Brand & Style

The design system is rooted in the intersection of **heritage craftsmanship** and **modern financial security**. It aims to evoke a sense of quiet luxury—where the focus remains on the artisan's work while the interface provides a professional, "escrow-secure" environment.

The visual direction follows a **High-End Minimalist** aesthetic. By utilizing generous whitespace and a restrained color palette, the system allows high-resolution product photography to serve as the primary visual driver. The style is intentional and "uncluttered," mirroring the precision of a master furniture maker’s workshop. 

Key attributes:
- **Reliable:** Structured layouts and clear typography communicate the safety of the transaction.
- **Artisanal:** Warm accents prevent the UI from feeling cold or purely "fintech."
- **Discerning:** Subtle interactions and refined borders cater to a high-net-worth customer base.

## Colors

The palette is anchored by **Terracotta (#D66849)**, a color that evokes natural materials like clay and warm wood. This is used sparingly as an accent for calls-to-action and brand moments. 

**Deep Charcoal (#1A1C1E)** provides the "professional weight," used for primary text and high-level navigation to instill confidence in the marketplace's legitimacy. 

The status palette is distinct and functional:
- **Pending:** Amber (Warmth, caution).
- **In Progress:** Blue (Activity, focus).
- **Delivered:** Indigo (Premium, finality).
- **Completed:** Green (Success, growth).

Surface colors should remain primarily white or very light gray to maintain a "gallery" feel.

## Typography

**Plus Jakarta Sans** is the sole typeface for this design system. Its modern, geometric curves offer a tech-forward feel that balances the traditional nature of the artisan goods.

- **Headlines:** Use semi-bold weights with tight letter-spacing for a sophisticated, editorial look.
- **Body Text:** Use a standard weight with generous line-height (1.6) to ensure readability during long descriptions of bespoke processes.
- **Labels:** Use medium or semi-bold weights for status badges and metadata to ensure they remain legible at small sizes.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

A "Generous Whitespace" philosophy is applied:
- **Desktop:** Large margins (40px) and a maximum container width (1280px) keep content centered and easy to digest.
- **Vertical Rhythm:** Sections are separated by large gaps (80px) to allow each artisan's story or product category to stand alone without visual noise.
- **Alignment:** Consistent left-alignment for text blocks to maintain a clean, architectural structure.

## Elevation & Depth

To maintain a premium feel, the design system avoids heavy shadows in favor of **Soft Shadows** and **Low-Contrast Outlines**.

1.  **Low Elevation (Resting Cards):** A 1px border of `#E2E8F0` with no shadow. This defines the shape without adding visual weight.
2.  **Mid Elevation (Hover States/Active Cards):** A very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.05)) to suggest the element is "lifted" and interactable.
3.  **High Elevation (Modals/Overlays):** A more pronounced but still natural shadow (0px 20px 40px rgba(26, 28, 30, 0.08)).

The background remains flat white to emphasize the "clean" minimalist aesthetic.

## Shapes

The shape language uses **Rounded (Value 2)** corners. This creates a friendly yet professional appearance that bridges the gap between digital "softness" and the physical "sturdiness" of handmade furniture.

- **Primary Components:** (Buttons, Inputs, Cards) use 0.5rem (8px).
- **Secondary Components:** (Chips, Badges) use 1rem (16px) or full pill-shaping to distinguish them from actionable buttons.
- **Imagery:** Product photos should follow the 0.5rem rounding to maintain consistency across the UI.

## Components

### Buttons
- **Primary:** Terracotta background, white text. No shadow in resting state. Subtle darken on hover.
- **Secondary:** White background, 1px Deep Charcoal border. Clear, professional, and understated.

### Status Badges (Chips)
- **Visuals:** Use a "Soft Tint" approach. For example, the *PENDING* badge uses an Amber background at 10% opacity with 100% opacity Amber text.
- **Shape:** Pill-shaped for instant recognition as a status indicator rather than a button.

### Input Fields
- **Style:** 1px `#E2E8F0` border. On focus, the border transitions to Deep Charcoal or Terracotta (if error-free). 
- **Labels:** Always placed above the input in `label-md` for maximum clarity.

### Cards
- **Product Cards:** Minimalist. No borders. Large imagery. Text restricted to Name, Artisan, and Price in a vertical stack.
- **Trust Cards (Escrow/Security):** Subtle light-gray background (`#F8F9FA`) with an icon in Terracotta to highlight the "Secure Payment" features.

### Lists
- Clean rows separated by a 1px `#F1F5F9` line. Ample padding (16px-24px) between items to prevent a "cluttered" data-heavy look.