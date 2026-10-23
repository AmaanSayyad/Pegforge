import { AppShell } from "@/components/app-shell";
import { PoolsPanel } from "@/components/pools-panel";

export default function PoolsPage() {
  return (
    <AppShell
      title="Pools"
      description="Pegforge MUSD credit pool and Mezo AMM liquidity"
    >
      <PoolsPanel />
    </AppShell>
  );
}
