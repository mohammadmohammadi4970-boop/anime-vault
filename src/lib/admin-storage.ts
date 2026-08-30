import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";
/** ~10 years — the bucket is private, so images are served through signed URLs. */
const SIGNED_URL_TTL = 60 * 60 * 24 * 3650;

/** Uploads an image to the private media bucket and returns a long-lived signed URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signError || !data) throw signError ?? new Error("Could not sign uploaded file");
  return data.signedUrl;
}
