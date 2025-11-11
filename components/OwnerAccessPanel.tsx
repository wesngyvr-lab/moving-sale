"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  isAdmin: boolean;
};

export default function OwnerAccessPanel({ isAdmin }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!password.trim()) {
      setMessage("Password required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: "Failed to unlock owner mode." }));
        setMessage(error ?? "Failed to unlock owner mode.");
        return;
      }

      setPassword("");
      setMessage(null);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAdmin) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900 shadow-sm dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-medium">Owner mode active. You can add or edit items.</p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSubmitting}
            className="rounded-md border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-600 dark:text-emerald-100 dark:hover:bg-emerald-900/60"
          >
            {isSubmitting ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/60 p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <form className="flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={handleLogin}>
        <div className="flex-1">
          <p className="font-semibold text-slate-900 dark:text-white">Owner access</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Enter the owner passcode to manage this garage.</p>
        </div>
        <input
          type="password"
          placeholder="Passcode"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-violet-400"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-70"
        >
          {isSubmitting ? "Unlocking..." : "Unlock owner view"}
        </button>
      </form>
      {message && <p className="mt-2 text-xs text-red-500">{message}</p>}
    </section>
  );
}
