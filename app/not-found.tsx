import { Link } from "./primitives";

const NotFound = () => (
  <main className="mx-auto flex min-h-dvh w-full max-w-160 flex-col items-start justify-center gap-3 px-6">
    <h1 className="text-2xl sm:text-3xl">404</h1>
    <p className="text-muted-foreground text-[15px] leading-relaxed">
      This page does not exist.{" "}
      <Link className="text-foreground" href="/">
        home
      </Link>
    </p>
  </main>
);

export default NotFound;
