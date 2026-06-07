// app/api/dev/seed/route.ts — dev-only endpoint to load demo data for the
// signed-in user. Disabled in production. Usage: open /api/dev/seed while logged in.

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { seedDemoData } from "@/lib/seed";

async function handle() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Seed desabilitado em produção." },
      { status: 403 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Entre primeiro para popular sua conta." },
      { status: 401 },
    );
  }

  const result = await seedDemoData(session.user.id);
  return NextResponse.json({ ok: true, ...result });
}

export async function GET() {
  return handle();
}

export async function POST() {
  return handle();
}
