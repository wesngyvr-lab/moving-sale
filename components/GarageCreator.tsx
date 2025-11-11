"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

export default function GarageCreator() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const derivedSlug = useMemo(() => slugify(title), [title]);

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      if (!slugEdited) {
        setSlug(slugify(value));
      }
    },
    [slugEdited],
  );

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const payload = {
        title: title.trim(),
        slug: (slug || derivedSlug).trim(),
        ownerEmail: ownerEmail.trim(),
      };

      if (!payload.title || !payload.slug || !payload.ownerEmail) {
        setError("All fields are required.");
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch("/api/garages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const { error: message } = await response.json().catch(() => ({ error: "Failed to create garage." }));
          setError(message ?? "Failed to create garage.");
          return;
        }

        const data = (await response.json()) as { slug: string };
        router.push(`/g/${data.slug}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [derivedSlug, ownerEmail, router, slug, title],
  );

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-2xl border border-slate-200 p-6 shadow-sm dark:border-slate-800"
    >
      <div>
        <h2 className="text-2xl font-semibold">Create a Garage</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Set up a new garage sale in seconds. Share the link with friends immediately.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
          Garage title
          <input
            type="text"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 shadow-sm transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-violet-400"
            placeholder="Wes's Moving Sale"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
          URL slug
          <input
            type="text"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 shadow-sm transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-violet-400"
            placeholder={derivedSlug || "wes-moving-sale"}
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugEdited(true);
            }}
          />
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
            This becomes your link: <code>/g/{slug || derivedSlug || "my-garage"}</code>
          </span>
        </label>

        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
          Owner email
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 shadow-sm transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-violet-400"
            placeholder="you@example.com"
            value={ownerEmail}
            onChange={(event) => setOwnerEmail(event.target.value)}
            required
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Creating..." : "Create garage"}
      </button>
    </form>
  );
}
