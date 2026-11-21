import { HomePage } from "@/components/pages/home-page";
import { MarketingShell } from "@/components/site/marketing-shell";

export default function Page() {
  return (
    <MarketingShell>
      <HomePage />
    </MarketingShell>
  );
}
