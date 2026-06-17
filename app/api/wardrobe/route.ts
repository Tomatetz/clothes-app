import {
  clothesRowToItem,
  createSupabaseServerClient,
  outfitRowsToRecord
} from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const [clothesResult, outfitResult] = await Promise.all([
      supabase
        .from("clothes")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("outfit_selections").select("*")
    ]);

    if (clothesResult.error) throw clothesResult.error;
    if (outfitResult.error) throw outfitResult.error;

    return Response.json({
      items: clothesResult.data.map(clothesRowToItem),
      outfit: outfitRowsToRecord(outfitResult.data)
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load wardrobe" },
      { status: 500 }
    );
  }
}
