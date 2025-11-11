"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  garageId: string;
  itemId: string;
  itemTitle: string;
};

type Participant = {
  id: string;
  name: string;
};

export default function InterestDialog({ garageId, itemId, itemTitle }: Props) {
  const router = useRouter();
  const storageKey = useMemo(() => `garage-participant:${garageId}`, [garageId]);

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Participant;
        if (parsed?.id) {
          setParticipant(parsed);
          setName(parsed.name);
        }
      } catch {
        // ignore
      }
    }
  }, [storageKey]);

  const ensureParticipant = async () => {
    if (participant) return participant;

    const response = await fetch("/api/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        garageId,
        name,
        email: contact.includes("@") ? contact : undefined,
        phone: contact.includes("@") ? undefined : contact,
      }),
    });

    if (!response.ok) {
      const { error } = await response.json().catch(() => ({ error: "Failed to save participant." }));
      throw new Error(error ?? "Failed to save participant.");
    }

    const data = (await response.json()) as Participant;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(data));
    }
    setParticipant(data);
    return data;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!name.trim()) {
      setFeedback("Please enter your name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const participantRecord = await ensureParticipant();
      const response = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          participantId: participantRecord.id,
          participantName: participantRecord.name ?? name.trim(),
          message,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: "Failed to submit interest." }));
        setFeedback(error ?? "Failed to submit interest.");
        return;
      }

      setFeedback("Thanks! We'll let the seller know.");
      setMessage("");
      setOpen(false);
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="mt-auto inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        onClick={() => {
          setFeedback(null);
          setOpen(true);
        }}
      >
        I&apos;m interested
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
          >
            <div className="mb-4">
              <p className="text-sm font-semibold text-violet-600">Interested in</p>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{itemTitle}</h3>
            </div>

            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
              Name
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <label className="mt-3 block text-sm font-medium text-slate-900 dark:text-slate-100">
              Email or phone (optional)
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="you@example.com or 555-123-4567"
                value={contact}
                onChange={(event) => setContact(event.target.value)}
              />
            </label>

            <label className="mt-3 block text-sm font-medium text-slate-900 dark:text-slate-100">
              Message (optional)
              <textarea
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="Leave pickup timing, questions, etc."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </label>

            {feedback && <p className="mt-3 text-sm text-red-500">{feedback}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send interest"}
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
