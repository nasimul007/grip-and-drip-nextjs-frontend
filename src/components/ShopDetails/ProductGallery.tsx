"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import FallbackImage from "@/components/Common/FallbackImage";
import { ChevronDownIcon } from "@/components/Common/icons";
import VideoPlayer, { PlayIcon } from "./VideoPlayer";
import { useT } from "@/lib/i18n/client";

type Props = {
  images: string[];
  alt: string;
  selected: number;
  onSelect: (index: number) => void;
  onZoom: () => void;
  /** Optional product video, shown as the last gallery item. */
  videoUrl?: string;
};

const THUMB = 64; // px
const GAP = 8; // px
const VISIBLE = 5; // thumbnails visible at once in the vertical strip

/**
 * Left vertical thumbnail slider (up/down arrows) + fixed 400x400 main image.
 * On phones the thumbnails become a swipeable row below the image.
 */
export default function ProductGallery({ images, alt, selected, onSelect, onZoom, videoUrl }: Props) {
  const { t } = useT();
  const videoIndex = videoUrl ? images.length : -1;
  const total = images.length + (videoUrl ? 1 : 0);
  const onVideo = selected === videoIndex;
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });
  const needsArrows = total > VISIBLE;

  const updateEdges = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    setEdge({
      start: el.scrollTop <= 1,
      end: el.scrollTop + el.clientHeight >= el.scrollHeight - 1,
    });
  }, []);

  useEffect(() => {
    updateEdges();
    const el = stripRef.current;
    el?.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el?.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges, total]);

  // Keep the selected thumbnail visible; scroll only the strip, never the page.
  useEffect(() => {
    const box = stripRef.current;
    const el = box?.children[selected] as HTMLElement | undefined;
    if (!box || !el) return;
    if (el.offsetTop < box.scrollTop) box.scrollTop = el.offsetTop;
    else if (el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight)
      box.scrollTop = el.offsetTop + el.offsetHeight - box.clientHeight;
    if (el.offsetLeft < box.scrollLeft) box.scrollLeft = el.offsetLeft;
    else if (el.offsetLeft + el.offsetWidth > box.scrollLeft + box.clientWidth)
      box.scrollLeft = el.offsetLeft + el.offsetWidth - box.clientWidth;
  }, [selected]);

  const step = (dir: 1 | -1) =>
    stripRef.current?.scrollBy({ top: dir * (THUMB + GAP), behavior: "smooth" });

  const arrow =
    "hidden sm:flex items-center justify-center h-6 w-full rounded text-brand-muted hover:text-brand-accent disabled:opacity-30 disabled:hover:text-brand-muted disabled:cursor-default";

  return (
    <div className="w-full lg:w-auto lg:shrink-0 flex flex-col sm:flex-row gap-3 lg:self-start">
      {total > 1 && (
        <div className="order-last sm:order-first sm:w-16 sm:h-[400px] flex flex-col shrink-0">
          {needsArrows && (
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={edge.start}
              aria-label={t("Show previous thumbnails")}
              className={arrow}
            >
              <ChevronDownIcon className="rotate-180" size={18} />
            </button>
          )}
          <div
            ref={stripRef}
            className={`relative flex sm:flex-col gap-2 overflow-x-auto sm:overflow-x-hidden sm:overflow-y-auto no-scrollbar ${
              needsArrows ? "sm:flex-1 sm:min-h-0" : "sm:h-full"
            }`}
          >
            {images.map((src, i) => (
              <button
                type="button"
                key={`${src}-${i}`}
                onClick={() => onSelect(i)}
                aria-label={t("Show image {n} of {total}", { n: i + 1, total: images.length })}
                aria-pressed={i === selected}
                className={`relative w-16 h-16 shrink-0 overflow-hidden rounded-md bg-brand-surface border-2 ease-out duration-200 hover:border-brand-accent ${
                  i === selected ? "border-brand-accent" : "border-brand-border"
                }`}
              >
                <FallbackImage src={src} alt="" fallbackLabel="" fill sizes="64px" className="object-contain p-1" />
              </button>
            ))}
            {videoUrl && (
              <button
                type="button"
                onClick={() => onSelect(videoIndex)}
                aria-label={t("Show product video")}
                aria-pressed={onVideo}
                className={`relative flex w-16 h-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-brand-surface border-2 text-brand-accent ease-out duration-200 hover:border-brand-accent ${
                  onVideo ? "border-brand-accent" : "border-brand-border"
                }`}
              >
                <PlayIcon size={28} />
              </button>
            )}
          </div>
          {needsArrows && (
            <button
              type="button"
              onClick={() => step(1)}
              disabled={edge.end}
              aria-label={t("Show next thumbnails")}
              className={arrow}
            >
              <ChevronDownIcon size={18} />
            </button>
          )}
        </div>
      )}

      <div
        className="relative shrink-0 w-full max-w-[400px] sm:w-[400px] aspect-square sm:h-[400px] rounded-lg border border-brand-border bg-brand-surface touch-pan-y select-none"
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") return;
          swipe.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const start = swipe.current;
          swipe.current = null;
          if (!start || total < 2 || onVideo) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            onSelect(dx < 0 ? (selected + 1) % total : (selected - 1 + total) % total);
          }
        }}
        onPointerCancel={() => (swipe.current = null)}
      >
        {images.length > 0 && !onVideo && (
          <button
            type="button"
            onClick={onZoom}
            aria-label={t("Zoom product images")}
            className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-[5px] border border-brand-border bg-brand-card text-white ease-out duration-200 hover:text-brand-accent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M20 20l-3.5-3.5M11 8v6M8 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {onVideo && videoUrl ? (
          <VideoPlayer key={videoUrl} url={videoUrl} title={alt} />
        ) : images[selected] ? (
          <div className="absolute inset-4 sm:inset-6">
            <FallbackImage
              src={images[selected]}
              alt={alt}
              fill
              priority
              sizes="(max-width: 640px) 90vw, 400px"
              className="object-contain"
            />
          </div>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-brand-muted">
            {t("No image available")}
          </span>
        )}
      </div>
    </div>
  );
}
