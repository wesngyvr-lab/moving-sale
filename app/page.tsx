import Link from "next/link";

import { supabase } from "@/lib/supabaseClient";

type Garage = {
  slug: string;
  title: string;
};

export default async function Home() {
  const { data: garages, error } = await supabase
    .from("garages")
    .select("slug,title")
    .order("title", { ascending: true });

  if (error) {
    console.error("Failed to load garages", error);
    throw error;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 p-8">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Explore Garages
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Browse each garage to discover available items and claim the ones you
          like.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Garages</h2>
        {garages && garages.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {garages.map((garage: Garage) => (
              <li key={garage.slug}>
                <Link
                  href={`/g/${garage.slug}`}
                  className="block rounded-lg border border-slate-200 p-4 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-500 dark:hover:bg-slate-800"
                >
                  <h3 className="text-lg font-medium">{garage.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    View items available in this garage sale.
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No garages available yet. Check back soon!
          </p>
        )}
      </section>
    </main>
  );
}
