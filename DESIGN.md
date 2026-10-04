# Design

Design rules for this site. Each rule names where it lives in code.

## Casing

Labels are lowercase. A label names a thing or an action and is not a sentence: navigation items,
section and subsection titles, form labels, button and link labels, meta tags such as roles and
periods, tooltips, `aria-label` values, and live-region announcements. Examples: `about`,
`back to top`, `download PNG`, `copy code`, `senior backend engineer`.

Sentences keep sentence case. Body text, descriptions, errors, and status messages with terminal
punctuation start with a capital letter. A single output channel stays in one register, so
`Preparing 2x PNG…` and `Downloaded 2x PNG.` match.

Proper nouns keep their own casing everywhere, inside labels too. This covers people, companies,
products, languages, tools, acronyms (`PNG`, `MIT`, `CLI`, `iOS`), lowercase brands (`voomy`, `vlt`,
`shadcn`, `hu553in`), company names as the company styles them (`QIC digital hub`), published titles
of articles and talks as published, and project names as the project's own README spells them.
Registry component names follow the same rule (`Comet progress`).

Source strings hold the lowercase form; CSS may transform them for display. Section headings use
`uppercase` in `app/primitives.tsx`, and the same strings feed the sidebar, the mobile section
label, and the Markdown twins in `public/`.

External surfaces keep conventional Title Case: the document title, Open Graph and Twitter titles,
JSON-LD `jobTitle`, the resume filename, and the LinkedIn cover image defaults. They render inside
other products, where lowercase reads as an error rather than a style. The site's own Open Graph
image text follows the label rule.

## Punctuation

Typographic apostrophes (`’`), en dashes for ranges (`2021–2025`), spaced em dashes for asides, `·`
between meta items, `×` between dimensions. Link labels name the destination (`github`, `website`,
`telegram`, `pdf`, `page`), not the action; the accessible name adds the entry title in front
(`voomy github`).

## Typography

Three faces, each with one job (`app/globals.css`):

- Exposure, variable, `EXPO -10`, weight 500: the page title, the Open Graph title line, and the
  LinkedIn cover headings.
- OpenRunde, 400 and 500: body text and all other headings.
- JetBrains Mono: the metadata register. Navigation, roles, periods, link labels, form labels,
  status output, and code all use `monoMetaClassName` or `font-mono`.

Sizes form a fixed scale: page title `text-2xl sm:text-3xl`, entry titles and body text 15px, mono
metadata and navigation 13px, section headings 13px uppercase with `tracking-wider`, inline code
`0.875em`, code blocks `0.75rem`. Body text is `leading-relaxed`; headings, navigation, and chips
are `leading-snug`. Entry titles are `font-medium`; body text is regular weight in
`text-muted-foreground`.

## Color

The palette is neutral only. Light is a warm off-white (`#fffdfa`) on near-black ink; dark is a cool
near-black (`#0e0e11`) on off-white. Tokens live in `app/globals.css` and are exposed through
Tailwind theme variables. The only chromatic color is the emerald check after a successful copy.

Borders and dividers are ink overlays, `black/10` in light and `white/10` in dark, never solid
grays. Muted text uses `text-muted-foreground` for everything secondary: body copy, metadata,
inactive navigation, icon buttons. Foreground is reserved for the name, entry titles, and the active
or hovered state.

The browser chrome follows the theme: `theme-color` meta tags are media-based and rewritten on
manual switches (`app/theme-toggle.tsx`).

## Layout

One column, `max-w-160`, `px-6`, `py-24` growing to `py-32` on `sm`. Sections are `py-10` with a
hairline `<hr>` between them, never cards or backgrounds. Inside a section, items stack with `gap-4`
and each item is title row plus description with `gap-1.5`.

The title row is one line on `sm` and up: entry title, then mono metadata separated by `·`. Below
`sm` the metadata drops to its own line and the separator hides. Section headings are small muted
labels, not display type; hierarchy comes from spacing and the title weight.

Page navigation lives in a `w-44` sidebar at the `sidebar` breakpoint (69rem), positioned left of
the column and sticky at the title line. Below that breakpoint it becomes a sticky `on this page`
disclosure under the header with a floating panel capped at `50dvh`.

Navigation rows are `min-h-10`; page-chrome icon buttons are `size-8`; the copy button inside code
blocks is `size-6`. Corners are `rounded-sm`; code blocks and the copy button use `rounded-md`.

## Links and focus

Three link variants in `app/primitives.tsx`: `inline` (underline, muted decoration, offset 4) for
links inside prose, `quiet` (color change only) for metadata and navigation, `title` (underline on
hover) for headings that link. Any `http` href opens in a new tab with `rel="noreferrer"`.

Focus is always `focus-visible:outline-ring` at 2px with a 2px offset; navigation rows use a
negative offset so the ring stays inside the row. Hover changes color or underline only, never size
or position.

Icon-only controls carry an `aria-label` and a `title`; the title may name the next action where the
state flips (`mute sounds`, `enable sounds`). Icons are `aria-hidden`, `size-4` inside page-chrome
buttons. `react-icons/fa6` supplies brand marks and the toggle glyphs, `lucide-react` the chevron,
copy, and check.

## Navigation behavior

The scrollspy (`app/use-page-location.ts`, `app/page-location.ts`) highlights the section at the
reading line. In the last viewport the reading line moves down so short trailing sections still get
distinct activation intervals without padding the page.

The URL fragment changes only on explicit navigation; ordinary scrolling never rewrites the address.
`back to top` appears once the reader has left the header and returns focus to `<main>`. Modified
clicks (middle, ctrl, meta, shift, alt) keep native link behavior.

## Motion

`prefers-reduced-motion` is honored everywhere: the hero shows its poster instead of video, the
comet progress draws its final frame without animation, the theme switches without a view
transition, and the disclosure chevron rotates without a transition.

Theme switching is a View Transition masked by `/theme-toggle.gif`, 3s with an exponential ease
(`--expo-in`). Theme-independent media (hero, editor previews) are lifted out of the mask with
`view-transition-name` so they do not re-snapshot.

Transitions elsewhere are `transition-colors` only, 150ms for the chevron.

## Sound

Interface sounds come from `cuelume` (`lib/sounds.ts`). They are off by default, stored under the
`interface-sounds` localStorage key, and play at volume 0.2. `tick` on links and navigation rows,
`toggle` on the theme and disclosure controls, `success` on copy and download. Enabling sound plays
one `toggle` as confirmation.

## Theme

System theme by default. The toggle flips between light and dark and returns to `system` when the
chosen theme matches the OS, so the site keeps following the OS afterwards. The `d` hotkey always
sets an explicit theme.

## Media

Hero: 832 × 464 WebP poster with a muted, looping WebM/MP4 video on top and a play/pause control in
the bottom-right corner. Playback failure falls back to the poster.

Open Graph image: 1200 × 630, `#0e0e11` background, Exposure 88px title and OpenRunde 34px muted
description, 96px side padding (`app/_og/create-image.tsx`). The editor at `/open-graph-image`
renders through the same function.

LinkedIn cover image: 1584 × 396, dark diagonal gradient, geometry in pixels so the export does not
depend on the browser font size. Exports at 1x and 2x.

## Text surfaces

Every HTML page has a Markdown twin in `public/` advertised through `<link rel="alternate">` and
HTTP `Link` headers (`next.config.ts`). `llms.txt` indexes them; `/llms-full.txt` redirects to the
profile. `/DESIGN.md` serves this file. Content lives in `app/data.tsx` and `app/site-data.ts`;
content tests keep the twins aligned with the rendered pages.

Code samples use Shiki with the GitHub high-contrast themes and a copy button that announces the
result to assistive technology.
