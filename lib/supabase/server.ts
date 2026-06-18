import { createClient } from "@supabase/supabase-js";
import { ClothingSlot, WardrobeItem } from "@/lib/wardrobe";

type ClothesRow = {
  id: string;
  name: string;
  category: string;
  brand: string;
  image_url: string;
  slots: ClothingSlot[];
  created_at: string;
  updated_at: string;
};

type OutfitSelectionRow = {
  slot: ClothingSlot;
  clothing_item_id: string | null;
  updated_at: string;
};

export type ClothesPayload = Omit<WardrobeItem, "id">;

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !secretKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY");
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false
    }
  });
}

export function assertAdmin(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return Response.json(
      { error: "ADMIN_PASSWORD is not configured" },
      { status: 500 }
    );
  }

  if (request.headers.get("x-admin-password") !== adminPassword) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export function clothesRowToItem(row: ClothesRow): WardrobeItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    imageUrl: row.image_url,
    slots: row.slots
  };
}

export function itemToClothesInsert(item: ClothesPayload) {
  return {
    name: item.name,
    category: item.category,
    brand: item.brand,
    image_url: item.imageUrl,
    slots: item.slots
  };
}

export function outfitRowsToRecord(rows: OutfitSelectionRow[]) {
  return rows.reduce<Partial<Record<ClothingSlot, string>>>((outfit, row) => {
    if (row.clothing_item_id) {
      outfit[row.slot] = row.clothing_item_id;
    }
    return outfit;
  }, {});
}

export function isClothingSlot(value: unknown): value is ClothingSlot {
  return (
    value === "top" ||
    value === "outerTop" ||
    value === "bottom" ||
    value === "shoes" ||
    value === "bag"
  );
}

export function parseClothesPayload(input: unknown): ClothesPayload {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid item payload");
  }

  const payload = input as Partial<ClothesPayload>;

  if (
    typeof payload.name !== "string" ||
    typeof payload.category !== "string" ||
    typeof payload.brand !== "string" ||
    typeof payload.imageUrl !== "string" ||
    !Array.isArray(payload.slots) ||
    !payload.slots.every(isClothingSlot)
  ) {
    throw new Error("Invalid item payload");
  }

  return {
    name: payload.name.trim(),
    category: payload.category.trim(),
    brand: payload.brand.trim(),
    imageUrl: payload.imageUrl,
    slots: payload.slots
  };
}
