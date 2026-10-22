import { AppShell } from "@/components/app-shell";
import { TransactPanel } from "@/components/transact-panel";

export default function TransactPage() {
  return (
    <AppShell
      title="Transact"
      description="Deposit, withdraw, send, and receive on Mezo"
    >
      <TransactPanel />
    </AppShell>
  );
}
