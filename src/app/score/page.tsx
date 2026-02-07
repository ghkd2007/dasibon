"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function ScoreViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url") ?? "";

  if (!url) {
    return (
      <main className="min-h-screen bg-black/95 flex items-center justify-center">
        <p className="text-white/70">악보 주소가 없습니다.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-white/90 text-[14px] underline"
        >
          뒤로
        </button>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 z-50 bg-black/98 flex flex-col">
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-3 z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button
          type="button"
          onClick={() => router.push("/?view=order")}
          className="text-white/95 text-[15px] font-medium px-4 py-2 rounded-full bg-black/40"
        >
          닫기
        </button>
      </div>
      <div className="flex-1 overflow-auto flex items-start justify-center p-4 pt-14 min-h-full">
        <img
          src={url}
          alt="찬양 악보"
          className="max-w-full h-auto object-contain rounded-lg shadow-2xl"
        />
      </div>
    </main>
  );
}

export default function ScorePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black/95 flex items-center justify-center"><p className="text-white/70">로딩...</p></main>}>
      <ScoreViewerContent />
    </Suspense>
  );
}
