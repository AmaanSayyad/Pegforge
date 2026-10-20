"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadActivity,
  pushActivity,
  type ActivityItem,
  type ActivityKind,
} from "@/lib/activity";

export function useActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  const refresh = useCallback(() => {
    setItems(loadActivity());
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "pegforge.activity.v1") refresh();
    };
    const onCustom = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("pegforge:activity", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pegforge:activity", onCustom);
    };
  }, [refresh]);

  const log = useCallback(
    (entry: {
      kind: ActivityKind;
      title: string;
      detail?: string;
      hash?: string;
      chainId?: number;
      assetId?: string;
      amount?: string;
    }) => {
      const item = pushActivity(entry);
      refresh();
      return item;
    },
    [refresh],
  );

  const clear = useCallback(() => {
    localStorage.removeItem("pegforge.activity.v1");
    refresh();
  }, [refresh]);

  return { items, log, clear, refresh };
}
