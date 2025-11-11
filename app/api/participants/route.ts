import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";

type ParticipantPayload = {
  garageId?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ParticipantPayload;
  const garageId = payload.garageId?.trim();
  const name = payload.name?.trim();
  const email = payload.email?.trim() || null;
  const phone = payload.phone?.trim() || null;

  if (!garageId) {
    return NextResponse.json({ error: "garageId is required." }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("participants")
    .insert({
      garage_id: garageId,
      name,
      email,
      phone,
    })
    .select("id,name")
    .single();

  if (error) {
    console.error("Failed to create participant", error);
    return NextResponse.json({ error: error.message ?? "Failed to create participant." }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, name: data.name }, { status: 201 });
}
