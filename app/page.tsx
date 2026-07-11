import {
  about,
  connectLinks,
  elsewhere,
  identity,
  interests,
  projects,
  sectionTitles,
  stack,
  work,
} from "./data";
import { BodyText, Divider, Link, Section } from "./primitives";

const monoMetaClassName = "text-[13px] font-mono text-muted";

const LinkRow = ({
  links,
  meta,
  role,
  title,
}: Readonly<{
  links: readonly { href: string; label: string }[];
  meta?: string | undefined;
  role?: string | undefined;
  title: string;
}>) => (
  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-[15px] font-medium">{title}</span>
      {role ? (
        <span className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="text-[13px] text-muted font-medium">{role}</span>
          <span aria-hidden="true" className={monoMetaClassName}>
            ·
          </span>
        </span>
      ) : null}
    </span>
    <span className={`flex items-baseline gap-2 ${monoMetaClassName}`}>
      {meta ? (
        <>
          <span>{meta}</span>
          <span aria-hidden="true">·</span>
        </>
      ) : null}
      {links.map((link, index) => (
        <span key={link.href} className="flex items-baseline gap-2">
          {index > 0 ? <span aria-hidden="true">·</span> : null}
          <Link href={link.href} variant="quiet">
            {link.label}
          </Link>
        </span>
      ))}
    </span>
  </div>
);

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-160 flex-col px-6 py-24 sm:py-32">
      <header className="flex flex-col gap-3 pb-10">
        <h1 className="text-2xl sm:text-3xl">
          <Link href={identity.photo} variant="title">
            {identity.name}
          </Link>
        </h1>
        <p className="text-[15px] leading-snug text-muted font-medium">
          <span className="text-(--ink)">{identity.handle}</span>
          {` · ${identity.role}`}
        </p>
      </header>

      <Divider />

      <Section title={sectionTitles.about}>
        <BodyText>{about}</BodyText>
      </Section>

      <Divider />

      <Section title={sectionTitles.work}>
        <div className="flex flex-col gap-3">
          {work.map((entry) => (
            <LinkRow
              key={entry.title}
              links={entry.links}
              meta={entry.meta}
              role={entry.role}
              title={entry.title}
            />
          ))}
        </div>
      </Section>

      <Divider />

      <Section title={sectionTitles.stack}>
        <div className="flex flex-col gap-3">
          {stack.map((group) => (
            <div key={group.id} className="flex items-baseline gap-3">
              <span className={`w-12 shrink-0 ${monoMetaClassName}`}>
                {group.label}
              </span>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="inline-block border border-black/10 dark:border-white/10 rounded px-2.5 py-1 text-[13px] font-mono font-medium text-muted leading-snug"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      <Section title={sectionTitles.projects}>
        <div className="flex flex-col gap-6">
          {projects.map((project) => (
            <div
              key={project.name}
              id={project.name}
              className="flex scroll-mt-10 flex-col gap-1.5"
            >
              <div className="flex items-baseline gap-2">
                <Link
                  className="text-[15px]"
                  href={project.href}
                  variant="title"
                >
                  {project.name}
                </Link>
                <span className="text-[13px] text-muted font-medium">
                  {project.role}
                </span>
              </div>
              <BodyText>{project.description}</BodyText>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      <Section title={sectionTitles.elsewhere}>
        <div className="flex flex-col gap-3">
          {elsewhere.map((entry) => (
            <LinkRow
              key={entry.title}
              links={entry.links}
              title={entry.title}
            />
          ))}
        </div>
      </Section>

      <Divider />

      <Section title={sectionTitles.interests}>
        <div className="flex flex-col gap-3">
          {interests.map((interest, index) => (
            <div key={interest.id} className="flex items-baseline gap-3">
              <span
                className={`w-5 shrink-0 tabular-nums ${monoMetaClassName}`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <BodyText>{interest.content}</BodyText>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      <Section title={sectionTitles.connect}>
        <div className="flex flex-col items-start gap-3">
          {connectLinks.map((link) => (
            <Link
              key={link.href}
              className="flex items-center gap-2 text-[15px] text-muted"
              href={link.href}
              variant="quiet"
            >
              <link.icon />
              {link.label}
            </Link>
          ))}
        </div>
      </Section>
    </main>
  );
}
