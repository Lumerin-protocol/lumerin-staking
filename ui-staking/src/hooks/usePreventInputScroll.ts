import { useEffect, useRef } from "react";

/** Prevents numeric input scroll */
export function usePreventInputScroll() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const preventInputScroll = (e: WheelEvent) => e.preventDefault();
    inputRef.current?.addEventListener("wheel", preventInputScroll);

    return () => {
      inputRef.current?.removeEventListener("wheel", preventInputScroll);
    };
  });

  return inputRef;
}
