import Image from "next/image";
import { notFound } from "next/navigation";

import Price from "@/components/Price";
import {
  supabase,
  missingSupabaseEnvVars,
} from "@/lib/supabaseClient";

type Garage = {
  id: string;
  title: string;
  slug: string;
};

type Item = {
  id: string;
  title: string;
  description: string | null;
  price_cents: number | null;
  photo_url: string | null;
  status: string;
};

export default async function GaragePage({
  params,
}: {
  params: { slug: string };
}) {
  if (!supabase) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 p-8">
        <header className="space-y-2 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Garage unavailable
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Configure Supabase to load garage details.
          </p>
        </header>

        <section className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-6 text-left dark:border-amber-400/50 dark:bg-amber-950/40">
          <h2 className="text-2xl font-semibold">Missing environment variables</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900 dark:text-amber-100">
            {missingSupabaseEnvVars.map((name) => (
              <li key={name}>
                <code>{name}</code>
              </li>
            ))}
          </ul>
          <p className="text-sm text-amber-900 dark:text-amber-200">
            Add these variables in Vercel or your local <code>.env.local</code> file,
            then redeploy to view garage <code>{params.slug}</code>.
          </p>
        </section>
      </main>
    );
  }

  const { slug } = params;

  const { data: garageData, error: garageError } = await supabase
    .from("garages")
    .select("id, title, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (garageError) {
    console.error("Failed to load garage", garageError);
    throw garageError;
  }

  const garage = (garageData ?? null) as Garage | null;

  if (!garage) {
    notFound();
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from("items")
    .select("id,title,price_cents,photo_url,description,status,created_at")
    .eq("garage_id", garage.id)
    .order("created_at", { ascending: false });

  if (itemsError) {
    console.error("Failed to load items", itemsError);
    throw itemsError;
  }

  const items = (itemsData ?? []) as Item[];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 p-8">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {garage.title}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Browse the items available in this garage sale.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Items</h2>
        {items.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 shadow-sm transition hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500"
              >
                {item.photo_url ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={item.photo_url}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    No photo available
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <Price priceCents={item.price_cents} className="text-base font-medium" />
                  <button className="mt-auto inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                    I&apos;m interested
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No items listed yet. Check back soon!
          </p>
        )}
      </section>
    </main>
  );
}
