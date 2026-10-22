import { AppShell } from "@/components/app-shell";
import { PortfolioPanel } from "@/components/portfolio-panel";

export default function PortfolioPage() {
  return (
    <AppShell
      title="Portfolio"
      description="Balances, collateral, and MUSD debt on Mezo testnet"
    >
      <PortfolioPanel />
    </AppShell>
  );
}
