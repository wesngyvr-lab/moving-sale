import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import CopyGarageLinkButton from "@/components/CopyGarageLinkButton";
import InterestBadge from "@/components/InterestBadge";
import ItemOwnerControls from "@/components/ItemOwnerControls";
import InterestDialog from "@/components/InterestDialog";
import ListItemForm from "@/components/ListItemForm";
import OwnerAccessPanel from "@/components/OwnerAccessPanel";
import Price from "@/components/Price";
import { supabaseServer } from "@/lib/supabaseServer";

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
  interest_count: number;
};

export default async function GaragePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const supabase = supabaseServer();

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
  const cookieStore = cookies();
  const isAdmin = cookieStore.get("garage_admin")?.value === garage.id;

  const { data: itemsData, error: itemsError } = await supabase
    .from("items")
    .select("id,title,price_cents,photo_url,description,status,created_at")
    .eq("garage_id", garage.id)
    .order("created_at", { ascending: false });

  if (itemsError) {
    console.error("Failed to load items", itemsError);
    throw itemsError;
  }

  const itemsRaw = itemsData ?? [];
  const itemIds = itemsRaw.map((item) => item.id);

  let interestCounts: Record<string, number> = {};
  if (itemIds.length > 0) {
    const { data: interestsData, error: interestError } = await supabase
      .from("interests")
      .select("item_id")
      .in("item_id", itemIds);

    if (interestError) {
      console.error("Failed to load interest counts", interestError);
      throw interestError;
    }

    interestCounts = (interestsData ?? []).reduce<Record<string, number>>((acc, row: { item_id: string }) => {
      acc[row.item_id] = (acc[row.item_id] ?? 0) + 1;
      return acc;
    }, {});
  }

  const items = itemsRaw.map((item) => ({
    ...item,
    interest_count: interestCounts[item.id] ?? 0,
  })) as Item[];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 p-8">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        aria-label="Back to garages"
      >
        <span aria-hidden>←</span>
        Back to garages
      </Link>
      <header className="space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {garage.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {isAdmin
              ? "Manage your listings and keep friends updated."
              : "Browse the items available in this garage sale."}
          </p>
        </div>
        {isAdmin && (
          <div className="flex justify-center">
            <CopyGarageLinkButton slug={garage.slug} mode="share" />
          </div>
        )}
      </header>

      <OwnerAccessPanel isAdmin={isAdmin} garageId={garage.id} />

      {isAdmin && <ListItemForm garageId={garage.id} />}

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
                  <div className="flex items-center justify-between gap-3">
                    <Price priceCents={item.price_cents} className="text-base font-medium" />
                    <InterestBadge itemId={item.id} initialCount={item.interest_count} />
                  </div>
                  {isAdmin ? (
                    <ItemOwnerControls
                      item={{
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        price_cents: item.price_cents,
                        photo_url: item.photo_url,
                        status: item.status,
                      }}
                    />
                  ) : (
                    <InterestDialog garageId={garage.id} itemId={item.id} itemTitle={item.title} />
                  )}
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
