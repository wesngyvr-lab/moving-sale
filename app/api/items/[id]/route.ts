import { NextResponse } from "next/server";

import { priceInputToCents } from "@/lib/price";
import { supabaseServer } from "@/lib/supabaseServer";

type ItemUpdatePayload = {
  title?: string;
  price?: string | number | null;
  description?: string | null;
  photoUrl?: string | null;
  status?: string;
};

const VALID_STATUSES = new Set(["available", "reserved", "sold"]);

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const updatesBody = (await request.json()) as ItemUpdatePayload;
  const updates: Record<string, unknown> = {};

  if (updatesBody.title !== undefined) {
    const title = updatesBody.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
    }
    updates.title = title;
  }

  if (updatesBody.description !== undefined) {
    updates.description = updatesBody.description?.trim() || null;
  }

  if (updatesBody.photoUrl !== undefined) {
    updates.photo_url = updatesBody.photoUrl?.trim() || null;
  }

  if (updatesBody.price !== undefined) {
    const priceCents = priceInputToCents(updatesBody.price);
    if (Number.isNaN(priceCents)) {
      return NextResponse.json({ error: "Price must be a number." }, { status: 400 });
    }
    updates.price_cents = priceCents;
  }

  if (updatesBody.status !== undefined) {
    const status = updatesBody.status.trim().toLowerCase();
    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: "Status must be available, reserved, or sold." }, { status: 400 });
    }
    updates.status = status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("items")
    .update(updates)
    .eq("id", params.id)
    .select("id")
    .single();

  if (error) {
    console.error("Failed to update item", error);
    return NextResponse.json({ error: error.message ?? "Failed to update item." }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 200 });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { error } = await supabase.from("items").delete().eq("id", params.id);

  if (error) {
    console.error("Failed to delete item", error);
    return NextResponse.json({ error: error.message ?? "Failed to delete item." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
