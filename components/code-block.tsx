import { createHighlighterCore } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import bash from "@shikijs/langs/bash";
import tsx from "@shikijs/langs/tsx";
import githubDarkHighContrast from "@shikijs/themes/github-dark-high-contrast";
import githubLightHighContrast from "@shikijs/themes/github-light-high-contrast";

import { CodeBlockCopyButton } from "./code-block-copy-button";

const themes = {
  dark: "github-dark-high-contrast",
  light: "github-light-high-contrast",
} as const;

const highlighter = createHighlighterCore({
  engine: createJavaScriptRegexEngine(),
  langs: [bash, tsx],
  themes: [githubDarkHighContrast, githubLightHighContrast],
});

interface CodeBlockProperties {
  code: string;
  language: "bash" | "tsx";
}

const CodeBlock = async ({ code, language }: CodeBlockProperties) => {
  const loadedHighlighter = await highlighter;
  const html = loadedHighlighter.codeToHtml(code, {
    lang: language,
    themes,
  });

  return (
    <div className="border-border bg-muted relative rounded-md border">
      <div
        className="focus-within:outline-ring overflow-x-auto rounded-[inherit] focus-within:outline-2 focus-within:outline-offset-2"
        // oxlint-disable-next-line react/no-danger -- Shiki escapes source before returning highlighted HTML.
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CodeBlockCopyButton className="absolute top-2.5 right-2.5" code={code} />
    </div>
  );
};

export { CodeBlock };
