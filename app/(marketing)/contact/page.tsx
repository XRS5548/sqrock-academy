import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  ChatCircleDotsIcon,
  ClockIcon,
  EnvelopeSimpleIcon,
  GraduationCapIcon,
  MapPinIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react/ssr";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { faqs, site } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Sqrock Academy for course questions, purchases and support.",
};

const reasons = [
  {
    icon: GraduationCapIcon,
    title: "Course questions",
    body: "Stuck on a lesson or need help choosing a course? Ask the same team that builds them.",
    cta: `mailto:${site.email}?subject=Course question`,
    ctaLabel: "Email the academy",
  },
  {
    icon: BriefcaseIcon,
    title: "Hiring or job posts",
    body: "Posting a role for your company? Send us the details and we will verify and list it free.",
    cta: "/jobs/post",
    ctaLabel: "Post a job",
  },
  {
    icon: ChatCircleDotsIcon,
    title: "Payments & access",
    body: "Need a payment link for a paid course or help with account access? We reply within one working day.",
    cta: `mailto:${site.email}?subject=Course purchase`,
    ctaLabel: "Get a payment link",
  },
];

export default function ContactPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Badge
            variant="outline"
            className="h-6 rounded-full border-border bg-background/80 px-3 text-[10px]"
          >
            <EnvelopeSimpleIcon size={11} className="text-primary" /> We reply
            within one working day
          </Badge>
          <h1 className="mt-4 max-w-2xl font-heading text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Talk to the academy.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            No ticket queues or chatbots. Email us and a real person from the
            course team will help you out.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-11 rounded-lg px-5 text-sm"
              render={<a href={`mailto:${site.email}`} />}
            >
              <EnvelopeSimpleIcon data-icon="inline-start" />
              {site.email}
            </Button>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <MapPinIcon size={13} /> {site.address}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {reasons.map(({ icon: Icon, ...reason }) => (
            <div
              key={reason.title}
              className="flex flex-col rounded-xl border border-border bg-card p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
                <Icon size={20} weight="duotone" />
              </span>
              <h2 className="mt-4 font-heading text-sm font-semibold">
                {reason.title}
              </h2>
              <p className="mt-1.5 flex-1 text-xs leading-6 text-muted-foreground">
                {reason.body}
              </p>
              {reason.cta.startsWith("mailto") ? (
                <a
                  href={reason.cta}
                  className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
                >
                  {reason.ctaLabel} <ArrowRightIcon size={11} />
                </a>
              ) : (
                <Link
                  href={reason.cta}
                  className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
                >
                  {reason.ctaLabel} <ArrowRightIcon size={11} />
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Before you email
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
              Quick answers
            </h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Most questions are answered here. If yours is not, use the email
              button above.
            </p>
            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <ClockIcon size={16} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold">Support hours</p>
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    Monday–Saturday, 10am–7pm IST. Emails outside these hours are
                    answered the next working day.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <PaperPlaneTiltIcon size={16} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold">Include these details</p>
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    Your registered email, course name and a screenshot if
                    reporting a problem. It helps us resolve faster.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Accordion className="self-start rounded-xl border-border bg-card">
            {faqs.slice(0, 6).map((faq, index) => (
              <AccordionItem key={faq.q} value={`contact-faq-${index}`}>
                <AccordionTrigger className="p-4 text-[13px]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-xs leading-6 text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
