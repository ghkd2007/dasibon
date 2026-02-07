import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getStoragePublicUrl, STORAGE_BUCKET } from "@/lib/supabase-server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const FALLBACK_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function getPathFromPublicUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || ".jpg";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(safeName, buffer, { contentType: file.type || "image/jpeg", upsert: false });
      if (error) {
        console.error("Supabase upload error", error);
        return NextResponse.json({ error: error.message || "업로드 실패" }, { status: 500 });
      }
      const publicUrl = getStoragePublicUrl(data.path);
      return NextResponse.json({ url: publicUrl });
    }

    await mkdir(FALLBACK_UPLOAD_DIR, { recursive: true });
    const filePath = path.join(FALLBACK_UPLOAD_DIR, safeName);
    await writeFile(filePath, buffer);
    return NextResponse.json({ url: `/uploads/${safeName}` });
  } catch (e) {
    console.error("Upload error", e);
    return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url : null;
    if (!url) {
      return NextResponse.json({ error: "url 필요" }, { status: 400 });
    }

    if (supabaseAdmin) {
      const filePath = getPathFromPublicUrl(url);
      if (!filePath) {
        return NextResponse.json({ error: "잘못된 URL" }, { status: 400 });
      }
      const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([filePath]);
      if (error) {
        console.error("Supabase delete error", error);
        return NextResponse.json({ error: error.message || "삭제 실패" }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (url.startsWith("/uploads/")) {
      const name = path.basename(url);
      const filePath = path.join(FALLBACK_UPLOAD_DIR, name);
      await unlink(filePath).catch(() => {});
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "삭제할 수 없는 URL" }, { status: 400 });
  } catch (e) {
    console.error("Delete error", e);
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
