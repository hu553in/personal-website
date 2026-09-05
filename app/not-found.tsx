import { BodyText, Link, Page, PageTitle } from "./primitives";

const NotFound = () => (
  <Page className="min-h-dvh items-start justify-center gap-3 py-0 sm:py-0">
    <PageTitle>404</PageTitle>
    <BodyText>
      This page does not exist.{" "}
      <Link className="text-foreground" href="/">
        home
      </Link>
    </BodyText>
  </Page>
);

export default NotFound;
