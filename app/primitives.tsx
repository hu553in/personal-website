const Divider = () => <hr className="border-black/10 dark:border-white/10" />;

const linkClassNames = {
  inline:
    "underline underline-offset-4 decoration-black/25 hover:text-(--ink) hover:decoration-(--ink) dark:decoration-white/30 dark:hover:decoration-(--ink)",
  quiet: "hover:text-(--ink)",
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
      className={`transition-colors ${linkClassNames[variant]}${className ? ` ${className}` : ""}`}
      href={href}
      rel={opensInNewTab ? "noreferrer" : undefined}
      target={opensInNewTab ? "_blank" : target}
    >
      {children}
    </a>
  );
};

const Section = ({
  children,
  title,
}: Readonly<{
  children: React.ReactNode;
  title: string;
}>) => (
  <section className="flex flex-col gap-4 py-10">
    <h2 className="text-muted text-[13px] font-medium tracking-wider uppercase">
      {title}
    </h2>
    {children}
  </section>
);

const BodyText = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => <p className="text-muted text-[15px] leading-relaxed">{children}</p>;

export { BodyText, Divider, Link, Section };
