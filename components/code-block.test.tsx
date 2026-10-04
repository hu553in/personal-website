import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CodeBlock } from "./code-block";

describe(CodeBlock, () => {
  afterEach(cleanup);

  it("makes overflowing code reachable from the keyboard", async () => {
    const { container } = render(
      await CodeBlock({ code: "echo hello", language: "bash" })
    );
    const code = container.querySelector("pre");

    expect(code?.tabIndex).toBe(0);
    code?.focus();
    expect(document.activeElement).toBe(code);
  });
});
