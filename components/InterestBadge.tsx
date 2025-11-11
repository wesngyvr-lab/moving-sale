"use client";

import { useEffect, useState } from "react";

import supabase from "@/lib/supabaseClient";

type Props = {
  itemId: string;
  initialCount: number;
};

export default function InterestBadge({ itemId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const channel = supabase
      .channel(`interests:${itemId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "interests", filter: `item_id=eq.${itemId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCount((value) => value + 1);
          } else if (payload.eventType === "DELETE") {
            setCount((value) => Math.max(0, value - 1));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId]);

  const label = count === 0 ? "No interest yet" : `${count} interested`;

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
      {label}
    </span>
  );
}
