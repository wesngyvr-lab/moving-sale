import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabaseServer";

type GaragePayload = {
  title?: string;
  slug?: string;
  ownerEmail?: string;
};

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

export async function POST(request: Request) {
  const payload = (await request.json()) as GaragePayload;
  const title = payload.title?.trim();
  const ownerEmail = payload.ownerEmail?.trim();
  const requestedSlug = payload.slug?.trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (!ownerEmail) {
    return NextResponse.json({ error: "Owner email is required." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const baseSlug = slugify(requestedSlug || title);

  if (!baseSlug) {
    return NextResponse.json({ error: "Unable to derive slug from title." }, { status: 400 });
  }

  let uniqueSlug = baseSlug;
  let suffix = 2;

  // Ensure slug uniqueness
  while (true) {
    const { data: existing, error: lookupError } = await supabase
      .from("garages")
      .select("slug")
      .eq("slug", uniqueSlug)
      .maybeSingle();

    if (lookupError) {
      console.error("Slug check failed", lookupError);
      return NextResponse.json({ error: "Failed checking slug availability." }, { status: 500 });
    }

    if (!existing) {
      break;
    }

    uniqueSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const { error, data } = await supabase
    .from("garages")
    .insert({
      title,
      slug: uniqueSlug,
      owner_email: ownerEmail,
    })
    .select("slug")
    .single();

  if (error) {
    console.error("Supabase insert error", error);
    return NextResponse.json({ error: error.message ?? "Failed to create garage." }, { status: 500 });
  }

  return NextResponse.json({ slug: data.slug }, { status: 201 });
}
