"use client";

import { useEffect, useRef, useState } from "react";

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
  const [isComposing, setIsComposing] = useState(false);
  const lastValueRef = useRef(value);

  useEffect(() => {
    if (!ref.current || isComposing) return;
    if (lastValueRef.current === value) return;
    lastValueRef.current = value;
    ref.current.innerHTML = value || "";
  }, [value, isComposing]);

  const handleInput = () => {
    if (!ref.current) return;
    if (isComposing) return;
    const html = ref.current.innerHTML;
    lastValueRef.current = html;
    onChange(html);
  };

  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
    setIsComposing(false);
    if (ref.current) {
      const html = ref.current.innerHTML;
      lastValueRef.current = html;
      onChange(html);
    }
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
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-foreground/60 mb-1">
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
        <label className="flex items-center gap-1 shrink-0 cursor-pointer" title="글자 색상">
          <span className="text-[10px] text-foreground/50">색상</span>
          <input
            type="color"
            className="w-6 h-5 rounded border border-[#e0d0b8] cursor-pointer p-0 bg-white"
            defaultValue="#1a1a1a"
            onChange={(e) => exec("foreColor", e.target.value)}
          />
        </label>
        <label className="flex items-center gap-1 shrink-0" title="글자 크기 (1~7)">
          <span className="text-[10px] text-foreground/50">크기</span>
          <input
            type="number"
            min={1}
            max={7}
            defaultValue={3}
            className="w-9 h-6 rounded border border-[#e0d0b8] bg-white/90 px-1 text-center text-[11px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            onChange={(e) => {
              const n = Math.min(7, Math.max(1, Number(e.target.value) || 3));
              e.target.value = String(n);
              exec("fontSize", String(n));
            }}
          />
        </label>
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
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      />
    </div>
  );
}

