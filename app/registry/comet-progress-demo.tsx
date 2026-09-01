import { CodeBlock } from "@/components/code-block";

import { BodyText, InlineCode, Section, Subsection } from "../primitives";
import { CometProgressPreview } from "./comet-progress-preview";

const cometProgressDocumentation = {
  description:
    "An accessible grid progress bar with a fading, randomized comet tail.",
  id: "comet-progress",
  installCommand:
    "npx shadcn@latest add https://hu553in.su/r/comet-progress.json",
  theming: {
    active: "--comet-progress-active",
    empty: "--comet-progress-empty",
    fallbacks: ["--primary", "--muted", "--muted-foreground"],
  },
  title: "Comet progress",
  usage: `import { CometProgress } from '@/components/ui/comet-progress';

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
/>;`,
} as const;

const CometProgressDemo = () => (
  <Section
    className="scroll-mt-16"
    id={cometProgressDocumentation.id}
    title={cometProgressDocumentation.title}
  >
    <div className="flex flex-col gap-4">
      <BodyText>{cometProgressDocumentation.description}</BodyText>
      <BodyText>
        Override{" "}
        <InlineCode>{cometProgressDocumentation.theming.active}</InlineCode>
        {" and "}
        <InlineCode>{cometProgressDocumentation.theming.empty}</InlineCode> from
        CSS. The defaults derive from{" "}
        <InlineCode>
          {cometProgressDocumentation.theming.fallbacks[0]}
        </InlineCode>
        ,{" "}
        <InlineCode>
          {cometProgressDocumentation.theming.fallbacks[1]}
        </InlineCode>
        , and{" "}
        <InlineCode>
          {cometProgressDocumentation.theming.fallbacks[2]}
        </InlineCode>
        .
      </BodyText>

      <CometProgressPreview />

      <Subsection title="Install">
        <CodeBlock
          code={cometProgressDocumentation.installCommand}
          language="bash"
        />
      </Subsection>

      <Subsection title="Use">
        <CodeBlock code={cometProgressDocumentation.usage} language="tsx" />
      </Subsection>
    </div>
  </Section>
);

export { CometProgressDemo, cometProgressDocumentation };
