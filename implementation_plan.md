# Theme Update Plan

## Goal Description
Refine the theme selection by removing "Neon Tokyo" and "Deep Sea" as requested, and introducing a new "surprise" theme designed with a premium aesthetic.

## Proposed Changes

### Styles
#### [MODIFY] [themes.ts](file:///c:/Project/bubble/bubble-idx/src/styles/themes.ts)
- Remove `neon-tokyo` theme object.
- Remove `ocean-deep` theme object.
- Add `amethyst-void` theme:
    - **Concept**: Deep void purple with gold/amethyst accents.
    - **Background**: `#0d0b14` to `#1a1625` gradient.
    - **Accents**: Amethyst (`#9d4edd`) and Gold (`#ffd700`) highlights.
    - **Vibe**: Mystical, premium, "designer" feel.

## Verification Plan

### Manual Verification
- **Visual Check**:
    1. Open the theme switcher.
    2. Verify "Neon Tokyo" and "Ocean Deep" are gone.
    3. Select "Amethyst Void" (or whatever name is final).
    4. Verify the colors look high-quality and text is readable.
    5. Check mobile responsiveness (ensure no regression).
