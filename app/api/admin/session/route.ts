import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";

const ADMIN_PASS = process.env.ADMIN_PASS;
const COOKIE_NAME = "garage_admin";

type Body = {
  garageId?: string;
  password?: string;
};

export async function POST(request: Request) {
  const { garageId, password } = (await request.json().catch(() => ({}))) as Body;

  if (!garageId) {
    return NextResponse.json({ error: "garageId is required." }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data: garage, error } = await supabase
    .from("garages")
    .select("owner_email")
    .eq("id", garageId)
    .single();

  if (error || !garage) {
    return NextResponse.json({ error: "Garage not found." }, { status: 404 });
  }

  const normalizedInput = password.trim().toLowerCase();
  const normalizedOwner = (garage.owner_email ?? "").trim().toLowerCase();
  const normalizedAdminPass = ADMIN_PASS?.trim().toLowerCase();

  const isValid =
    (!!normalizedOwner && normalizedInput === normalizedOwner) ||
    (!!normalizedAdminPass && normalizedInput === normalizedAdminPass);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid passcode." }, { status: 401 });
  }

  cookies().set({
    name: COOKIE_NAME,
    value: garageId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // one week
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE() {
  cookies().delete(COOKIE_NAME);
  cookies().delete("admin"); // cleanup legacy cookie
  return NextResponse.json({ ok: true });
}
