# shadcn registry

A shadcn registry for sharing reusable code across projects.

[license (MIT)](https://github.com/hu553in/personal-website/blob/main/registry/LICENSE) ·
[github](https://github.com/hu553in/personal-website/tree/main/registry)

## Comet progress

An accessible grid progress bar with a fading, randomized comet tail.

Override `--comet-progress-active` and `--comet-progress-empty` from CSS. The defaults derive from
`--primary`, `--muted`, and `--muted-foreground`.

### Install

```bash
npx shadcn@latest add https://hu553in.su/r/comet-progress.json
```

### Use

```tsx
import { CometProgress } from '@/components/ui/comet-progress';

<CometProgress
  /* Required accessible name. aria-labelledby also works. */
  aria-label="Progress"
  /* Required current value. Values outside the range are clamped. */
  value={42}
  /* Optional lower bound. Defaults to 0. */
  min={0}
  /* Optional upper bound. Invalid ranges use a finite 100-unit fallback. */
  max={100}
  /* Optional aria-valuetext formatter. Defaults to a rounded percentage. */
  getValueText={(value, min, max) => [value, min, max].join(' / ')}
  /*
   * Optional visual completion callback. Offscreen animation pauses; reduced
   * motion completes immediately. Set value below max to rearm it.
   */
  onAnimationComplete={() => {
    /* Runs after the comet tail exits. */
  }}
  /* Optional classes for the root element. */
  className="max-w-xl"
  /* Forwards other div props to the root. */
  id="progress"
/>;
```
