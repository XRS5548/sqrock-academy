import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { getCurrentUser } from "@/lib/session";

export async function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div id="top" className="flex min-h-screen flex-col bg-background">
      <SiteHeader
        user={
          user
            ? { name: user.name, email: user.email, role: user.role }
            : null
        }
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
