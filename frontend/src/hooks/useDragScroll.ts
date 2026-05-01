import { useRef, useState, useCallback, useEffect } from "react";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const active = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => setIsScrollable(el.scrollWidth > el.clientWidth);
    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    active.current = true;
    setDragging(true);
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!active.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    ref.current.scrollLeft = scrollLeft.current - (x - startX.current);
  }, []);

  const stop = useCallback(() => {
    active.current = false;
    setDragging(false);
  }, []);

  return {
    ref,
    isScrollable,
    dragging,
    onMouseDown,
    onMouseMove,
    onMouseUp: stop,
    onMouseLeave: stop,
  };
}
