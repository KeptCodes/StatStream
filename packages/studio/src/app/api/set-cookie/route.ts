import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "studio_key",
    value: "studio-api-key",
  });

  return NextResponse.json({}, { status: 200 });
}
