"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // TODO: 나중에 실제 인증(NextAuth/DB)으로 교체
    if (userId === "admin" && password === "dasibon123") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("dasibonAdminLoggedIn", "true");
      }
      router.push("/admin");
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="w-full max-w-sm rounded-2xl border border-[#e5d6c0] bg-[#fbf5eb]/95 shadow-lg px-6 py-7">
        <h1 className="text-lg font-semibold text-center text-foreground">
          관리자 로그인
        </h1>
        <p className="mt-1 text-[12px] text-center text-foreground/60">
          주보 내용을 수정하려면 로그인이 필요합니다.
        </p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-[12px] text-foreground/70">아이디</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#c49a6c]/60"
              autoComplete="username"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[12px] text-foreground/70">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#c49a6c]/60"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-[12px] text-red-600 mt-1 text-center">{error}</p>
          )}
          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-[#c49a6c] px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-[#b48857] transition-colors"
          >
            로그인
          </button>
        </form>
      </div>
    </main>
  );
}

