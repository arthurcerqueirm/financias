"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
};

export default function CountUp({ value, duration = 1000, format, className }: Props) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>();
  const startRef = useRef<number>();
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = undefined;
    const from = fromRef.current;
    const delta = value - from;

    const tick = (t: number) => {
      if (startRef.current === undefined) startRef.current = t;
      const elapsed = t - startRef.current;
      const p = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + delta * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const text = format ? format(display) : Math.round(display).toLocaleString("pt-BR");
  return <span className={className}>{text}</span>;
}
