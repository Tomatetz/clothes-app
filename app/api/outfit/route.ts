import {
  createSupabaseServerClient,
  isClothingSlot
} from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as {
      slot?: unknown;
      clothingItemId?: unknown;
    };

    if (
      !isClothingSlot(payload.slot) ||
      !(
        typeof payload.clothingItemId === "string" ||
        payload.clothingItemId === null
      )
    ) {
      return Response.json({ error: "Invalid outfit payload" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("outfit_selections").upsert({
      slot: payload.slot,
      clothing_item_id: payload.clothingItemId,
      updated_at: new Date().toISOString()
    });

    if (error) throw error;

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to save outfit" },
      { status: 400 }
    );
  }
}
