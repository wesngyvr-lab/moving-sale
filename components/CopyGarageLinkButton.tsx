"use client";

import { useCallback, useState } from "react";

type Props = {
  slug: string;
};

export default function CopyGarageLinkButton({ slug }: Props) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = useCallback(async () => {
    setError(null);
    try {
      const origin = window.location.origin;
      const link = `${origin}/g/${slug}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy garage link", err);
      setError("Cannot copy link. Try manually.");
    }
  }, [slug]);

  return (
    <div className="flex flex-col items-start gap-1 text-left">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-400 hover:text-violet-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-violet-400"
      >
        {copied ? "Link copied!" : "Copy garage URL"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
