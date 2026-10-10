"use client";
import { useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperRef } from "swiper/react";
import type { BrandCount } from "@/lib/brands";

import "swiper/css";

const arrowClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-brand-card text-brand-muted ease-out duration-200 hover:border-brand-accent hover:text-brand-accent";

const BrandCarousel = ({ brands }: { brands: BrandCount[] }) => {
  const sliderRef = useRef<SwiperRef>(null);

  // Loop mode needs more slides than are visible; repeat short lists to fill it.
  const slides = useMemo(() => {
    const out: BrandCount[] = [];
    while (out.length < 12) out.push(...brands);
    return out;
  }, [brands]);

  return (
    <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
      <div className="mb-5 flex items-center justify-between">
        <h2 id="brands-heading" className="font-semibold text-xl xl:text-heading-5 text-white">
          Shop by brand
        </h2>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Previous brands" className={arrowClass} onClick={() => sliderRef.current?.swiper.slidePrev()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button type="button" aria-label="Next brands" className={arrowClass} onClick={() => sliderRef.current?.swiper.slideNext()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <Swiper
        ref={sliderRef}
        loop={true}
        speed={400}
        slidesPerView={2}
        spaceBetween={12}
        breakpoints={{
          640: { slidesPerView: 3 },
          1000: { slidesPerView: 4 },
          1200: { slidesPerView: 6 },
        }}
      >
        {slides.map((b, i) => (
          <SwiperSlide key={`${b.name}-${i}`}>
            <Link
              href={`/shop?brand=${encodeURIComponent(b.name)}`}
              className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-brand-border bg-brand-card px-4 py-4 text-center ease-out duration-200 hover:border-brand-accent"
            >
              {b.logo ? (
                <Image src={b.logo} alt="" width={80} height={40} className="h-10 w-auto max-w-full object-contain" unoptimized />
              ) : null}
              <span className="font-semibold text-white">{b.name}</span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BrandCarousel;
