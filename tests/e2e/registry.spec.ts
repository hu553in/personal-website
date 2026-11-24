import { expect, test } from "playwright/test";

test("the production build serves the installable registry item", async ({
  request,
}) => {
  const response = await request.get("/r/comet-progress.json");

  await expect(response).toBeOK();
  expect(await response.json()).toMatchObject({
    files: expect.arrayContaining([
      expect.objectContaining({
        content: expect.stringContaining("export"),
        path: "registry/default/ui/comet-progress.tsx",
      }),
    ]),
    name: "comet-progress",
    type: "registry:ui",
  });
});
