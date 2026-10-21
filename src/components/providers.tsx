"use client";

import { wagmiAdapter, projectId, networks } from "@/lib/wagmi";
import { SITE } from "@/lib/site";
import { mezoTestnet } from "@/lib/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { useState, type ReactNode } from "react";
import { WagmiProvider, type Config } from "wagmi";

const metadata = {
  name: SITE.domain,
  description: SITE.tagline,
  url: SITE.url,
  icons: [`${SITE.url}/pegforge-mark.png`],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: mezoTestnet,
  metadata,
  features: {
    analytics: true,
  },
  themeMode: "light",
  themeVariables: {
    "--w3m-accent": "#e6005c",
    "--w3m-border-radius-master": "2px",
    "--w3m-font-family": "inherit",
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
