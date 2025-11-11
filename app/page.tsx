import Link from "next/link";

import GarageCreator from "@/components/GarageCreator";
import { supabaseServer } from "@/lib/supabaseServer";

type Garage = {
  slug: string;
  title: string;
};

export default async function Home() {
  const supabase = supabaseServer();
  const { data: garages, error } = await supabase
    .from("garages")
    .select("slug,title")
    .order("title", { ascending: true });

  if (error) {
    console.error("Failed to load garages", error);
    throw error;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-10">
      <header className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-500">
          Garage HQ
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Spin up a garage sale and share it with friends
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Create a garage, drop in your items, and let friends tap &ldquo;I&apos;m interested&rdquo; in real time.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        <GarageCreator />
        <section className="space-y-4 rounded-2xl border border-slate-200 p-6 shadow-sm dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Your garages</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Launch a new one anytime or jump back into an existing sale.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {garages?.length ?? 0} live
            </span>
          </div>

          {garages && garages.length > 0 ? (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {garages.map((garage: Garage) => (
                <li key={garage.slug} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/g/${garage.slug}`}
                    className="flex flex-col rounded-lg p-3 transition hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <span className="text-lg font-medium">{garage.title}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">/g/{garage.slug}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
              You haven&apos;t created any garages yet. Use the form to launch your first sale.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
