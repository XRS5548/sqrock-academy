import Link from "next/link";
import {
  ArrowUpRightIcon,
  EnvelopeSimpleIcon,
  LinkedinLogoIcon,
  InstagramLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react/ssr";
import { Logo } from "@/components/site/logo";
import { site } from "@/lib/demo-data";

const columns = [
  {
    title: "Learn",
    links: [
      { href: "/courses", label: "All courses" },
      { href: "/courses?category=Development", label: "Development" },
      { href: "/courses?category=Data%20%26%20AI", label: "Data & AI" },
      { href: "/courses?category=Cloud%20%26%20DevOps", label: "Cloud & DevOps" },
      { href: "/courses?free=1", label: "Free courses" },
    ],
  },
  {
    title: "Career",
    links: [
      { href: "/jobs", label: "Jobs & internships" },
      { href: "/jobs?type=internship", label: "Internships" },
      { href: "/jobs/post", label: "Post a job" },
      { href: "/dashboard/certificates", label: "Certificates" },
    ],
  },
  {
    title: "Academy",
    links: [
      { href: "/#why", label: "Why Sqrock" },
      { href: "/#faq", label: "FAQ" },
      { href: "/contact", label: "Contact us" },
      { href: "/signup", label: "Create account" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/40 print:hidden">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Industry-focused courses, real projects and a jobs board — built by
              practitioners for people who want to get hired.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
            >
              <EnvelopeSimpleIcon size={16} />
              {site.email}
            </a>
            <div className="mt-5 flex items-center gap-2">
              {[
                { icon: LinkedinLogoIcon, label: "LinkedIn" },
                { icon: InstagramLogoIcon, label: "Instagram" },
                { icon: YoutubeLogoIcon, label: "YouTube" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Sqrock Academy. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/contact" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Terms
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Mobile app · {site.appLaunch}
            </span>
            <a
              href="#top"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              Back to top <ArrowUpRightIcon size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
