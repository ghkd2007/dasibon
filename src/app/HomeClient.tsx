"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { parsePraises, type PraiseCard } from "@/lib/praises";

type IntroStage = "intro" | "order";

export type BulletinData = {
  date: string;
  eventType?: string;
  time: string;
  sermonTitleMain: string;
  sermonTitleMainColor?: string | null;
  sermonTitleSub: string;
  sermonTitleSubColor?: string | null;
  praises: string;
  prayers: string;
  passage: string;
  sermonDescription: string;
  commitment?: string;
  announcements: string;
  introBackgroundUrl?: string | null;
  youtubeUrl?: string | null;
};

const defaultDateLabel = "날짜 없음 · 오전 11시";
const defaultSermonMain = "다시본교회 주일 예배";
const defaultSermonSub = "";

function formatDateLabel(dateStr: string, time: string) {
  if (!dateStr) return defaultDateLabel;
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return defaultDateLabel;
  const timeLabel = time ? `오전 ${time}` : "오전 11시";
  return `${y}년 ${Number(m)}월 ${Number(d)}일 · ${timeLabel}`;
}

function formatBulletinOption(dateStr: string, eventType?: string) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  const type = eventType && eventType.trim() ? eventType : "주일 예배";
  return `${y}년 ${Number(m)}월 ${Number(d)}일 ${type}`;
}

function IntroScreenLoading({ onGoOrder }: { onGoOrder: () => void }) {
  const router = useRouter();
  const backgroundImage = "/intro-background.png";

  return (
    <div
      className="relative flex min-h-[100dvh] h-[100dvh] max-h-[100dvh] w-full items-center justify-center px-4 py-4 sm:px-6 sm:py-10 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
      onClick={onGoOrder}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-[#f7f1e6]/95 pointer-events-none" />
      <div className="relative z-10 h-full max-h-full w-full max-w-md overflow-hidden rounded-3xl border border-[#f5e1c4] shadow-lg flex flex-col min-h-0">
        <div className="absolute right-4 top-4 z-20">
          <button
            type="button"
            aria-label="관리자 설정"
            onClick={(e) => {
              e.stopPropagation();
              router.push("/admin/login");
            }}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-black/35 border border-white/40 text-white/90 text-sm"
          >
            ⚙
          </button>
        </div>
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px] pointer-events-none" />
        <div className="relative flex flex-1 min-h-0 flex-col justify-between px-5 py-6 sm:px-7 sm:py-8">
          <header className="text-center space-y-1 shrink-0">
            <div className="text-[11px] text-white/85">...</div>
            <div className="text-[11px] tracking-[0.22em] uppercase text-white/75">
              DASIBON WORSHIP
            </div>
          </header>
          <section className="flex flex-1 items-center justify-center">
            <div className="space-y-4 max-w-xs text-center">
              <div className="min-h-[6.5rem] flex items-center justify-center">
                <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-white drop-shadow-sm">
                  <span className="inline-flex justify-center gap-0.5">
                    <span className="loading-dot-1">.</span>
                    <span className="loading-dot-2">.</span>
                    <span className="loading-dot-3">.</span>
                  </span>
                </h1>
              </div>
              <p className="mt-3 text-[15px] text-white/90">
                다시본교회 주일 예배
              </p>
            </div>
          </section>
          <footer className="pt-4 border-t border-white/40 text-right text-[11px] text-white/75">
            화면을 탭하면 예배 순서로 이동합니다
          </footer>
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const [stage, setStage] = useState<IntroStage>("intro");
  const [bulletin, setBulletin] = useState<BulletinData | null>(null);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    if (searchParams.get("view") === "order") setStage("order");
  }, [searchParams]);

  useEffect(() => {
    // sessionStorage에서 캐시된 데이터 확인
    const cacheKey = dateParam ? `bulletin-${dateParam}` : "bulletin-latest";
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.date) {
          setBulletin(parsed);
          setDataReady(true);
          // 캐시된 데이터를 사용하되, 백그라운드에서 최신 데이터 확인
          if (dateParam) {
            fetch(`/api/bulletins?date=${encodeURIComponent(dateParam)}`)
              .then((res) => res.json())
              .then((b) => {
                if (b && b.date) {
                  setBulletin(b);
                  sessionStorage.setItem(cacheKey, JSON.stringify(b));
                }
              })
              .catch(() => {});
          }
          return;
        }
      } catch {
        // 캐시 파싱 실패 시 무시
      }
    }

    // 캐시가 없으면 데이터 로드
    if (dateParam) {
      fetch(`/api/bulletins?date=${encodeURIComponent(dateParam)}`)
        .then((res) => res.json())
        .then((b) => {
          if (b && b.date) {
            setBulletin(b);
            sessionStorage.setItem(cacheKey, JSON.stringify(b));
          } else {
            setBulletin(null);
          }
        })
        .catch(() => setBulletin(null))
        .finally(() => setDataReady(true));
      return;
    }
    
    // 최신 주보 로드
    fetch("/api/bulletins")
      .then((res) => res.json())
      .then((list: { date: string }[]) => {
        if (!Array.isArray(list) || list.length === 0) {
          setDataReady(true);
          return null;
        }
        const latest = list[0];
        return fetch(`/api/bulletins?date=${encodeURIComponent(latest.date)}`).then((r) => r.json());
      })
      .then((b) => {
        if (b && b.date) {
          setBulletin(b);
          sessionStorage.setItem(cacheKey, JSON.stringify(b));
        }
        setDataReady(true);
      })
      .catch(() => setDataReady(true));
  }, [dateParam]);

  const handleGoOrder = () => {
    setStage("order");
  };

  if (!dataReady) {
    return <IntroScreenLoading onGoOrder={handleGoOrder} />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      {stage === "intro" ? (
        <IntroScreen onGoOrder={handleGoOrder} bulletin={bulletin} />
      ) : (
        <WorshipOrderScreen bulletin={bulletin} onGoIntro={() => setStage("intro")} />
      )}
    </main>
  );
}

export default function HomeClient() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background flex items-center justify-center"><div className="text-foreground/60">로딩 중...</div></main>}>
      <HomeContent />
    </Suspense>
  );
}

type IntroScreenProps = {
  onGoOrder: () => void;
  bulletin: BulletinData | null;
};

function IntroScreen({ onGoOrder, bulletin }: IntroScreenProps) {
  const router = useRouter();
  const [dateList, setDateList] = useState<{ date: string; sermonTitleMain?: string; eventType?: string }[]>([]);

  useEffect(() => {
    fetch("/api/bulletins")
      .then((res) => res.json())
      .then((list) => (Array.isArray(list) ? setDateList(list) : setDateList([])))
      .catch(() => setDateList([]));
  }, []);

  const backgroundImage = bulletin?.introBackgroundUrl || "/intro-background.png";
  const dateLabel = bulletin ? formatDateLabel(bulletin.date, bulletin.time) : defaultDateLabel;
  const sermonTitleMain = bulletin?.sermonTitleMain || defaultSermonMain;
  const sermonTitleMainColor = bulletin?.sermonTitleMainColor ?? undefined;
  const sermonTitleSub = bulletin?.sermonTitleSub ?? defaultSermonSub;
  const sermonTitleSubColor = bulletin?.sermonTitleSubColor ?? undefined;
  const currentDate = bulletin?.date ?? (dateList[0]?.date ?? "");

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const date = e.target.value;
    if (date) router.push(`/?date=${encodeURIComponent(date)}`);
  };

  return (
    <div
      className="relative flex min-h-[100dvh] h-[100dvh] max-h-[100dvh] w-full items-center justify-center px-4 py-4 sm:px-6 sm:py-10 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
      onClick={onGoOrder}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-[#f7f1e6]/95 pointer-events-none" />

      <div className="relative z-10 h-full max-h-full w-full max-w-md overflow-hidden rounded-3xl border border-[#f5e1c4] shadow-lg flex flex-col min-h-0">
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          {bulletin?.youtubeUrl ? (
            <a
              href={bulletin.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="유튜브"
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-black/35 border border-white/40 text-white/90 hover:bg-black/50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0" aria-hidden>
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          ) : null}
          <button
            type="button"
            aria-label="관리자 설정"
            onClick={(e) => {
              e.stopPropagation();
              router.push("/admin/login");
            }}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-black/35 border border-white/40 text-white/90 text-sm"
          >
            ⚙
          </button>
        </div>
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px] pointer-events-none" />

        <div className="relative flex flex-1 min-h-0 flex-col px-5 py-5 sm:px-7 sm:py-8 overflow-hidden">
          <header className="shrink-0 h-[3.5rem] flex flex-col justify-center text-center">
            <div className="text-[11px] text-white/85 leading-tight">{dateLabel}</div>
            <div className="text-[11px] tracking-[0.22em] uppercase text-white/75 leading-tight mt-0.5">
              DASIBON WORSHIP
            </div>
          </header>

          <section className="flex-1 min-h-0 flex items-center justify-center py-0 overflow-y-auto">
            <div className="w-full max-w-xs text-center min-h-[11rem] flex flex-col items-center justify-center gap-4 py-2">
              <div className="min-h-[6.5rem] flex items-center justify-center w-full">
                <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-white drop-shadow-sm">
                  <span className="block whitespace-pre-line" style={sermonTitleMainColor ? { color: sermonTitleMainColor } : undefined}>{sermonTitleMain}</span>
                  <span className="mt-2 block text-[20px] leading-7 font-medium text-white/95 whitespace-pre-line" style={sermonTitleSubColor ? { color: sermonTitleSubColor } : undefined}>
                    {sermonTitleSub}
                  </span>
                </h1>
              </div>
              <p className="text-[15px] text-white/90 shrink-0 h-[1.5rem] flex items-center justify-center">
                다시본교회 주일 예배
              </p>
            </div>
          </section>

          <footer
            className="shrink-0 mt-4 pt-4 sm:mt-8 sm:pt-5 border-t border-white/40 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 text-[11px] text-white/75 min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center sm:justify-start order-2 sm:order-1 shrink-0">
              <img
                src="/church-logo.png"
                alt="기독교한국침례회 다시 본 교회"
                className="h-10 sm:h-14 md:h-16 w-auto max-h-[64px] sm:max-h-[72px] object-contain opacity-95 hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 items-center sm:items-end order-1 sm:order-2 min-w-0 flex-1 sm:flex-initial">
              <p className="text-center sm:text-right leading-snug text-white/80">
                아래에서 날짜를 선택하면 해당 주보를 볼 수 있습니다.
              </p>
              <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto min-h-8">
              {dateList.length > 0 ? (
                <select
                  id="intro-date-select"
                  value={currentDate}
                  onChange={handleDateChange}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-[220px] sm:max-w-none rounded-md border border-white/40 bg-black/30 px-3 py-2 text-white/95 text-[11px] focus:outline-none focus:ring-1 focus:ring-white/50"
                  aria-label="주보 날짜 선택"
                >
                  {dateList.map((item) => (
                    <option key={item.date} value={item.date} className="bg-[#2a2520] text-white">
                      {formatBulletinOption(item.date, item.eventType)}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="invisible text-[11px]">로딩</span>
              )}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

type WorshipSectionId = "praises" | "prayers" | "passage" | "sermon" | "announcements";

type WorshipSection = {
  id: WorshipSectionId;
  label: string;
  title: string;
  body: React.ReactNode;
};

const defaultSections: WorshipSection[] = [
  {
    id: "praises",
    label: "찬양",
    title: "[PRAISES]",
    body: (
      <ul className="space-y-2 text-[15px] leading-6">
        <li># 찬양하세</li>
        <li># 풀은 마르고 꽃은 시드나</li>
        <li># 온 땅의 주인</li>
        <li># 창조의 아버지</li>
      </ul>
    ),
  },
  {
    id: "prayers",
    label: "주기도문",
    title: "[주기도문]",
    body: (
      <div className="space-y-3 text-[15px] leading-7">
        <p>하늘에 계신 우리 아버지, 아버지의 이름을 거룩하게 하시며, 아버지의 나라가 오게 하시며, 아버지의 뜻이 하늘에서와 같이 땅에서도 이루어지게 하소서. 오늘 우리에게 일용할 양식을 주시고, 우리가 우리에게 잘못한 사람을 용서해 준 것 같이 우리 죄를 용서해 주시고, 우리를 시험에 빠지지 않게 하시고 악에서 구하소서. 나라와 권능과 영광이 영원히 아버지의 것입니다. 아멘.</p>
      </div>
    ),
  },
  { id: "passage", label: "말씀", title: "[말씀]", body: <p className="text-[15px] leading-6">본문을 입력해 주세요.</p> },
  { id: "sermon", label: "나눔 질문", title: "[나눔 질문]", body: <p className="text-[15px] leading-6">나눔 질문을 입력해 주세요.</p> },
  { id: "announcements", label: "광고", title: "[광고]", body: <p className="text-[15px] leading-6">광고 내용을 입력해 주세요.</p> },
];

function buildSectionsFromBulletin(b: BulletinData): WorshipSection[] {
  const html = (raw: string) => (
    <div
      className="bulletin-html text-[15px] leading-6 whitespace-pre-wrap [&_ul]:list-disc [&_ol]:list-decimal [&_p]:mb-2 [&_div]:block [&_div]:mb-2 [&_br]:leading-6"
      dangerouslySetInnerHTML={{ __html: (raw || "").replace(/\n/g, "<br />") }}
    />
  );
  const praiseCards = parsePraises(b.praises ?? "");
  const praisesBody = praiseCards.length > 0 ? (
    <ul className="space-y-3">
      {praiseCards.map((card, i) => (
        <li key={i}>
          {card.imageUrl ? (
            <a href={`/score?url=${encodeURIComponent(card.imageUrl)}&index=${i}&date=${encodeURIComponent(b.date)}`} className="block rounded-xl border border-[#e5d6c0] bg-[#fbf5eb]/95 p-4 text-[15px] font-medium text-foreground shadow-sm hover:bg-[#f5ebe0] active:scale-[0.99] transition">
              <span className="block">{card.title || "찬양"}</span>
            </a>
          ) : (
            <div className="rounded-xl border border-[#e5d6c0] bg-[#fbf5eb]/95 p-4 text-[15px] text-foreground">{card.title || "—"}</div>
          )}
        </li>
      ))}
    </ul>
  ) : html(b.praises);
  return [
    { id: "praises", label: "찬양", title: "[찬양]", body: praisesBody },
    { id: "prayers", label: "주기도문", title: "[주기도문]", body: html(b.prayers) },
    { id: "passage", label: "말씀", title: "[말씀]", body: html(b.passage || "—") },
    { id: "sermon", label: "나눔 질문", title: "[나눔 질문]", body: (<div className="space-y-2 text-[15px] leading-6">{b.sermonTitleMain && <p className="font-medium whitespace-pre-line" style={b.sermonTitleMainColor ? { color: b.sermonTitleMainColor } : undefined}>{b.sermonTitleMain}</p>}{b.sermonTitleSub && <p className="text-foreground/80 whitespace-pre-line" style={b.sermonTitleSubColor ? { color: b.sermonTitleSubColor } : undefined}>{b.sermonTitleSub}</p>}{b.sermonDescription && html(b.sermonDescription)}</div>) },
    { id: "announcements", label: "광고", title: "[광고]", body: html(b.announcements || "—") },
  ];
}

function WorshipOrderScreen({ bulletin, onGoIntro }: { bulletin: BulletinData | null; onGoIntro: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [fontScale, setFontScale] = useState(1);
  const sections = bulletin ? buildSectionsFromBulletin(bulletin) : defaultSections;
  const backgroundImage = bulletin?.introBackgroundUrl || "/intro-background.png";
  const dateHeader = bulletin ? formatDateLabel(bulletin.date, bulletin.time) : "2026년 2월 1일 주일예배 · 오전 11시";

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const deltaX = e.changedTouches[0].clientX - start.x;
    const deltaY = e.changedTouches[0].clientY - start.y;
    const threshold = 36;
    if (Math.abs(deltaX) < Math.abs(deltaY) || Math.abs(deltaX) < threshold) return;
    if (deltaX > threshold && activeIndex > 0) setActiveIndex((p) => p - 1);
    else if (deltaX < -threshold && activeIndex < sections.length - 1) setActiveIndex((p) => p + 1);
  };

  const decreaseFont = () => setFontScale((prev) => Math.max(0.9, parseFloat((prev - 0.1).toFixed(2))));
  const increaseFont = () => setFontScale((prev) => Math.min(1.2, parseFloat((prev + 0.1).toFixed(2))));

  return (
    <div className="relative flex min-h-[100dvh] h-[100dvh] max-h-[100dvh] w-full items-center justify-center px-4 py-4 sm:px-6 sm:py-10 bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-[#f7f1e6]/95 pointer-events-none" />
      <div className="relative z-10 flex h-full max-h-full w-full max-w-md flex-col min-h-0 bg-background/92 px-4 py-4 sm:px-5 sm:py-6 rounded-3xl border border-[#f5e1c4] shadow-lg overflow-hidden">
        <header className="mb-3 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] text-foreground/55">{dateHeader}</div>
              <div className="mt-1 text-[11px] tracking-[0.22em] uppercase text-foreground/45">DASIBON Worship</div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); onGoIntro(); }} className="h-8 w-8 flex items-center justify-center rounded-full border border-[#d3c2aa] bg-white/70 text-foreground/80 hover:bg-white/90" aria-label="홈(인트로)" title="인트로 화면으로">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); decreaseFont(); }} className="hidden h-8 w-8 flex items-center justify-center rounded-full border border-[#d3c2aa] bg-white/70 text-[11px] text-foreground/80 hover:bg-white/90" aria-label="글자 작게">A-</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); increaseFont(); }} className="hidden h-8 w-8 flex items-center justify-center rounded-full border border-[#d3c2aa] bg-white/80 text-[11px] font-semibold text-foreground/80 hover:bg-white/90" aria-label="글자 크게">A+</button>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#e5d6c0]/80 flex justify-between items-center gap-2 px-2 text-[12px]">
            {sections.map((section, index) => (
              <button key={section.id} type="button" onClick={() => setActiveIndex(index)} className={`shrink-0 px-2.5 py-1.5 rounded-t border-b-2 text-[12px] transition-colors ${index === activeIndex ? "border-[#3b2a20] text-foreground font-semibold" : "border-transparent text-foreground/70 hover:text-foreground/85"}`}>
                {section.label}
              </button>
            ))}
          </div>
        </header>
        <div className="relative mt-4 flex-1 min-h-0 overflow-hidden rounded-2xl bg-[#fbf5eb]/95 border border-[#e5d6c0]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="flex h-full" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            {sections.map((section) => (
              <section key={section.id} className="w-full shrink-0 min-h-full px-4 py-4 sm:px-5 sm:py-6 flex flex-col gap-4 overflow-y-auto touch-pan-y" style={{ transform: `scale(${fontScale})`, transformOrigin: "top left" }}>
                <h2 className="text-[12px] tracking-[0.28em] text-foreground/70 text-center">{section.title}</h2>
                <div className="mt-2 pb-2">{section.body}</div>
              </section>
            ))}
          </div>
        </div>
        <div className="mt-3 shrink-0 flex items-center justify-center gap-2 text-[11px] text-foreground/60">
          <span className="text-lg opacity-60">←</span><span>옆으로 넘기며 예배 순서를 볼 수 있어요</span><span className="text-lg opacity-60">→</span>
        </div>
      </div>
    </div>
  );
}
