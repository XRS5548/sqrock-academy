"use client";

import { useState, useTransition } from "react";
import { CheckCircleIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { submitJob } from "@/lib/actions";

const fieldClass = "h-10 rounded-lg bg-background text-xs";

export function JobPostForm() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [description, setDescription] = useState("");

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-border bg-card px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700">
          <CheckCircleIcon size={26} weight="fill" />
        </span>
        <h2 className="mt-4 font-heading text-xl font-semibold">
          Job submitted for review
        </h2>
        <p className="mt-2 max-w-md text-xs leading-6 text-muted-foreground">
          Thanks! Our team verifies every company before publishing. You&apos;ll
          typically see the role live within 24 hours. We&apos;ll email you at the
          contact address you provided if we need anything.
        </p>
        <Button
          variant="outline"
          size="lg"
          className="mt-5 h-9 rounded-lg text-xs"
          onClick={() => {
            setDescription("");
            setDone(false);
          }}
        >
          Submit another role
        </Button>
      </div>
    );
  }

  return (
    <form
      className="rounded-xl border border-border bg-card p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const plainDescription = description
          .replace(/<[^>]*>/g, " ")
          .replace(/&nbsp;/g, " ")
          .trim();
        if (!plainDescription) {
          toast.error("Please add a role description.");
          return;
        }
        const form = event.currentTarget;
        const formData = new FormData(form);
        startTransition(async () => {
          const result = await submitJob(formData);
          if (result.ok) {
            toast.success("Job submitted for approval.");
            setDescription("");
            setDone(true);
          } else {
            toast.error(result.error ?? "Could not submit.");
          }
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title" className="text-xs">
            Role title *
          </Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="e.g. Junior Python Developer"
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
        <div>
          <Label htmlFor="company" className="text-xs">
            Company name *
          </Label>
          <Input
            id="company"
            name="company"
            required
            placeholder="e.g. Nimbus Labs"
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
        <div>
          <Label htmlFor="companyWebsite" className="text-xs">
            Company website
          </Label>
          <Input
            id="companyWebsite"
            name="companyWebsite"
            type="url"
            placeholder="https://company.com"
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
        <div>
          <Label htmlFor="type" className="text-xs">
            Type
          </Label>
          <select
            id="type"
            name="type"
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <option value="job">Full-time job</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        <div>
          <Label htmlFor="category" className="text-xs">
            Category
          </Label>
          <select
            id="category"
            name="category"
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {[
              "Engineering",
              "Data",
              "Cloud",
              "Game Development",
              "Marketing",
              "Business",
              "Design",
            ].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="location" className="text-xs">
            Location
          </Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g. Bengaluru, India"
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
        <div>
          <Label htmlFor="workMode" className="text-xs">
            Work mode
          </Label>
          <select
            id="workMode"
            name="workMode"
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <option>Remote</option>
            <option>Hybrid</option>
            <option>On-site</option>
          </select>
        </div>
        <div>
          <Label htmlFor="experience" className="text-xs">
            Experience
          </Label>
          <Input
            id="experience"
            name="experience"
            placeholder="e.g. Fresher or 1–3 years"
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
        <div>
          <Label htmlFor="salary" className="text-xs">
            Salary / stipend
          </Label>
          <Input
            id="salary"
            name="salary"
            placeholder="e.g. ₹6–9 LPA"
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
        <div>
          <Label htmlFor="applyUrl" className="text-xs">
            Application URL
          </Label>
          <Input
            id="applyUrl"
            name="applyUrl"
            type="url"
            placeholder="https://company.com/careers"
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
        <div>
          <Label htmlFor="applyEmail" className="text-xs">
            Application email
          </Label>
          <Input
            id="applyEmail"
            name="applyEmail"
            type="email"
            placeholder="careers@company.com"
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
        <div>
          <Label htmlFor="contactEmail" className="text-xs">
            Your contact email *
          </Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            required
            placeholder="you@company.com"
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description" className="text-xs">
            Role description *
          </Label>
          <input
            type="hidden"
            id="description"
            name="description"
            value={description}
          />
          <div className="mt-1.5">
            <RichTextEditor
              value={description}
              onChange={setDescription}
              minHeight="13rem"
              placeholder="Describe the role, responsibilities, requirements and how to apply."
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-[10px] leading-4 text-muted-foreground">
          By submitting you confirm the company is real and the role is active.
          Posts go live only after admin verification.
        </p>
        <Button
          type="submit"
          size="lg"
          className="h-10 shrink-0 rounded-lg px-5 text-xs"
          disabled={pending}
        >
          {pending ? "Submitting…" : "Submit for review"}
          <PaperPlaneTiltIcon data-icon="inline-end" />
        </Button>
      </div>
    </form>
  );
}
