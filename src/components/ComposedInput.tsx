"use client";

import { useState, useRef, useEffect } from "react";

type InputProps = Omit<React.ComponentPropsWithoutRef<"input">, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

type TextareaProps = Omit<React.ComponentPropsWithoutRef<"textarea">, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

/**
 * 한글 등 IME 조합 중에는 상위 state를 건드리지 않아 조합이 깨지지 않도록 하는 input
 */
export default function ComposedInput({ value, onChange, ...rest }: InputProps) {
  const [localValue, setLocalValue] = useState(value);
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (!isComposingRef.current) {
      setLocalValue(value);
    }
  }, [value]);

  return (
    <input
      {...rest}
      value={isComposingRef.current ? localValue : value}
      onCompositionStart={() => {
        isComposingRef.current = true;
        setLocalValue(value);
      }}
      onCompositionEnd={(e) => {
        isComposingRef.current = false;
        const v = (e.target as HTMLInputElement).value;
        setLocalValue(v);
        onChange(v);
      }}
      onChange={(e) => {
        const v = e.target.value;
        if (!isComposingRef.current) {
          onChange(v);
        } else {
          setLocalValue(v);
        }
      }}
    />
  );
}

/**
 * 줄바꿈 허용 textarea, 한글 IME 조합 지원
 */
export function ComposedTextarea({ value, onChange, ...rest }: TextareaProps) {
  const [localValue, setLocalValue] = useState(value);
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (!isComposingRef.current) {
      setLocalValue(value);
    }
  }, [value]);

  return (
    <textarea
      {...rest}
      value={isComposingRef.current ? localValue : value}
      onCompositionStart={() => {
        isComposingRef.current = true;
        setLocalValue(value);
      }}
      onCompositionEnd={(e) => {
        isComposingRef.current = false;
        const v = (e.target as HTMLTextAreaElement).value;
        setLocalValue(v);
        onChange(v);
      }}
      onChange={(e) => {
        const v = e.target.value;
        if (!isComposingRef.current) {
          onChange(v);
        } else {
          setLocalValue(v);
        }
      }}
    />
  );
}
