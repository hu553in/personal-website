import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const Divider = () => <hr className="border-black/10 dark:border-white/10" />;

const linkVariants = cva("transition-colors", {
  defaultVariants: {
    variant: "inline",
  },
  variants: {
    variant: {
      // Prose links (about, interests): always underlined, quietly.
      inline:
        "underline underline-offset-4 decoration-black/25 hover:text-(--ink) hover:decoration-(--ink) dark:decoration-white/30 dark:hover:decoration-(--ink)",
      // Meta links in mono tails (work, elsewhere): inherit muted, brighten.
      quiet: "hover:text-(--ink)",
      // Name links (project titles): look like text, underline on hover.
      title: "font-medium underline-offset-4 hover:underline",
    },
  },
});

const Link = ({
  children,
  className,
  href,
  variant,
  ...props
}: React.ComponentProps<"a"> & VariantProps<typeof linkVariants>) => {
  const isExternal = href?.startsWith("http");

  return (
    <a
      className={linkVariants({ className, variant })}
      href={href}
      rel={isExternal ? "noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
      {...props}
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
    <h2 className="text-[13px] font-medium text-muted uppercase tracking-wider">
      {title}
    </h2>
    {children}
  </section>
);

const BodyText = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => <p className="text-[15px] leading-relaxed text-muted">{children}</p>;

export { BodyText, Divider, Link, Section };
