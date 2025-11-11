import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_PASS = process.env.ADMIN_PASS;

export async function POST(request: Request) {
  if (!ADMIN_PASS) {
    return NextResponse.json({ error: "Admin password not configured." }, { status: 500 });
  }

  const { password } = (await request.json().catch(() => ({}))) as { password?: string };

  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  if (password !== ADMIN_PASS) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  cookies().set({
    name: "admin",
    value: "1",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // one week
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE() {
  cookies().delete("admin");
  return NextResponse.json({ ok: true });
}
