"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  garageId: string;
};

export default function ListItemForm({ garageId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setPrice("");
    setDescription("");
    setPhotoUrl("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!title.trim()) {
      setMessage("Title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garageId,
          title,
          price,
          description,
          photoUrl,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: "Failed to list item." }));
        setMessage(error ?? "Failed to list item.");
        return;
      }

      setMessage("Item listed! It will appear below.");
      resetForm();
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">List a new item</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Drop in a title, optional price, description, and photo URL.
          </p>
        </div>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Title
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-violet-400"
              placeholder="Mid-century bookshelf"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Price (USD)
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-violet-400"
              placeholder="Leave blank for FREE"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>
        </div>
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Photo URL
          <input
            type="url"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-violet-400"
            placeholder="https://images.example.com/item.jpg"
            value={photoUrl}
            onChange={(event) => setPhotoUrl(event.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Description
          <textarea
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-violet-400"
            placeholder="Add measurements, condition, pickup instructions..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        {message && (
          <p className={`text-sm ${message.startsWith("Item") ? "text-green-600" : "text-red-500"}`}>{message}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Listing..." : "List item"}
        </button>
      </form>
    </section>
  );
}
