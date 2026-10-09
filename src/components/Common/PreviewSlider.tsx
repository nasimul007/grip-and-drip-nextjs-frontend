"use client";
import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useAppSelector } from "@/redux/store";
import { CloseIcon } from "./icons";

const arrowClass =
  "absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-11 h-11 rounded-full bg-brand-card/90 border border-brand-border text-white hover:text-brand-accent hover:border-brand-accent";

const PreviewSliderModal = () => {
  const { closePreviewModal, isModalPreviewOpen, startIndex } = usePreviewSlider();
  const product = useAppSelector((state) => state.productDetailsReducer.value);
  const swiperRef = useRef<SwiperType | null>(null);

  const images: string[] = (product?.imgs?.previews || []).filter(Boolean);
  const title = product?.title || "Product";

  // Open on the image the shopper was looking at.
  useEffect(() => {
    if (isModalPreviewOpen) swiperRef.current?.slideTo(startIndex, 0);
  }, [isModalPreviewOpen, startIndex, images.length]);

  useEffect(() => {
    if (!isModalPreviewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreviewModal();
      if (e.key === "ArrowLeft") swiperRef.current?.slidePrev();
      if (e.key === "ArrowRight") swiperRef.current?.slideNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isModalPreviewOpen, closePreviewModal]);

  const handlePrev = useCallback(() => swiperRef.current?.slidePrev(), []);
  const handleNext = useCallback(() => swiperRef.current?.slideNext(), []);

  if (!isModalPreviewOpen || images.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} images`}
      className="fixed inset-0 z-999999 flex items-center justify-center bg-[#000000F2]"
      onClick={(e) => {
        // Click on the dark backdrop (not on an image or button) closes.
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.backdrop) {
          closePreviewModal();
        }
      }}
    >
      <button
        type="button"
        onClick={closePreviewModal}
        aria-label="Close image preview"
        className="absolute top-3 right-3 sm:top-6 sm:right-6 z-20 flex items-center justify-center w-11 h-11 rounded-full text-white hover:text-brand-accent"
      >
        <CloseIcon size={28} />
      </button>

      {images.length > 1 && (
        <>
          <button type="button" onClick={handlePrev} aria-label="Previous image" className={`${arrowClass} left-2 sm:left-6`}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" onClick={handleNext} aria-label="Next image" className={`${arrowClass} right-2 sm:right-6`}>
            <span aria-hidden="true">›</span>
          </button>
        </>
      )}

      <Swiper
        onSwiper={(s) => {
          swiperRef.current = s;
          s.slideTo(startIndex, 0);
        }}
        initialSlide={startIndex}
        slidesPerView={1}
        spaceBetween={20}
        className="w-full h-full"
      >
        {images.map((src, i) => (
          <SwiperSlide key={src} data-backdrop="true">
            <div
              data-backdrop="true"
              className="relative w-full h-[100dvh] flex items-center justify-center p-4 sm:p-16"
            >
              <div className="relative w-full h-full max-w-[1000px]">
                <Image
                  src={src}
                  alt={`${title} – image ${i + 1} of ${images.length}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority={i === startIndex}
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {images.length > 1 && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-custom-sm text-white/80" aria-hidden="true">
          Swipe or use arrow keys
        </p>
      )}
    </div>
  );
};

export default PreviewSliderModal;
