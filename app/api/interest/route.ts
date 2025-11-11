import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";

type InterestPayload = {
  itemId?: string;
  participantId?: string;
  participantName?: string | null;
  message?: string | null;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as InterestPayload;
  const itemId = payload.itemId?.trim();
  const participantId = payload.participantId?.trim();
  const message = payload.message?.trim() || null;
  const providedName = payload.participantName?.trim();

  if (!itemId || !participantId) {
    return NextResponse.json({ error: "itemId and participantId are required." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("name")
    .eq("id", participantId)
    .single();

  if (participantError || !participant) {
    return NextResponse.json({ error: "Participant not found." }, { status: 404 });
  }

  const basePayload: Record<string, unknown> = {
    item_id: itemId,
    participant_id: participantId,
    message,
  };

  const extendedPayload = { ...basePayload };
  const participantName = participant.name || providedName || "Friend";
  extendedPayload.name = participantName;

  let { error } = await supabase.from("interests").insert(extendedPayload);

  if (error && error.message?.includes("column")) {
    // Fallback for schemas without denormalized columns
    const result = await supabase.from("interests").insert(basePayload);
    error = result.error;
  }

  if (error) {
    console.error("Failed to create interest", error);
    return NextResponse.json({ error: error.message ?? "Failed to submit interest." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
