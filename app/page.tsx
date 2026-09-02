import { cn } from "@/lib/utils";

import {
  about,
  connectLinks,
  interests,
  projects,
  resume,
  skills,
  volunteer,
  work,
  writing,
} from "./data";
import {
  BodyText,
  Divider,
  Link,
  MetaLine,
  monoMetaClassName,
  Section,
} from "./primitives";
import { identity } from "./site-data";

const Home = () => (
  <main className="mx-auto flex w-full max-w-160 flex-col px-6 py-24 sm:py-32">
    <header className="flex flex-col gap-3 pb-10">
      <h1 className="text-2xl sm:text-3xl">{identity.name}</h1>
      <p className="text-muted-foreground flex items-baseline gap-2 text-[15px] leading-snug font-medium">
        <span className="text-foreground">{identity.handle}</span>
        <span aria-hidden="true">·</span>
        <span className="min-w-0">{identity.role}</span>
      </p>
    </header>

    <Divider />

    <Section title="About">
      <div className="flex flex-col gap-3">
        {about.map((paragraph) => (
          <BodyText key={paragraph}>{paragraph}</BodyText>
        ))}
      </div>
    </Section>

    <Divider />

    <Section title="Work">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[15px] font-medium">{resume.title}</span>
          <Link
            className={monoMetaClassName}
            href={resume.href}
            target="_blank"
            variant="quiet"
          >
            {resume.label}
          </Link>
        </div>
        {work.map((entry) => (
          <div key={entry.title} className="flex flex-col gap-1.5">
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2 sm:gap-y-1">
              <span className="text-[15px] font-medium">{entry.title}</span>
              <span className="flex items-baseline gap-2 whitespace-nowrap">
                <span className={monoMetaClassName}>{entry.role}</span>
                <span
                  aria-hidden="true"
                  className={cn("hidden sm:inline", monoMetaClassName)}
                >
                  ·
                </span>
              </span>
              <MetaLine items={[{ label: entry.period }, entry.site]} />
            </div>
            <BodyText>{entry.description}</BodyText>
          </div>
        ))}
      </div>
    </Section>

    <Divider />

    <Section title="Volunteer">
      <div className="flex flex-col gap-4">
        {volunteer.map((entry) => (
          <div key={entry.title} className="flex flex-col gap-1.5">
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2 sm:gap-y-1">
              <span className="text-[15px] font-medium">{entry.title}</span>
              <span className="flex items-baseline gap-2 whitespace-nowrap">
                <span className={monoMetaClassName}>{entry.role}</span>
                <span
                  aria-hidden="true"
                  className={cn("hidden sm:inline", monoMetaClassName)}
                >
                  ·
                </span>
              </span>
              <MetaLine items={[{ label: entry.period }]} />
            </div>
            <div className="flex flex-col gap-1.5">
              {entry.description.map((paragraph) => (
                <BodyText key={paragraph}>{paragraph}</BodyText>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>

    <Divider />

    <Section title="Skills">
      <div className="grid grid-cols-[max-content_minmax(0,1fr)] items-baseline gap-x-3 gap-y-3">
        {skills.map((group) => (
          <div key={group.label} className="contents">
            <span className={monoMetaClassName}>{group.label}</span>
            <div className="flex min-w-0 flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="text-muted-foreground inline-block rounded border border-black/10 px-2.5 py-1 font-mono text-[13px] leading-snug font-medium dark:border-white/10"
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

    <Section title="Projects">
      <div className="flex flex-col gap-4">
        {projects.map((project) => (
          <div key={project.name} className="flex flex-col gap-1.5">
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2 sm:gap-y-1">
              <span className="text-[15px] font-medium">{project.name}</span>
              <MetaLine items={[{ label: project.role }, ...project.links]} />
            </div>
            <div className="flex flex-col gap-1.5">
              {project.description.map((paragraph) => (
                <BodyText key={paragraph}>{paragraph}</BodyText>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>

    <Divider />

    <Section title="Writing & speaking">
      <div className="flex flex-col gap-4">
        {writing.map((entry) => (
          <div key={entry.title} className="flex flex-col gap-1.5">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[15px] font-medium">{entry.title}</span>
              <MetaLine items={entry.details} />
            </div>
            <BodyText>{entry.description}</BodyText>
          </div>
        ))}
      </div>
    </Section>

    <Divider />

    <Section title="Interests">
      <div className="flex flex-col gap-3">
        {interests.map((interest, index) => (
          <div key={interest.id} className="flex items-baseline gap-3">
            <span
              className={cn("w-5 shrink-0 tabular-nums", monoMetaClassName)}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <BodyText>{interest.content}</BodyText>
          </div>
        ))}
      </div>
    </Section>

    <Divider />

    <Section title="Connect">
      <div className="flex flex-col items-start gap-3">
        {connectLinks.map((link) => (
          <Link
            key={link.href}
            className="text-muted-foreground flex items-center gap-2 text-[15px]"
            href={link.href}
            variant="quiet"
          >
            <link.icon aria-hidden="true" className="size-4 shrink-0" />
            {link.label}
          </Link>
        ))}
      </div>
    </Section>
  </main>
);

export default Home;
