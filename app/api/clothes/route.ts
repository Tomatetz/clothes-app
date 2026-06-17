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
    const { data, error } = await supabase
      .from("clothes")
      .insert(itemToClothesInsert(payload))
      .select("*")
      .single();

    if (error) throw error;

    return Response.json({ item: clothesRowToItem(data) }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create item" },
      { status: 400 }
    );
  }
}
