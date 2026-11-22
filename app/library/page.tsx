import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LibraryClient from "./library-client";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/setup");

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  const [{ data: sources, error: sourcesError }, { data: chunks, error: chunksError }] = await Promise.all([
    supabase
      .from("knowledge_sources")
      .select("id,title,source_type,reference_number,published_on,issuing_authority,official_url,source_portal,applicability,verification_status,caution")
      .order("source_type")
      .order("title"),
    supabase
      .from("knowledge_chunks")
      .select("id,source_id,chunk_index,topic,content,article_refs,page_refs,tags,language")
      .order("source_id")
      .order("chunk_index")
      .limit(500)
  ]);

  if (sourcesError || chunksError) {
    console.error("MIA knowledge library read failed:", sourcesError?.message, chunksError?.message);
  }

  return (
    <LibraryClient
      userEmail={user.email ?? ""}
      sources={sources ?? []}
      chunks={chunks ?? []}
    />
  );
}
