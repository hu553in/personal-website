import { Link } from "./primitives";

const NotFound = () => (
  <main className="mx-auto flex min-h-dvh w-full max-w-160 flex-col items-start justify-center gap-3 px-6">
    <h1 className="text-2xl sm:text-3xl">404</h1>
    <p className="text-[15px] leading-relaxed text-muted">
      This page does not exist.{" "}
      <Link className="text-(--ink)" href="/">
        home
      </Link>
    </p>
  </main>
);

export default NotFound;
