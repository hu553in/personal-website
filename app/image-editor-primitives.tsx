import { cn } from "@/lib/utils";

import { MetaLine, monoMetaClassName } from "./primitives";

const imageEditorInputClassName =
  "border-muted-foreground/80 bg-background text-foreground focus-visible:outline-ring dark:border-muted-foreground/60 h-9 w-full rounded-sm border px-2.5 text-base focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-50 sm:text-[15px]";

const ImageDownloadLinks = ({
  height,
  items,
  width,
}: {
  height: number;
  items: React.ComponentProps<typeof MetaLine>["items"];
  width: number;
}) => (
  <div className="flex flex-col items-start gap-1 min-[24rem]:flex-row min-[24rem]:items-baseline min-[24rem]:gap-2">
    <span className={monoMetaClassName}>
      {width} × {height} px
    </span>
    <span
      aria-hidden="true"
      className={cn("hidden min-[24rem]:inline", monoMetaClassName)}
    >
      ·
    </span>
    <MetaLine items={items} />
  </div>
);

export { ImageDownloadLinks, imageEditorInputClassName };
