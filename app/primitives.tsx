import { cn } from "@/lib/utils";

const Divider = () => <hr className="border-black/10 dark:border-white/10" />;

const monoMetaClassName = "text-muted-foreground font-mono text-[13px]";
const iconButtonClassName =
  "text-muted-foreground hover:text-foreground focus-visible:outline-ring flex size-8 items-center justify-center rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";
const metaActionClassName =
  "hover:text-foreground focus-visible:outline-ring rounded-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-50";

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
      className={cn(
        "focus-visible:outline-ring rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
        linkClassNames[variant],
        className
      )}
      href={href}
      data-cuelume-toggle="tick"
      rel={opensInNewTab ? "noreferrer" : undefined}
      target={opensInNewTab ? "_blank" : target}
    >
      {children}
    </a>
  );
};

const HomeLink = () => (
  <Link
    className={cn("self-start", monoMetaClassName)}
    href="/"
    variant="quiet"
  >
    ← home
  </Link>
);

type MetaLineItem = Readonly<{
  ariaLabel?: string;
  disabled?: boolean;
  href?: string;
  label: string;
  onClick?: () => void;
}>;

const MetaLineValue = ({ item }: Readonly<{ item: MetaLineItem }>) => {
  if (item.onClick) {
    const handleClick = item.onClick;

    return (
      <button
        aria-label={item.ariaLabel}
        className={metaActionClassName}
        disabled={item.disabled}
        onClick={handleClick}
        type="button"
      >
        {item.label}
      </button>
    );
  }

  if (item.href) {
    return (
      <Link aria-label={item.ariaLabel} href={item.href} variant="quiet">
        {item.label}
      </Link>
    );
  }

  return <span>{item.label}</span>;
};

const MetaLine = ({ items }: Readonly<{ items: readonly MetaLineItem[] }>) => (
  <span className={cn("flex items-baseline gap-2", monoMetaClassName)}>
    {items.map((item, index) => (
      <span key={item.label} className="flex items-baseline gap-2">
        {index > 0 ? <span aria-hidden="true">·</span> : null}
        <MetaLineValue item={item} />
      </span>
    ))}
  </span>
);

const Page = ({ className, ...props }: React.ComponentProps<"main">) => (
  <main
    {...props}
    className={cn(
      "relative mx-auto flex w-full max-w-160 flex-col px-6 py-24 sm:py-32",
      className
    )}
  />
);

const PageHeader = ({
  className,
  ...props
}: React.ComponentProps<"header">) => (
  <header {...props} className={cn("flex flex-col gap-3 pb-10", className)} />
);

const PageTitle = ({
  children,
  className,
  ...props
}: React.ComponentProps<"h1">) => (
  <h1 {...props} className={cn("text-2xl sm:text-3xl", className)}>
    {children}
  </h1>
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
  <section
    {...props}
    className={cn(
      "sidebar:scroll-mt-0 flex scroll-mt-13 flex-col gap-4 py-10",
      className
    )}
  >
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
  HomeLink,
  iconButtonClassName,
  InlineCode,
  Link,
  MetaLine,
  monoMetaClassName,
  Page,
  PageHeader,
  PageTitle,
  Section,
  Subsection,
};
