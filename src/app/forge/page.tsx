import { AppShell } from "@/components/app-shell";
import { ForgePanel } from "@/components/forge-panel";

export default function ForgePage() {
  return (
    <AppShell
      title="Desk"
      description="Bridge RWA → wrap on Mezo → borrow MUSD"
    >
      <ForgePanel />
    </AppShell>
  );
}
