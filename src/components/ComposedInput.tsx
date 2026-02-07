"use client";

import { useState, useRef, useEffect } from "react";

type Props = Omit<React.ComponentPropsWithoutRef<"input">, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

/**
 * 한글 등 IME 조합 중에는 상위 state를 건드리지 않아 조합이 깨지지 않도록 하는 input
 */
export default function ComposedInput({ value, onChange, ...rest }: Props) {
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
