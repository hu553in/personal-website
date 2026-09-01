import { cn } from "@/lib/utils";

const Divider = () => <hr className="border-black/10 dark:border-white/10" />;

const monoMetaClassName = "text-muted-foreground font-mono text-[13px]";

const linkClassNames = {
  inline:
    "underline underline-offset-4 decoration-black/25 hover:text-foreground hover:decoration-foreground dark:decoration-white/30 dark:hover:decoration-foreground",
  quiet: "hover:text-foreground",
  title: "font-medium underline-offset-4 hover:underline",
} as const;

type LinkProps = React.ComponentProps<"a"> & {
  variant?: keyof typeof linkClassNames;
};

const Link = ({
  children,
  className,
  href,
  target,
  variant = "inline",
  ...props
}: LinkProps) => {
  const isExternal = href?.startsWith("http");
  const opensInNewTab = isExternal || target === "_blank";

  return (
    <a
      {...props}
      className={cn("transition-colors", linkClassNames[variant], className)}
      href={href}
      rel={opensInNewTab ? "noreferrer" : undefined}
      target={opensInNewTab ? "_blank" : target}
    >
      {children}
    </a>
  );
};

const MetaLine = ({
  items,
}: Readonly<{
  items: readonly { href?: string; label: string }[];
}>) => (
  <span className={cn("flex items-baseline gap-2", monoMetaClassName)}>
    {items.map((item, index) => (
      <span key={item.label} className="flex items-baseline gap-2">
        {index > 0 ? <span aria-hidden="true">·</span> : null}
        {item.href ? (
          <Link href={item.href} variant="quiet">
            {item.label}
          </Link>
        ) : (
          <span>{item.label}</span>
        )}
      </span>
    ))}
  </span>
);

const Section = ({
  children,
  className,
  title,
  ...props
}: Readonly<
  React.ComponentProps<"section"> & {
    title: string;
  }
>) => (
  <section {...props} className={cn("flex flex-col gap-4 py-10", className)}>
    <h2 className="text-muted-foreground text-[13px] font-medium tracking-wider uppercase">
      {title}
    </h2>
    {children}
  </section>
);

const Subsection = ({
  children,
  title,
}: Readonly<{
  children: React.ReactNode;
  title: string;
}>) => (
  <div className="flex flex-col gap-1.5">
    <h3 className="text-[15px] font-medium">{title}</h3>
    {children}
  </div>
);

const BodyText = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <p className="text-muted-foreground text-[15px] leading-relaxed">
    {children}
  </p>
);

const InlineCode = ({ className, ...props }: React.ComponentProps<"code">) => (
  <code
    {...props}
    className={cn(
      "bg-muted/60 text-foreground/90 inline-block rounded-[0.35em] px-[0.4em] py-px align-[0.04em] font-mono text-[0.875em] leading-tight whitespace-nowrap ring-1 ring-black/10 ring-inset dark:ring-white/10",
      className
    )}
  />
);

export {
  BodyText,
  Divider,
  InlineCode,
  Link,
  MetaLine,
  monoMetaClassName,
  Section,
  Subsection,
};
