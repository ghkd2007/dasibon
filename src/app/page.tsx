"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type IntroStage = "intro" | "order";

export type BulletinData = {
  date: string;
  time: string;
  sermonTitleMain: string;
  sermonTitleSub: string;
  praises: string;
  prayers: string;
  passage: string;
  sermonDescription: string;
  commitment: string;
  announcements: string;
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

export default function Home() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const [stage, setStage] = useState<IntroStage>("intro");
  const [bulletin, setBulletin] = useState<BulletinData | null>(null);

  useEffect(() => {
    if (dateParam) {
      fetch(`/api/bulletins?date=${encodeURIComponent(dateParam)}`)
        .then((res) => res.json())
        .then((b) => (b && b.date ? setBulletin(b) : setBulletin(null)))
        .catch(() => setBulletin(null));
      return;
    }
    fetch("/api/bulletins")
      .then((res) => res.json())
      .then((list: { date: string }[]) => {
        if (!Array.isArray(list) || list.length === 0) return;
        const latest = list[0];
        return fetch(`/api/bulletins?date=${encodeURIComponent(latest.date)}`).then((r) => r.json());
      })
      .then((b) => (b && b.date ? setBulletin(b) : null))
      .catch(() => {});
  }, [dateParam]);

  const handleGoOrder = () => {
    setStage("order");
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      {stage === "intro" ? (
        <IntroScreen onGoOrder={handleGoOrder} bulletin={bulletin} />
      ) : (
        <WorshipOrderScreen bulletin={bulletin} />
      )}
    </main>
  );
}

type IntroScreenProps = {
  onGoOrder: () => void;
  bulletin: BulletinData | null;
};

function IntroScreen({ onGoOrder, bulletin }: IntroScreenProps) {
  const router = useRouter();
  const backgroundImage = "/intro-background.png";
  const dateLabel = bulletin ? formatDateLabel(bulletin.date, bulletin.time) : defaultDateLabel;
  const sermonTitleMain = bulletin?.sermonTitleMain || defaultSermonMain;
  const sermonTitleSub = bulletin?.sermonTitleSub ?? defaultSermonSub;

  return (
    <div
      className="relative flex h-screen w-full items-center justify-center px-6 py-10 bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
      onClick={onGoOrder}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-[#f7f1e6]/95 pointer-events-none" />

      <div className="relative z-10 h-full w-full max-w-md overflow-hidden rounded-3xl border border-[#f5e1c4] shadow-lg">
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

        <div className="relative flex h-full flex-col justify-between px-7 py-8">
          <header className="text-center space-y-1">
            <div className="text-[11px] text-white/85">{dateLabel}</div>
            <div className="text-[11px] tracking-[0.22em] uppercase text-white/75">
              DASIBON WORSHIP
            </div>
          </header>

          <section className="flex flex-1 items-center justify-center">
            <div className="space-y-4 max-w-xs text-center">
              <h1 className="text-[28px] leading-9 font-semibold tracking-tight text-white drop-shadow-sm">
                <span className="block">{sermonTitleMain}</span>
                <span className="mt-2 block text-[20px] leading-7 font-medium text-white/95">
                  {sermonTitleSub}
                </span>
              </h1>
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

type WorshipSectionId = "praises" | "prayers" | "passage" | "sermon" | "commitment" | "announcements";

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
    label: "기도",
    title: "[PRAYER TIME]",
    body: (
      <div className="space-y-3 text-[15px] leading-7">
        <p>하늘에 계신 우리 아버지, 아버지의 이름을 거룩하게 하시며, 아버지의 나라가 오게 하시며, 아버지의 뜻이 하늘에서와 같이 땅에서도 이루어지게 하소서. 오늘 우리에게 일용할 양식을 주시고, 우리가 우리에게 잘못한 사람을 용서해 준 것 같이 우리 죄를 용서해 주시고, 우리를 시험에 빠지지 않게 하시고 악에서 구하소서. 나라와 권능과 영광이 영원히 아버지의 것입니다. 아멘.</p>
      </div>
    ),
  },
  {
    id: "passage",
    label: "말씀",
    title: "[BIBLE PASSAGE]",
    body: <p className="text-[15px] leading-6">본문을 입력해 주세요.</p>,
  },
  {
    id: "sermon",
    label: "설교",
    title: "[SERMON]",
    body: <p className="text-[15px] leading-6">설교 제목을 입력해 주세요.</p>,
  },
  {
    id: "commitment",
    label: "헌신",
    title: "[COMMITMENT]",
    body: <p className="text-[15px] leading-6">헌신 내용을 입력해 주세요.</p>,
  },
  {
    id: "announcements",
    label: "광고",
    title: "[ANNOUNCEMENTS]",
    body: <p className="text-[15px] leading-6">광고 내용을 입력해 주세요.</p>,
  },
];

function buildSectionsFromBulletin(b: BulletinData): WorshipSection[] {
  const html = (raw: string) => (
    <div className="bulletin-html text-[15px] leading-6 [&_ul]:list-disc [&_ol]:list-decimal [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: raw || "" }} />
  );
  const lines = (raw: string) =>
    raw
      .split(/\n/)
      .filter(Boolean)
      .map((line, i) => (
        <p key={i} className="text-[15px] leading-6">
          {line}
        </p>
      ));
  return [
    { id: "praises", label: "찬양", title: "[PRAISES]", body: html(b.praises) },
    { id: "prayers", label: "기도", title: "[PRAYER TIME]", body: html(b.prayers) },
    { id: "passage", label: "말씀", title: "[BIBLE PASSAGE]", body: <p className="text-[15px] leading-6">{b.passage || "—"}</p> },
    {
      id: "sermon",
      label: "설교",
      title: "[SERMON]",
      body: (
        <div className="space-y-2 text-[15px] leading-6">
          {b.sermonTitleMain && <p className="font-medium">{b.sermonTitleMain}</p>}
          {b.sermonTitleSub && <p className="text-foreground/80">{b.sermonTitleSub}</p>}
          {b.sermonDescription && html(b.sermonDescription)}
        </div>
      ),
    },
    { id: "commitment", label: "헌신", title: "[COMMITMENT]", body: html(b.commitment) },
    {
      id: "announcements",
      label: "광고",
      title: "[ANNOUNCEMENTS]",
      body: (
        <div className="space-y-2 text-[14px] leading-6 whitespace-pre-wrap">
          {b.announcements ? lines(b.announcements) : <p>—</p>}
        </div>
      ),
    },
  ];
}

function WorshipOrderScreen({ bulletin }: { bulletin: BulletinData | null }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [fontScale, setFontScale] = useState(1);

  const sections = bulletin ? buildSectionsFromBulletin(bulletin) : defaultSections;
  const activeSection = sections[activeIndex];
  const backgroundImage = "/intro-background.png";
  const dateHeader = bulletin ? formatDateLabel(bulletin.date, bulletin.time) : "2026년 2월 1일 주일예배 · 오전 11시";

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    const threshold = 40;
    if (delta > threshold && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    } else if (delta < -threshold && activeIndex < sections.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
    setTouchStartX(null);
  };

  const decreaseFont = () => {
    setFontScale((prev) => Math.max(0.9, parseFloat((prev - 0.1).toFixed(2))));
  };

  const increaseFont = () => {
    setFontScale((prev) => Math.min(1.2, parseFloat((prev + 0.1).toFixed(2))));
  };

  return (
    <div
      className="relative flex h-screen w-full items-center justify-center px-6 py-10 bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-[#f7f1e6]/95 pointer-events-none" />

      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-background/92 px-5 py-6 rounded-3xl border border-[#f5e1c4] shadow-lg">
        <header className="mb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] text-foreground/55">
                {dateHeader}
              </div>
              <div className="mt-1 text-[11px] tracking-[0.22em] uppercase text-foreground/45">
                DASIBON Worship
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-foreground/70">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  decreaseFont();
                }}
                className="h-6 w-6 flex items-center justify-center rounded-full border border-[#d3c2aa] bg-white/70 text-[10px]"
                aria-label="글자 작게"
              >
                A-
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  increaseFont();
                }}
                className="h-6 w-6 flex items-center justify-center rounded-full border border-[#d3c2aa] bg-white/80 text-[10px] font-semibold"
                aria-label="글자 크게"
              >
                A+
              </button>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#e5d6c0]/80 flex items-center justify-between">
            <div className="flex gap-2 text-[12px]">
              {sections.map((section, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`px-2 pb-1 border-b-2 text-[12px] ${
                      isActive
                        ? "border-[#3b2a20] text-foreground font-semibold"
                        : "border-transparent text-foreground/70"
                    }`}
                  >
                    {section.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-foreground/60">
              {activeSection.label} {activeIndex + 1}/{sections.length}
            </div>
          </div>
        </header>

        <div
          className="relative mt-4 flex-1 overflow-hidden rounded-2xl bg-[#fbf5eb]/95 border border-[#e5d6c0]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {sections.map((section) => (
              <section
                key={section.id}
                className="w-full shrink-0 px-5 py-6 flex flex-col gap-4 overflow-y-auto"
                style={{ transform: `scale(${fontScale})`, transformOrigin: "top left" }}
              >
                <h2 className="text-[12px] tracking-[0.28em] text-foreground/70 text-center">
                  {section.title}
                </h2>
                <div className="mt-2 pb-2">{section.body}</div>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-foreground/60">
          <span className="text-lg opacity-60">←</span>
          <span>옆으로 넘기며 예배 순서를 볼 수 있어요</span>
          <span className="text-lg opacity-60">→</span>
        </div>
      </div>
    </div>
  );
}
