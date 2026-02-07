"use client";

import { FormEvent, useEffect, useState } from "react";
import RichTextEditor from "@/components/RichTextEditor";
import { useRouter } from "next/navigation";

type BulletinForm = {
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

const defaultPrayers =
  "하늘에 계신 우리 아버지, 아버지의 이름을 거룩하게 하시며,\n아버지의 나라가 오게 하시며, 아버지의 뜻이 하늘에서와 같이 땅에서도 이루어지게 하소서.\n오늘 우리에게 일용할 양식을 주시고, 우리가 우리에게 잘못한 사람을 용서해 준 것 같이 우리 죄를 용서해 주시고,\n우리를 시험에 빠지지 않게 하시고 악에서 구하소서.\n\n나라와 권능과 영광이 영원히 아버지의 것입니다. 아멘.";

const emptyForm: BulletinForm = {
  date: "",
  time: "11:00",
  sermonTitleMain: "",
  sermonTitleSub: "",
  praises: "",
  prayers: defaultPrayers,
  passage: "",
  sermonDescription: "",
  commitment: "",
  announcements: "",
};

type BulletinListItem = { date: string; sermonTitleMain: string };

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
          time: b.time ?? "11:00",
          sermonTitleMain: b.sermonTitleMain ?? "",
          sermonTitleSub: b.sermonTitleSub ?? "",
          praises: b.praises ?? "",
          prayers: b.prayers ?? defaultPrayers,
          passage: b.passage ?? "",
          sermonDescription: b.sermonDescription ?? "",
          commitment: b.commitment ?? "",
          announcements: b.announcements ?? "",
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
        if (has) return prev.map((x) => (x.date === form.date ? { date: data.date, sermonTitleMain: data.sermonTitleMain ?? "" } : x));
        return [{ date: data.date, sermonTitleMain: data.sermonTitleMain ?? "" }, ...prev];
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
              <input
                type="text"
                value={form.sermonTitleMain}
                onChange={handleChange("sermonTitleMain")}
                className="w-full rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#c49a6c]/60"
              />
            </div>
            <div>
              <label className="block mb-1 text-[12px] text-foreground/70">설교 제목 (부제)</label>
              <input
                type="text"
                value={form.sermonTitleSub}
                onChange={handleChange("sermonTitleSub")}
                className="w-full rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#c49a6c]/60"
              />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <RichTextEditor
                label="찬양 목록 (한 줄에 한 곡)"
                value={form.praises}
                onChange={(v) => handleRichChange("praises", v)}
                placeholder={"# 찬양하세\n# 풀은 마르고 꽃은 시드나\n..."}
                minHeight={120}
              />
            </div>
            <div>
              <RichTextEditor
                label="기도 (예: 주기도문)"
                value={form.prayers}
                onChange={(v) => handleRichChange("prayers", v)}
                minHeight={120}
              />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <label className="block mb-1 text-[12px] text-foreground/70">본문(BIBLE PASSAGE)</label>
              <input
                type="text"
                value={form.passage}
                onChange={handleChange("passage")}
                className="w-full rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#c49a6c]/60"
              />
            </div>
            <div>
              <RichTextEditor
                label="설교 설명"
                value={form.sermonDescription}
                onChange={(v) => handleRichChange("sermonDescription", v)}
                minHeight={100}
              />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <RichTextEditor
                label="헌신(COMMITMENT) 내용"
                value={form.commitment}
                onChange={(v) => handleRichChange("commitment", v)}
                minHeight={100}
              />
            </div>
            <div>
              <label className="block mb-1 text-[12px] text-foreground/70">
                광고(ANNOUNCEMENTS) 텍스트
              </label>
              <textarea
                rows={6}
                value={form.announcements}
                onChange={handleChange("announcements")}
                placeholder={"1. 소그룹 모임 안내 ...\n2. 이 달의 추천도서 ..."}
                className="w-full rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#c49a6c]/60 whitespace-pre-wrap"
              />
            </div>
          </section>

          <section className="text-[12px] text-foreground/60">
            <p className="font-medium mb-1">이미지 관리 (향후 구현 예정)</p>
            <p>
              인트로/배경, 찬양 악보 이미지는 다음 단계에서 업로드 기능과 함께 연결할 예정입니다.
              현재는 텍스트만 관리됩니다.
            </p>
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

