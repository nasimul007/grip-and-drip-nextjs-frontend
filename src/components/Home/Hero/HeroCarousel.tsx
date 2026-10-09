"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import Link from "next/link";

const HeroCarousal = () => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      <SwiperSlide>
        <div className="flex items-center justify-between gap-2">
            <div className="max-w-[394px] py-6 sm:py-10 lg:py-16 pl-4 sm:pl-7.5 lg:pl-12.5 pb-9">
            <p className="text-custom-sm font-medium text-brand-accent mb-2 sm:mb-4">
              Genuine gadgets · Cash on delivery
            </p>

            <h1 className="font-semibold text-white text-lg sm:text-3xl mb-2 sm:mb-3">
              <Link href="/shop">
                Welcome to Gadget & Widget
              </Link>
            </h1>

            <p className="hidden sm:block text-[#A0A0A8]">
              Bangladesh&apos;s premier destination for authentic tech accessories.
              Genuine chargers, earbuds, smartwatches and more with cash on delivery across Bangladesh.
            </p>

            <Link
              href="/shop"
              className="inline-flex font-medium text-brand-dark text-custom-sm rounded-md bg-brand-accent py-2 px-5 sm:py-3 sm:px-9 ease-out duration-200 hover:bg-brand-hover mt-3 sm:mt-6"
            >
              Explore Now
            </Link>
          </div>

          <div>
            <Image
              src="/images/hero/hero-05.png"
              alt="Gadgets and accessories from Gadget & Widget"
              priority
              width={351}
              height={358}
              className="w-28 sm:w-auto h-auto pr-3 sm:pr-0"
            />
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="flex items-center justify-between gap-2">
          <div className="max-w-[394px] py-6 sm:py-10 lg:py-16 pl-4 sm:pl-7.5 lg:pl-12.5 pb-9">
            <div className="flex items-center gap-3 mb-5 sm:mb-7.5">
              <span className="block font-semibold text-2xl sm:text-heading-1 text-brand-accent">
                New
              </span>
              <span className="block text-white text-sm sm:text-custom-1 sm:leading-[24px]">
                Tech
                <br />
                Arrivals
              </span>
            </div>

            <h2 className="font-semibold text-white text-lg sm:text-3xl mb-2 sm:mb-3">
              <Link href="/shop">
                Premium Chargers & Cables
              </Link>
            </h2>

            <p className="hidden sm:block text-[#A0A0A8]">
              Fast charging solutions for all your devices. From Apple to Samsung,
              Anker to Soundcore — we&apos;ve got you covered.
            </p>

            <Link
              href="/shop"
              className="inline-flex font-medium text-brand-dark text-custom-sm rounded-md bg-brand-accent py-2 px-5 sm:py-3 sm:px-9 ease-out duration-200 hover:bg-brand-hover mt-3 sm:mt-6"
            >
              Shop Now
            </Link>
          </div>

          <div>
            <Image
              src="/images/hero/apple-charger.png"
              alt="Premium accessories"
              width={351}
              height={358}
              className="w-28 sm:w-auto h-auto pr-3 sm:pr-0"
            />
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="flex items-center justify-between gap-2">
          <div className="max-w-[394px] py-6 sm:py-10 lg:py-16 pl-4 sm:pl-7.5 lg:pl-12.5 pb-9">
            <div className="flex items-center gap-3 mb-5 sm:mb-7.5">
              <span className="block font-semibold text-2xl sm:text-heading-1 text-brand-accent">
                Audio
              </span>
              <span className="block text-white text-sm sm:text-custom-1 sm:leading-[24px]">
                Zone
                <br />
                &nbsp;
              </span>
            </div>

            <h2 className="font-semibold text-white text-lg sm:text-3xl mb-2 sm:mb-3">
              <Link href="/shop">
                Wireless Audio Collection
              </Link>
            </h2>

            <p className="hidden sm:block text-[#A0A0A8]">
              Discover premium sound with JBL, Sony, Soundcore, and CMF
              earphones & headphones. Experience music like never before.
            </p>

            <Link
              href="/shop"
              className="inline-flex font-medium text-brand-dark text-custom-sm rounded-md bg-brand-accent py-2 px-5 sm:py-3 sm:px-9 ease-out duration-200 hover:bg-brand-hover mt-3 sm:mt-6"
            >
              Browse Audio
            </Link>
          </div>

          <div>
            <Image
              src="/images/hero/hero-09.png"
              alt="Audio collection"
              width={351}
              height={358}
              className="w-28 sm:w-auto h-auto pr-3 sm:pr-0"
            />
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default HeroCarousal;
