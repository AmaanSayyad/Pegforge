import { AppShell } from "@/components/app-shell";
import { PositionsPanel } from "@/components/positions-panel";

export default function PositionsPage() {
  return (
    <AppShell
      title="Positions"
      description="RWA collateral loans - repay debt or withdraw"
    >
      <PositionsPanel />
    </AppShell>
  );
}
