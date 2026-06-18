import {
  assertAdmin,
  clothesRowToItem,
  createSupabaseServerClient,
  itemToClothesInsert,
  parseClothesPayload
} from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const payload = parseClothesPayload(await request.json());
    const supabase = createSupabaseServerClient();
    const insert = itemToClothesInsert(payload);
    let result = await supabase
      .from("clothes")
      .insert(insert)
      .select("*")
      .single();

    // Keeps creates working until the existing Supabase table runs remove-season.sql.
    if (result.error?.code === "23502" && result.error.message.includes("season")) {
      result = await supabase
        .from("clothes")
        .insert({ ...insert, season: "all-season" })
        .select("*")
        .single();
    }

    if (result.error) throw result.error;

    return Response.json(
      { item: clothesRowToItem(result.data) },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create item" },
      { status: 400 }
    );
  }
}
