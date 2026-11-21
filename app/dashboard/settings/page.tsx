import {
  BellIcon,
  DeviceMobileIcon,
  EnvelopeSimpleIcon,
  LockKeyIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { site } from "@/lib/demo-data";
import { requireUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await requireUser("/dashboard/settings");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage your profile and account preferences.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="font-heading text-sm font-semibold">Profile</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            This information appears on your dashboard.
          </p>
          <div className="mt-5">
            <ProfileForm
              name={user.name}
              email={user.email}
              headline={user.headline ?? ""}
            />
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-heading text-sm font-semibold">
                <ShieldCheckIcon size={16} className="text-primary" />
                Account security
              </h2>
              <Badge
                variant="outline"
                className="h-5 rounded-full px-2 text-[9px] text-emerald-700"
              >
                Protected
              </Badge>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <LockKeyIcon size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-[11px] font-medium">Password login</p>
                  <p className="text-[10px] leading-4 text-muted-foreground">
                    Your account is secured with Better Auth.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <EnvelopeSimpleIcon
                  size={14}
                  className="mt-0.5 shrink-0 text-muted-foreground"
                />
                <div>
                  <p className="text-[11px] font-medium">Email verification</p>
                  <p className="text-[10px] leading-4 text-muted-foreground">
                    Need a password reset? Email {site.email}.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-background p-5">
            <h2 className="flex items-center gap-2 font-heading text-sm font-semibold">
              <BellIcon size={16} className="text-muted-foreground" />
              Notifications
            </h2>
            <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
              Course updates, exam reminders and new job alerts are sent to{" "}
              <span className="font-medium text-foreground">{user.email}</span>.
            </p>
          </section>

          <section className="rounded-xl border border-primary/15 bg-primary/[0.04] p-5">
            <h2 className="flex items-center gap-2 font-heading text-sm font-semibold">
              <DeviceMobileIcon size={16} className="text-primary" />
              Mobile app
            </h2>
            <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
              The Sqrock Academy app launches on {site.appLaunch}. Same courses,
              progress and certificates — on the go.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
