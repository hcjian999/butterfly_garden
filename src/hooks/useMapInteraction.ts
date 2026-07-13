import { useState, useCallback, useRef } from 'react';

export const SVG_WIDTH = 2046;
export const SVG_HEIGHT = 1328;

export interface ViewState {
  tx: number;
  ty: number;
  scale: number;
}

interface ViewBoxParams {
  ratio: number;
  offsetX: number;
  offsetY: number;
}

function getViewBoxParams(el: HTMLElement): ViewBoxParams | null {
  const rect = el.getBoundingClientRect();
  const elW = rect.width;
  const elH = rect.height;
  if (elW === 0 || elH === 0) return null;
  const ratio = Math.min(elW / SVG_WIDTH, elH / SVG_HEIGHT);
  const offsetX = (elW - SVG_WIDTH * ratio) / 2;
  const offsetY = (elH - SVG_HEIGHT * ratio) / 2;
  return { ratio, offsetX, offsetY };
}

export function useMapInteraction() {
  const [view, setView] = useState<ViewState>({ tx: 0, ty: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number }>({ x: 0, y: 0, tx: 0, ty: 0 });
  const pinchDist = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapMoved = useRef(false);

  const screenToSVG = useCallback(
    (screenX: number, screenY: number): { x: number; y: number } | null => {
      const el = containerRef.current;
      if (!el) return null;
      const vb = getViewBoxParams(el);
      if (!vb) return null;
      const rect = el.getBoundingClientRect();
      const px = screenX - rect.left;
      const py = screenY - rect.top;
      const vbx = (px - vb.offsetX) / vb.ratio;
      const vby = (py - vb.offsetY) / vb.ratio;
      return { x: (vbx - view.tx) / view.scale, y: (vby - view.ty) / view.scale };
    },
    [view.tx, view.ty, view.scale]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const vb = getViewBoxParams(el);
    if (!vb) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const vbx = (px - vb.offsetX) / vb.ratio;
    const vby = (py - vb.offsetY) / vb.ratio;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setView((v) => {
      const newScale = Math.max(0.15, Math.min(8, v.scale * delta));
      const sRatio = newScale / v.scale;
      return {
        tx: vbx - (vbx - v.tx) * sRatio,
        ty: vby - (vby - v.ty) * sRatio,
        scale: newScale,
      };
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    mapMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
  }, [view.tx, view.ty]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    mapMoved.current = true;
    const el = containerRef.current;
    if (!el) return;
    const vb = getViewBoxParams(el);
    if (!vb) return;
    const dx = (e.clientX - dragStart.current.x) / vb.ratio;
    const dy = (e.clientY - dragStart.current.y) / vb.ratio;
    setView((v) => ({
      ...v,
      tx: dragStart.current.tx + dx,
      ty: dragStart.current.ty + dy,
    }));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const zoomIn = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const vb = getViewBoxParams(el);
    if (!vb) return;
    const rect = el.getBoundingClientRect();
    const cx = (rect.width / 2 - vb.offsetX) / vb.ratio;
    const cy = (rect.height / 2 - vb.offsetY) / vb.ratio;
    const sRatio = 1.2;
    setView((v) => {
      const newScale = Math.min(8, v.scale * sRatio);
      return {
        tx: cx - (cx - v.tx) * (newScale / v.scale),
        ty: cy - (cy - v.ty) * (newScale / v.scale),
        scale: newScale,
      };
    });
  }, []);

  const zoomOut = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const vb = getViewBoxParams(el);
    if (!vb) return;
    const rect = el.getBoundingClientRect();
    const cx = (rect.width / 2 - vb.offsetX) / vb.ratio;
    const cy = (rect.height / 2 - vb.offsetY) / vb.ratio;
    const sRatio = 1 / 1.2;
    setView((v) => {
      const newScale = Math.max(0.15, v.scale * sRatio);
      return {
        tx: cx - (cx - v.tx) * (newScale / v.scale),
        ty: cy - (cy - v.ty) * (newScale / v.scale),
        scale: newScale,
      };
    });
  }, []);

  const resetView = useCallback(() => {
    setView({ tx: 0, ty: 0, scale: 1 });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      pinchDist.current = 0;
      mapMoved.current = false;
      dragStart.current = { x: touch.clientX, y: touch.clientY, tx: view.tx, ty: view.ty };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      pinchDist.current = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      dragStart.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        tx: view.tx,
        ty: view.ty,
      };
    }
  }, [view.tx, view.ty]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      mapMoved.current = true;
      const el = containerRef.current;
      if (!el) return;
      const vb = getViewBoxParams(el);
      if (!vb) return;
      const dx = (touch.clientX - dragStart.current.x) / vb.ratio;
      const dy = (touch.clientY - dragStart.current.y) / vb.ratio;
      setView((v) => ({
        ...v,
        tx: dragStart.current.tx + dx,
        ty: dragStart.current.ty + dy,
      }));
    } else if (e.touches.length === 2 && pinchDist.current > 0) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const scaleFactor = dist / pinchDist.current;
      pinchDist.current = dist;
      const midX = (t0.clientX + t1.clientX) / 2;
      const midY = (t0.clientY + t1.clientY) / 2;
      const el = containerRef.current;
      if (!el) return;
      const vb = getViewBoxParams(el);
      if (!vb) return;
      const rect = el.getBoundingClientRect();
      const vbx = (midX - rect.left - vb.offsetX) / vb.ratio;
      const vby = (midY - rect.top - vb.offsetY) / vb.ratio;
      setView((v) => {
        const newScale = Math.max(0.15, Math.min(8, v.scale * scaleFactor));
        const ratio = newScale / v.scale;
        return {
          tx: vbx - (vbx - v.tx) * ratio,
          ty: vby - (vby - v.ty) * ratio,
          scale: newScale,
        };
      });
    }
  }, [isDragging]);

  const centerOn = useCallback((svgX: number, svgY: number) => {
    setView((v) => {
      const el = containerRef.current;
      if (!el) return v;
      const vb = getViewBoxParams(el);
      if (!vb) return v;
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const svgCx = (cx - vb.offsetX) / vb.ratio;
      const svgCy = (cy - vb.offsetY) / vb.ratio;
      return {
        tx: svgCx - svgX * v.scale,
        ty: svgCy - svgY * v.scale,
        scale: v.scale,
      };
    });
  }, []);

  return {
    view,
    containerRef,
    isDragging,
    screenToSVG,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    resetView,
    mapMoved,
    centerOn,
    handleTouchStart,
    handleTouchMove,
  };
}
