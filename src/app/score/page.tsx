"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import { parsePraises, type PraiseCard } from "@/lib/praises";

function ScoreViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url") ?? "";
  const indexParam = searchParams.get("index");
  const dateParam = searchParams.get("date");
  
  const [currentIndex, setCurrentIndex] = useState(indexParam ? parseInt(indexParam, 10) : 0);
  const [praiseCards, setPraiseCards] = useState<PraiseCard[]>([]);
  const [loading, setLoading] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!dateParam || !url) return;
    // 같은 주보의 악보 목록 가져오기
    fetch(`/api/bulletins?date=${encodeURIComponent(dateParam)}`)
      .then((res) => res.json())
      .then((b) => {
        if (b && b.praises) {
          const cards = parsePraises(b.praises);
          const imageCards = cards.filter((c) => c.imageUrl);
          setPraiseCards(imageCards);
          // 현재 URL에 해당하는 인덱스 찾기
          const foundIndex = imageCards.findIndex((c) => c.imageUrl === url);
          if (foundIndex >= 0) setCurrentIndex(foundIndex);
        }
      })
      .catch(() => {});
  }, [dateParam, url]);

  const handleDragStart = (x: number, y: number) => {
    dragStartRef.current = { x, y };
    isDraggingRef.current = false;
  };

  const handleDragEnd = (x: number, y: number, isTouch: boolean = false) => {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (!start || praiseCards.length <= 1) return;
    
    // 터치의 경우 isDraggingRef 체크 없이 바로 처리
    if (!isTouch && !isDraggingRef.current) return;
    
    const deltaX = x - start.x;
    const deltaY = y - start.y;
    const threshold = 50;
    // 가로 이동이 세로보다 클 때만 악보 전환 (세로 스크롤과 구분)
    if (Math.abs(deltaX) < Math.abs(deltaY) || Math.abs(deltaX) < threshold) {
      isDraggingRef.current = false;
      return;
    }
    
    if (deltaX > threshold && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const prevCard = praiseCards[prevIndex];
      if (prevCard?.imageUrl) {
        router.replace(`/score?url=${encodeURIComponent(prevCard.imageUrl)}&index=${prevIndex}&date=${encodeURIComponent(dateParam || "")}`);
      }
    } else if (deltaX < -threshold && currentIndex < praiseCards.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextCard = praiseCards[nextIndex];
      if (nextCard?.imageUrl) {
        router.replace(`/score?url=${encodeURIComponent(nextCard.imageUrl)}&index=${nextIndex}&date=${encodeURIComponent(dateParam || "")}`);
      }
    }
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (dragStartRef.current) {
      const deltaX = Math.abs(e.touches[0].clientX - dragStartRef.current.x);
      const deltaY = Math.abs(e.touches[0].clientY - dragStartRef.current.y);
      // 가로 이동이 세로보다 크면 드래그로 인식
      if (deltaX > 10 && deltaX > deltaY) {
        isDraggingRef.current = true;
        // 가로 드래그 중이면 스크롤 방지
        if (deltaX > 30) {
          e.preventDefault();
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (dragStartRef.current) {
      handleDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY, true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStartRef.current) {
      const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartRef.current.y);
      if (deltaX > 10 || deltaY > 10) {
        isDraggingRef.current = true;
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStartRef.current) {
      handleDragEnd(e.clientX, e.clientY);
    }
  };

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

  const currentUrl = praiseCards[currentIndex]?.imageUrl || url;
  const hasMultiple = praiseCards.length > 1;

  return (
    <main 
      className="fixed inset-0 z-50 bg-black/98 flex flex-col select-none" 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        // 마우스가 화면 밖으로 나가면 드래그 취소
        dragStartRef.current = null;
        isDraggingRef.current = false;
      }}
    >
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-3 z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button
          type="button"
          onClick={() => router.push("/?view=order")}
          className="text-white/95 text-[15px] font-medium px-4 py-2 rounded-full bg-black/40"
        >
          닫기
        </button>
        {hasMultiple && (
          <div className="text-white/80 text-[13px] font-medium">
            {currentIndex + 1} / {praiseCards.length}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto flex items-start justify-center p-4 pt-14 min-h-full touch-pan-y">
        <img
          src={currentUrl}
          alt={`찬양 악보 ${currentIndex + 1}`}
          className="max-w-full h-auto object-contain rounded-lg shadow-2xl"
        />
      </div>
      {hasMultiple && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {praiseCards.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setCurrentIndex(i);
                const card = praiseCards[i];
                if (card?.imageUrl) {
                  router.replace(`/score?url=${encodeURIComponent(card.imageUrl)}&index=${i}&date=${encodeURIComponent(dateParam || "")}`);
                }
              }}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex ? "w-6 bg-white/80" : "w-2 bg-white/40"
              }`}
              aria-label={`${i + 1}번째 악보`}
            />
          ))}
        </div>
      )}
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
