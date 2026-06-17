import {
  assertAdmin,
  clothesRowToItem,
  createSupabaseServerClient,
  itemToClothesInsert,
  parseClothesPayload
} from "@/lib/supabase/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const payload = parseClothesPayload(await request.json());
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("clothes")
      .update({
        ...itemToClothesInsert(payload),
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return Response.json({ item: clothesRowToItem(data) });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update item" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("clothes").delete().eq("id", id);

    if (error) throw error;

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete item" },
      { status: 400 }
    );
  }
}
