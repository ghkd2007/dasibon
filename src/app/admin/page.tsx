"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import RichTextEditor from "@/components/RichTextEditor";
import ComposedInput from "@/components/ComposedInput";
import { useRouter } from "next/navigation";
import { parsePraises, stringifyPraises, type PraiseCard } from "@/lib/praises";

const EVENT_TYPES = ["주일 예배", "금요 기도회"] as const;

type BulletinForm = {
  date: string;
  eventType: string;
  time: string;
  sermonTitleMain: string;
  sermonTitleMainColor: string;
  sermonTitleSub: string;
  sermonTitleSubColor: string;
  praises: string;
  prayers: string;
  passage: string;
  sermonDescription: string;
  announcements: string;
  introBackgroundUrl: string;
  youtubeUrl: string;
};

const defaultPrayers =
  "하늘에 계신 우리 아버지, 아버지의 이름을 거룩하게 하시며,\n아버지의 나라가 오게 하시며, 아버지의 뜻이 하늘에서와 같이 땅에서도 이루어지게 하소서.\n오늘 우리에게 일용할 양식을 주시고, 우리가 우리에게 잘못한 사람을 용서해 준 것 같이 우리 죄를 용서해 주시고,\n우리를 시험에 빠지지 않게 하시고 악에서 구하소서.\n\n나라와 권능과 영광이 영원히 아버지의 것입니다. 아멘.";

const emptyForm: BulletinForm = {
  date: "",
  eventType: "주일 예배",
  time: "11:00",
  sermonTitleMain: "",
  sermonTitleMainColor: "#ffffff",
  sermonTitleSub: "",
  sermonTitleSubColor: "#ffffff",
  praises: "",
  prayers: defaultPrayers,
  passage: "",
  sermonDescription: "",
  announcements: "",
  introBackgroundUrl: "",
  youtubeUrl: "",
};

type BulletinListItem = { date: string; sermonTitleMain: string; eventType?: string };

function PraisesCardEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const cards = parsePraises(value);
  const fileInputRefs = useRef({} as Record<number, HTMLInputElement | null>);

  const setCards = (next: PraiseCard[]) => {
    onChange(stringifyPraises(next));
  };

  const addCard = () => {
    setCards([...cards, { title: "", imageUrl: "" }]);
  };

  const updateCard = (index: number, patch: Partial<PraiseCard>) => {
    const next = cards.map((c, i) => (i === index ? { ...c, ...patch } : c));
    setCards(next);
  };

  const removeCard = (index: number) => {
    const removed = cards[index];
    if (removed?.imageUrl && (removed.imageUrl.startsWith("http") || removed.imageUrl.startsWith("/uploads"))) {
      fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: removed.imageUrl }) }).catch(() => {});
    }
    setCards(cards.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    const card = cards[index];
    if (card?.imageUrl && (card.imageUrl.startsWith("http") || card.imageUrl.startsWith("/uploads"))) {
      fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: card.imageUrl }) }).catch(() => {});
    }
    updateCard(index, { imageUrl: "" });
  };

  const handleFile = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const prevUrl = cards[index]?.imageUrl;
    if (prevUrl && (prevUrl.startsWith("http") || prevUrl.startsWith("/uploads"))) {
      fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: prevUrl }) }).catch(() => {});
    }
    const formData = new FormData();
    formData.set("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data?.url) updateCard(index, { imageUrl: data.url });
    } catch {
      // ignore
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      {cards.map((card, index) => (
        <div
          key={index}
          className="rounded-xl border border-[#e5d6c0] bg-[#fbf5eb]/80 p-3 space-y-2"
        >
          <div className="flex gap-2 items-start">
            <ComposedInput
              type="text"
              value={card.title}
              onChange={(v) => updateCard(index, { title: v })}
              placeholder="찬양 제목"
              className="flex-1 rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px]"
            />
            <button
              type="button"
              onClick={() => removeCard(index)}
              className="text-red-600 text-[12px] px-2 py-1 shrink-0"
            >
              삭제
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={(el) => { if (fileInputRefs.current) fileInputRefs.current[index] = el; }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(index, e)}
            />
            <button
              type="button"
              onClick={() => fileInputRefs.current[index]?.click()}
              className="text-[12px] px-3 py-1.5 rounded-md border border-[#c49a6c] text-[#8b6919] hover:bg-[#c49a6c]/10"
            >
              {card.imageUrl ? "악보 이미지 변경" : "악보 이미지 올리기"}
            </button>
            {card.imageUrl && (
              <>
                <a
                  href={card.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-foreground/60 underline"
                >
                  미리보기
                </a>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-[11px] text-red-600 underline"
                >
                  이미지 제거
                </button>
              </>
            )}
          </div>
          {card.imageUrl && (
            <div className="h-16 rounded overflow-hidden bg-white/50 border border-[#e5d6c0]">
              <img src={card.imageUrl} alt="" className="h-full w-auto object-contain" />
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addCard}
        className="w-full py-2 rounded-lg border border-dashed border-[#e5d6c0] text-[12px] text-foreground/70 hover:bg-[#fbf5eb]/50"
      >
        + 찬양 추가
      </button>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [form, setForm] = useState<BulletinForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [dateList, setDateList] = useState<BulletinListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const logged = window.localStorage.getItem("dasibonAdminLoggedIn") === "true";
    if (!logged) {
      router.replace("/admin/login");
      return;
    }
    setIsReady(true);
  }, [router]);

  useEffect(() => {
    if (!isReady) return;
    fetch("/api/bulletins")
      .then((res) => res.json())
      .then((data: BulletinListItem[]) => {
        if (Array.isArray(data)) setDateList(data);
      })
      .catch(() => setDateList([]));
  }, [isReady]);

  const loadBulletin = (date: string) => {
    if (!date) {
      setForm({ ...emptyForm, date: "" });
      return;
    }
    setLoading(true);
    setMessage("");
    fetch(`/api/bulletins?date=${encodeURIComponent(date)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((b) => {
        setForm({
          date: b.date,
          eventType: b.eventType ?? "주일 예배",
          time: b.time ?? "11:00",
          sermonTitleMain: b.sermonTitleMain ?? "",
          sermonTitleMainColor: b.sermonTitleMainColor ?? "#ffffff",
          sermonTitleSub: b.sermonTitleSub ?? "",
          sermonTitleSubColor: b.sermonTitleSubColor ?? "#ffffff",
          praises: b.praises ?? "",
          prayers: b.prayers ?? defaultPrayers,
          passage: b.passage ?? "",
          sermonDescription: b.sermonDescription ?? "",
          announcements: b.announcements ?? "",
          introBackgroundUrl: b.introBackgroundUrl ?? "",
          youtubeUrl: b.youtubeUrl ?? "",
        });
      })
      .catch(() => {
        setForm({ ...emptyForm, date });
        setMessage("해당 날짜 주보가 없어 새로 작성합니다.");
      })
      .finally(() => setLoading(false));
  };

  const handleChange =
    (field: keyof BulletinForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleRichChange = (field: keyof BulletinForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.date) {
      setMessage("날짜를 선택해 주세요.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/bulletins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error ?? "저장에 실패했습니다.");
        return;
      }
      setMessage("저장되었습니다.");
      setDateList((prev) => {
        const has = prev.some((x) => x.date === form.date);
        if (has) return prev.map((x) => (x.date === form.date ? { date: data.date, sermonTitleMain: data.sermonTitleMain ?? "", eventType: data.eventType ?? "주일 예배" } : x));
        return [{ date: data.date, sermonTitleMain: data.sermonTitleMain ?? "", eventType: data.eventType ?? "주일 예배" }, ...prev];
      });
    } catch {
      setMessage("저장 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.date) return;
    if (typeof window === "undefined" || !window.confirm(`"${form.date}" 주보를 삭제할까요?`)) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/bulletins/${encodeURIComponent(form.date)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data?.error ?? "삭제에 실패했습니다.");
        return;
      }
      setDateList((prev) => prev.filter((x) => x.date !== form.date));
      setForm(emptyForm);
      setMessage("삭제되었습니다.");
    } catch {
      setMessage("삭제 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl border border-[#e5d6c0] bg-[#fbf5eb]/95 shadow-lg px-6 py-6 space-y-4">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">주보 관리자</h1>
            <p className="text-[12px] text-foreground/60">
              날짜별로 찬양, 기도, 말씀, 광고 내용을 관리합니다.
            </p>
          </div>
          <button
            type="button"
            className="text-[11px] text-foreground/60 underline underline-offset-4"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.localStorage.removeItem("dasibonAdminLoggedIn");
              }
              router.replace("/");
            }}
          >
            로그아웃
          </button>
        </header>
        <div className="flex items-center gap-2">
          <a
            href={form.date ? `/?date=${encodeURIComponent(form.date)}` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] transition-colors ${
              form.date
                ? "border-[#c49a6c] bg-[#c49a6c]/10 text-[#8b6919] hover:bg-[#c49a6c]/20"
                : "cursor-not-allowed border-[#e5d6c0] text-foreground/50"
            }`}
            onClick={(e) => !form.date && e.preventDefault()}
          >
            주보 보기
          </a>
          {!form.date && (
            <span className="text-[11px] text-foreground/50">날짜를 선택하면 해당 일자 주보를 볼 수 있습니다.</span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <section className="text-[13px]">
            <label className="block mb-1 text-[12px] text-foreground/70">저장된 주보 선택</label>
            <select
              value={form.date || "__new__"}
              onChange={(e) => {
                const v = e.target.value;
                loadBulletin(v === "__new__" ? "" : v);
              }}
              disabled={loading}
              className="w-full rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#c49a6c]/60"
            >
              <option value="__new__">+ 새 주보 작성</option>
              {dateList.map((item) => (
                <option key={item.date} value={item.date}>
                  {item.date} {item.sermonTitleMain ? `- ${item.sermonTitleMain}` : ""}
                </option>
              ))}
            </select>
          </section>
          <section className="grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <label className="block mb-1 text-[12px] text-foreground/70">예배 날짜</label>
              <input
                type="date"
                value={form.date}
                onChange={handleChange("date")}
                className="w-full rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#c49a6c]/60"
              />
            </div>
            <div>
              <label className="block mb-1 text-[12px] text-foreground/70">예배 종류</label>
              <select
                value={form.eventType}
                onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value }))}
                className="w-full rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#c49a6c]/60"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[12px] text-foreground/70">예배 시간</label>
              <input
                type="time"
                value={form.time}
                onChange={handleChange("time")}
                className="w-full rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#c49a6c]/60"
              />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <label className="block mb-1 text-[12px] text-foreground/70">설교 제목 (메인)</label>
              <div className="flex gap-2 items-center">
                <ComposedInput
                  type="text"
                  value={form.sermonTitleMain}
                  onChange={(v) => setForm((prev) => ({ ...prev, sermonTitleMain: v }))}
                  className="flex-1 rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#c49a6c]/60"
                />
                <label className="flex items-center gap-1 shrink-0" title="제목 글자 색">
                  <input
                    type="color"
                    value={form.sermonTitleMainColor}
                    onChange={(e) => setForm((prev) => ({ ...prev, sermonTitleMainColor: e.target.value }))}
                    className="w-8 h-7 rounded border border-[#e0d0b8] cursor-pointer p-0 bg-white"
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block mb-1 text-[12px] text-foreground/70">설교 제목 (부제)</label>
              <div className="flex gap-2 items-center">
                <ComposedInput
                  type="text"
                  value={form.sermonTitleSub}
                  onChange={(v) => setForm((prev) => ({ ...prev, sermonTitleSub: v }))}
                  className="flex-1 rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#c49a6c]/60"
                />
                <label className="flex items-center gap-1 shrink-0" title="부제 글자 색">
                  <input
                    type="color"
                    value={form.sermonTitleSubColor}
                    onChange={(e) => setForm((prev) => ({ ...prev, sermonTitleSubColor: e.target.value }))}
                    className="w-8 h-7 rounded border border-[#e0d0b8] cursor-pointer p-0 bg-white"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 text-[13px]">
            <div className="space-y-2">
              <label className="block text-[12px] text-foreground/70">찬양 (카드 + 악보 이미지)</label>
              <PraisesCardEditor
                value={form.praises}
                onChange={(v) => setForm((prev) => ({ ...prev, praises: v }))}
              />
            </div>
            <div>
              <RichTextEditor
                label="주기도문"
                value={form.prayers}
                onChange={(v) => setForm((prev) => ({ ...prev, prayers: v }))}
                minHeight={140}
              />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <RichTextEditor
                label="말씀 (본문)"
                value={form.passage}
                onChange={(v) => setForm((prev) => ({ ...prev, passage: v }))}
                minHeight={120}
              />
            </div>
            <div>
              <RichTextEditor
                label="나눔 질문"
                value={form.sermonDescription}
                onChange={(v) => setForm((prev) => ({ ...prev, sermonDescription: v }))}
                minHeight={120}
              />
            </div>
          </section>

          <section className="text-[13px]">
            <RichTextEditor
              label="광고"
              value={form.announcements}
              onChange={(v) => setForm((prev) => ({ ...prev, announcements: v }))}
              placeholder="1. 소그룹 모임 안내 ...&#10;2. 이 달의 추천도서 ..."
              minHeight={160}
            />
          </section>

          <section className="space-y-2 text-[13px]">
            <label className="block text-[12px] text-foreground/70 font-medium">인트로 유튜브 링크</label>
            <p className="text-[12px] text-foreground/60">인트로 화면 우측 상단 유튜브 버튼을 눌렀을 때 이동할 주소를 입력하세요. 비워두면 버튼이 표시되지 않습니다.</p>
            <input
              type="url"
              value={form.youtubeUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
              placeholder="https://www.youtube.com/..."
              className="w-full rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#c49a6c]/60"
            />
          </section>

          <section className="space-y-2 text-[13px]">
            <label className="block text-[12px] text-foreground/70 font-medium">배경화면 이미지</label>
            <p className="text-[12px] text-foreground/60">인트로 화면에 표시할 배경 이미지를 선택하세요. 비워두면 기본 이미지를 사용합니다.</p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  id="intro-bg-file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.set("file", file);
                    try {
                      const res = await fetch("/api/upload", { method: "POST", body: formData });
                      const data = await res.json();
                      if (data?.url) {
                        const prev = form.introBackgroundUrl;
                        if (prev && (prev.startsWith("http") || prev.startsWith("/uploads"))) {
                          fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: prev }) }).catch(() => {});
                        }
                        setForm((prev) => ({ ...prev, introBackgroundUrl: data.url }));
                      }
                    } catch {
                      // ignore
                    }
                    e.target.value = "";
                  }}
                />
                <label
                  htmlFor="intro-bg-file"
                  className="inline-block rounded-md border border-[#c49a6c] bg-[#fbf5eb] px-4 py-2 text-[13px] text-foreground/90 cursor-pointer hover:bg-[#f5ebe0]"
                >
                  이미지 선택
                </label>
              </div>
              {form.introBackgroundUrl ? (
                <>
                  <div className="rounded-lg border border-[#e5d6c0] overflow-hidden w-24 h-14 bg-[#fbf5eb] shrink-0">
                    <img src={form.introBackgroundUrl} alt="배경 미리보기" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (form.introBackgroundUrl.startsWith("http") || form.introBackgroundUrl.startsWith("/uploads")) {
                        fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: form.introBackgroundUrl }) }).catch(() => {});
                      }
                      setForm((prev) => ({ ...prev, introBackgroundUrl: "" }));
                    }}
                    className="text-[12px] text-red-600 underline"
                  >
                    제거
                  </button>
                </>
              ) : null}
            </div>
          </section>

          <div className="pt-2 flex items-center justify-between gap-3 text-[12px] flex-wrap">
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-[#c49a6c] px-6 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-[#b48857] transition-colors disabled:opacity-60"
              >
                저장
              </button>
              {form.date && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="rounded-full border border-red-300 text-red-700 px-4 py-2 text-[13px] hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  삭제
                </button>
              )}
            </div>
            {message && <span className="text-foreground/70">{message}</span>}
          </div>
        </form>
      </div>
    </main>
  );
}

