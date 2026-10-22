import { AppShell } from "@/components/app-shell";
import { ActivityPanel } from "@/components/activity-panel";

export default function ActivityPage() {
  return (
    <AppShell
      title="Activity"
      description="Confirmed Desk & Transact steps from this browser"
    >
      <ActivityPanel />
    </AppShell>
  );
}
