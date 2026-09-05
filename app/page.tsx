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
import { PageNavigation } from "./page-navigation";
import {
  BodyText,
  Divider,
  Link,
  MetaLine,
  monoMetaClassName,
  Page,
  PageHeader,
  PageTitle,
  Section,
} from "./primitives";
import { identity, linkedInCoverImage } from "./site-data";

const homeNavigationItems = [
  { id: "about", title: "About" },
  { id: "work", title: "Work" },
  { id: "volunteer", title: "Volunteer" },
  { id: "skills", title: "Skills" },
  { id: "projects", title: "Projects" },
  { id: "writing-and-speaking", title: "Writing & speaking" },
  { id: "interests", title: "Interests" },
  { id: "connect", title: "Connect" },
  { id: "miscellany", title: "Miscellany" },
] as const;

const [
  aboutSection,
  workSection,
  volunteerSection,
  skillsSection,
  projectsSection,
  writingSection,
  interestsSection,
  connectSection,
  miscellanySection,
] = homeNavigationItems;

const Home = () => (
  <Page>
    <PageHeader>
      <PageTitle>{identity.name}</PageTitle>
      <p className="text-muted-foreground text-[15px] leading-snug font-medium">
        <span className="text-foreground">{identity.handle}</span>
        <span aria-hidden="true" className="mx-2">
          ·
        </span>
        {identity.role}
      </p>
    </PageHeader>

    <PageNavigation items={homeNavigationItems} />

    <Divider />

    <Section {...aboutSection}>
      <div className="flex flex-col gap-3">
        {about.map((paragraph) => (
          <BodyText key={paragraph}>{paragraph}</BodyText>
        ))}
      </div>
    </Section>

    <Divider />

    <Section {...workSection}>
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

    <Section {...volunteerSection}>
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

    <Section {...skillsSection}>
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

    <Section {...projectsSection}>
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

    <Section {...writingSection}>
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

    <Section {...interestsSection}>
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

    <Section {...connectSection}>
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

    <Divider />

    <Section {...miscellanySection}>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2 sm:gap-y-1">
          <span className="text-[15px] font-medium">
            {linkedInCoverImage.title}
          </span>
          <MetaLine
            items={[
              { label: linkedInCoverImage.role },
              {
                ariaLabel: `${linkedInCoverImage.title} page`,
                href: linkedInCoverImage.href,
                label: "page",
              },
            ]}
          />
        </div>
        <BodyText>{linkedInCoverImage.description}</BodyText>
      </div>
    </Section>
  </Page>
);

export default Home;
