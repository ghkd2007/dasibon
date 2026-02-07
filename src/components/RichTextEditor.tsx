"use client";

import { useEffect, useRef } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 120,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = value || "";
  }, [value]);

  const handleInput = () => {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
  };

  const exec = (command: string, valueArg?: string) => {
    if (!ref.current) return;
    ref.current.focus();
    try {
      document.execCommand(command, false, valueArg);
      handleInput();
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    onChange("");
  };

  return (
    <div className="space-y-1 text-[13px]">
      <label className="block text-[12px] text-foreground/70 mb-0.5">
        {label}
      </label>
      <div className="flex items-center gap-1 text-[11px] text-foreground/60 mb-1">
        <button
          type="button"
          className="px-2 py-[1px] rounded-full border border-[#e0d0b8] bg-white/90 text-[11px] font-semibold"
          onClick={() => exec("bold")}
        >
          B
        </button>
        <button
          type="button"
          className="px-2 py-[1px] rounded-full border border-[#e0d0b8] bg-white/90 text-[11px] italic"
          onClick={() => exec("italic")}
        >
          I
        </button>
        <button
          type="button"
          className="px-2 py-[1px] rounded-full border border-[#e0d0b8] bg-white/90 text-[11px] underline"
          onClick={() => exec("underline")}
        >
          U
        </button>
        <button
          type="button"
          className="px-2 py-[1px] rounded-full border border-[#e0d0b8] bg-white/90 text-[10px]"
          onClick={() => exec("insertUnorderedList")}
        >
          • 목록
        </button>
        <button
          type="button"
          className="px-2 py-[1px] rounded-full border border-[#e0d0b8] bg-white/90 text-[10px]"
          onClick={() => exec("justifyLeft")}
        >
          ⬅
        </button>
        <button
          type="button"
          className="px-2 py-[1px] rounded-full border border-[#e0d0b8] bg-white/90 text-[10px]"
          onClick={() => exec("justifyCenter")}
        >
          ⬌
        </button>
        <button
          type="button"
          className="px-2 py-[1px] rounded-full border border-[#e0d0b8] bg-white/90 text-[10px]"
          onClick={() => exec("justifyRight")}
        >
          ➡
        </button>
        <button
          type="button"
          className="px-2 py-[1px] rounded-full border border-[#e0d0b8] bg-white/90 text-[10px]"
          onClick={() => exec("fontSize", "2")}
        >
          A-
        </button>
        <button
          type="button"
          className="px-2 py-[1px] rounded-full border border-[#e0d0b8] bg-white/90 text-[10px]"
          onClick={() => exec("fontSize", "4")}
        >
          A+
        </button>
        <button
          type="button"
          className="ml-auto px-2 py-[1px] rounded-full border border-transparent text-[10px] text-foreground/50 hover:border-[#e0d0b8]"
          onClick={handleClear}
        >
          지우기
        </button>
      </div>
      <div
        ref={ref}
        className="w-full rounded-md border border-[#e5d6c0] bg-white/90 px-3 py-2 text-[13px] outline-none focus-within:ring-2 focus-within:ring-[#c49a6c]/60 whitespace-pre-wrap overflow-y-auto"
        style={{ minHeight, textAlign: "left", direction: "ltr" }}
        contentEditable
        data-placeholder={placeholder}
        onInput={handleInput}
      />
    </div>
  );
}

