"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { centsToPriceInput } from "@/lib/price";

type Item = {
  id: string;
  title: string;
  price_cents: number | null;
  description: string | null;
  photo_url: string | null;
  status: string;
};

type Props = {
  item: Item;
};

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
];

export default function ItemOwnerControls({ item }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [price, setPrice] = useState(centsToPriceInput(item.price_cents));
  const [description, setDescription] = useState(item.description ?? "");
  const [photoUrl, setPhotoUrl] = useState(item.photo_url ?? "");
  const [status, setStatus] = useState(item.status);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setTitle(item.title);
    setPrice(centsToPriceInput(item.price_cents));
    setDescription(item.description ?? "");
    setPhotoUrl(item.photo_url ?? "");
    setStatus(item.status);
    setMessage(null);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price,
          description,
          photoUrl,
          status,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: "Failed to update item." }));
        setMessage(error ?? "Failed to update item.");
        return;
      }

      setIsEditing(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this item?")) {
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: "Failed to delete item." }));
        setMessage(error ?? "Failed to delete item.");
        return;
      }
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/60">
      {!isEditing ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-medium text-slate-700 dark:text-slate-200">Owner controls</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                reset();
              }}
              className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Edit item
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/60 dark:text-red-300 dark:hover:bg-red-900/40"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Edit item</p>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            Title
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            Price (USD)
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            Photo URL
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            Description
            <textarea
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            Status
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {message && <p className="text-xs text-red-500">{message}</p>}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      )}
    </div>
  );
}
