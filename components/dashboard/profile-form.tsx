"use client";

import { useState, useTransition } from "react";
import { CheckIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions";

export function ProfileForm({
  name,
  email,
  headline,
}: {
  name: string;
  email: string;
  headline: string;
}) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await updateProfile(formData);
          if (result.ok) {
            toast.success("Profile updated.");
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          } else {
            toast.error(result.error ?? "Could not update profile.");
          }
        });
      }}
    >
      <div>
        <Label htmlFor="name" className="text-xs">
          Full name
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={name}
          required
          className="mt-1.5 h-10 rounded-lg bg-background text-sm"
        />
      </div>
      <div>
        <Label htmlFor="headline" className="text-xs">
          Headline
        </Label>
        <Input
          id="headline"
          name="headline"
          defaultValue={headline}
          placeholder="e.g. Aspiring backend developer"
          className="mt-1.5 h-10 rounded-lg bg-background text-sm"
        />
        <p className="mt-1 text-[10px] text-muted-foreground">
          Shown on your dashboard and certificates.
        </p>
      </div>
      <div>
        <Label htmlFor="email" className="text-xs">
          Email address
        </Label>
        <Input
          id="email"
          defaultValue={email}
          disabled
          className="mt-1.5 h-10 rounded-lg bg-muted text-sm"
        />
        <p className="mt-1 text-[10px] text-muted-foreground">
          Email changes require verification — contact academy@sqrock.cloud.
        </p>
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-9 rounded-lg px-4 text-xs"
        disabled={pending}
      >
        {saved ? (
          <>
            Saved <CheckIcon data-icon="inline-end" />
          </>
        ) : (
          <>
            {pending ? "Saving…" : "Save changes"}
            <FloppyDiskIcon data-icon="inline-end" />
          </>
        )}
      </Button>
    </form>
  );
}
