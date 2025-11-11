import { NextResponse } from "next/server";

import { priceInputToCents } from "@/lib/price";
import { supabaseServer } from "@/lib/supabaseServer";

type ItemPayload = {
  garageId?: string;
  title?: string;
  price?: string | number | null;
  description?: string | null;
  photoUrl?: string | null;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ItemPayload;
  const garageId = payload.garageId?.trim();
  const title = payload.title?.trim();
  const description = payload.description?.trim() || null;
  const photoUrl = payload.photoUrl?.trim() || null;

  if (!garageId) {
    return NextResponse.json({ error: "garageId is required." }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const priceCents = priceInputToCents(payload.price);
  if (Number.isNaN(priceCents)) {
    return NextResponse.json({ error: "Price must be a number." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("items")
    .insert({
      garage_id: garageId,
      title,
      price_cents: priceCents,
      description,
      photo_url: photoUrl,
      status: "available",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create item", error);
    return NextResponse.json({ error: error.message ?? "Failed to create item." }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
