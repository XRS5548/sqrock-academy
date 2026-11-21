"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRightIcon, CheckCircleIcon, LockKeyIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { enrollInCourse } from "@/lib/actions";
import { site } from "@/lib/site";

export function EnrollButton({
  courseId,
  slug,
  enrolled,
  isFree,
  price,
  isLoggedIn,
}: {
  courseId: string;
  slug: string;
  enrolled: boolean;
  isFree: boolean;
  price: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [paymentNote, setPaymentNote] = useState(false);

  if (enrolled) {
    return (
      <Button
        size="lg"
        className="h-11 w-full rounded-lg text-sm"
        render={<a href={`/dashboard/courses/${slug}`} />}
      >
        Continue learning
        <ArrowRightIcon data-icon="inline-end" weight="bold" />
      </Button>
    );
  }

  const onEnroll = () => {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/courses/${slug}`)}`);
      return;
    }
    startTransition(async () => {
      const result = await enrollInCourse(courseId);
      if (result.ok) {
        toast.success("You're enrolled — opening your course.");
        router.push(`/dashboard/courses/${slug}`);
      } else if (result.requiresPayment) {
        setPaymentNote(true);
        toast.info("Payments are being set up — email us to purchase.");
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        className="h-11 w-full rounded-lg text-sm"
        onClick={onEnroll}
        disabled={pending}
      >
        {pending
          ? "Enrolling…"
          : isFree || price === 0
            ? "Enrol for free"
            : `Enrol for ₹${price.toLocaleString("en-IN")}`}
        {!pending && <ArrowRightIcon data-icon="inline-end" weight="bold" />}
      </Button>
      {paymentNote ? (
        <a
          href={`mailto:${site.email}?subject=${encodeURIComponent(
            "Course purchase",
          )}`}
          className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-[11px] leading-5 text-muted-foreground"
        >
          <LockKeyIcon size={14} className="mt-0.5 shrink-0 text-primary" />
          <span>
            Online checkout is being set up. Email{" "}
            <span className="font-medium text-foreground">{site.email}</span> and
            our team will send you a payment link and manual access.
          </span>
        </a>
      ) : (
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <CheckCircleIcon size={13} className="text-emerald-600" />
          Lifetime access · Certificate included
        </p>
      )}
    </div>
  );
}
