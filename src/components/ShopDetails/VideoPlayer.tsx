"use client";
import React, { useState } from "react";
import { useT } from "@/lib/i18n/client";

type Parsed = { kind: "youtube" | "vimeo" | "file" | "link"; src: string };

export function parseVideoUrl(url: string): Parsed {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return { kind: "youtube", src: u.pathname.slice(1) };
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const id = u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop() || "";
      if (id) return { kind: "youtube", src: id };
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop() || "";
      if (/^\d+$/.test(id)) return { kind: "vimeo", src: id };
    }
    if (/\.(mp4|webm|ogg)$/i.test(u.pathname)) return { kind: "file", src: url };
  } catch {
    /* fall through */
  }
  return { kind: "link", src: url };
}

/** Shows a play button first; the player (and its network requests) is only created after a click. */
export default function VideoPlayer({ url, title }: { url: string; title: string }) {
  const { t } = useT();
  const [playing, setPlaying] = useState(false);
  const video = parseVideoUrl(url);

  if (video.kind === "link") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white hover:text-brand-accent">
        <PlayIcon />
        <span className="text-sm">{t("Watch video")}</span>
      </a>
    );
  }

  if (!playing) {
    return (
      <button type="button" onClick={() => setPlaying(true)} aria-label={`${t("Play video")}: ${title}`} className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white hover:text-brand-accent">
        <PlayIcon />
        <span className="text-sm">{t("Play video")}</span>
      </button>
    );
  }

  if (video.kind === "file") {
    return <video src={video.src} controls autoPlay playsInline className="absolute inset-0 h-full w-full rounded-lg bg-black object-contain" aria-label={title} />;
  }
  const src =
    video.kind === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.src)}?autoplay=1&rel=0`
      : `https://player.vimeo.com/video/${encodeURIComponent(video.src)}?autoplay=1`;
  return (
    <iframe
      src={src}
      title={title}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      className="absolute inset-0 h-full w-full rounded-lg border-0"
    />
  );
}

export function PlayIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
      <path d="M20 16l14 8-14 8V16z" fill="currentColor" />
    </svg>
  );
}
