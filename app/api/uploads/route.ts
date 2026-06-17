import {
  assertAdmin,
  createSupabaseServerClient
} from "@/lib/supabase/server";

export const runtime = "nodejs";

const bucketName = "clothes-images";

export async function POST(request: Request) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Missing file" }, { status: 400 });
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${extension}`;
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;

    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);

    return Response.json({ imageUrl: data.publicUrl });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 400 }
    );
  }
}
