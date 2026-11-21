"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRightIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  createCoursePaymentOrder,
  enrollInCourse,
  verifyCoursePayment,
} from "@/lib/actions";

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  retry?: { enabled: boolean };
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpayHandlerResponse) => void;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let razorpayScript: Promise<void> | null = null;

function loadRazorpay() {
  if (typeof window === "undefined") return Promise.reject();
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScript) return razorpayScript;

  razorpayScript = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      razorpayScript = null;
      reject(new Error("Could not load Razorpay checkout."));
    };
    document.body.appendChild(script);
  });

  return razorpayScript;
}

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
  const [paying, setPaying] = useState(false);

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

  function enrollFree() {
    startTransition(async () => {
      const result = await enrollInCourse(courseId);
      if (result.ok) {
        toast.success("You're enrolled — opening your course.");
        router.push(`/dashboard/courses/${slug}`);
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  async function startPayment() {
    setPaying(true);
    try {
      const order = await createCoursePaymentOrder(courseId);
      if (!order.ok || !order.orderId || !order.keyId) {
        toast.error(order.error ?? "Could not start the payment.");
        setPaying(false);
        return;
      }

      await loadRazorpay();
      if (!window.Razorpay) {
        throw new Error("Razorpay checkout is unavailable.");
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount ?? Math.round(price * 100),
        currency: order.currency ?? "INR",
        order_id: order.orderId,
        name: "Sqrock Academy",
        description: order.courseTitle ?? "Course enrolment",
        prefill: {
          name: order.userName,
          email: order.userEmail,
        },
        theme: { color: "#0f766e" },
        retry: { enabled: true },
        modal: {
          ondismiss: () => setPaying(false),
        },
        handler: (response) => {
          void (async () => {
            const result = await verifyCoursePayment({
              courseId,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            if (result.ok) {
              toast.success("Payment successful — you're enrolled!");
              router.push(`/dashboard/courses/${result.slug ?? slug}`);
              router.refresh();
            } else {
              toast.error(
                result.error ??
                  "Payment verification failed. Please contact support.",
              );
              setPaying(false);
            }
          })();
        },
      });

      checkout.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setPaying(false);
      });
      checkout.open();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not start the payment.",
      );
      setPaying(false);
    }
  }

  const onEnroll = () => {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/courses/${slug}`)}`);
      return;
    }
    if (isFree || price === 0) {
      enrollFree();
      return;
    }
    void startPayment();
  };

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        className="h-11 w-full rounded-lg text-sm"
        onClick={onEnroll}
        disabled={pending || paying}
      >
        {pending || paying
          ? paying
            ? "Opening checkout…"
            : "Enrolling…"
          : isFree || price === 0
            ? "Enrol for free"
            : `Enrol for ₹${price.toLocaleString("en-IN")}`}
        {!pending && !paying && (
          <ArrowRightIcon data-icon="inline-end" weight="bold" />
        )}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <CheckCircleIcon size={13} className="text-emerald-600" />
        Lifetime access · Certificate included
      </p>
    </div>
  );
}
