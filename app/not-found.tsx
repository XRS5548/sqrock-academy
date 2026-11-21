import Link from "next/link";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <Logo />
      <p className="mt-10 font-heading text-7xl font-semibold tracking-tight text-primary/20">
        404
      </p>
      <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
        This page went off-syllabus
      </h1>
      <p className="mt-2 max-w-md text-xs leading-6 text-muted-foreground">
        The page you are looking for does not exist, or the link may have changed.
        Try the course catalogue or head back home.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button
          size="lg"
          className="h-9 rounded-lg px-4 text-xs"
          render={<Link href="/courses" />}
        >
          <MagnifyingGlassIcon data-icon="inline-start" />
          Browse courses
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-9 rounded-lg px-4 text-xs"
          render={<Link href="/" />}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back home
        </Button>
      </div>
    </div>
  );
}
