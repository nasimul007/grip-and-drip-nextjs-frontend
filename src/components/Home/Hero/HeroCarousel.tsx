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
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
            <div className="max-w-[394px] py-6 sm:py-10 lg:py-16 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-3 mb-5 sm:mb-7.5">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-brand-accent">
                5%
              </span>
              <span className="block text-white text-sm sm:text-custom-1 sm:leading-[24px]">
                Launch
                <br />
                Offer
              </span>
            </div>

            <h1 className="font-semibold text-white text-xl sm:text-3xl mb-3">
              <Link href="/shop-with-sidebar">
                Welcome to Gadget & Widget
              </Link>
            </h1>

            <p className="text-[#A0A0A8]">
              Bangladesh&apos;s premier destination for authentic tech accessories.
              Use code <span className="font-semibold text-brand-accent">GRIP5</span> at checkout for 5% off your first order.
            </p>

            <Link
              href="/shop-with-sidebar"
              className="inline-flex font-medium text-white text-custom-sm rounded-md bg-brand-accent py-3 px-9 ease-out duration-200 hover:bg-brand-hover mt-6"
            >
              Explore Now
            </Link>
          </div>

          <div>
            <Image
              src="/images/hero/hero-05.png"
              alt="Gadget & Widget"
              width={351}
              height={358}
            />
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[394px] py-6 sm:py-10 lg:py-16 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-3 mb-5 sm:mb-7.5">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-brand-accent">
                New
              </span>
              <span className="block text-white text-sm sm:text-custom-1 sm:leading-[24px]">
                Tech
                <br />
                Arrivals
              </span>
            </div>

            <h1 className="font-semibold text-white text-xl sm:text-3xl mb-3">
              <Link href="/shop-with-sidebar">
                Premium Chargers & Cables
              </Link>
            </h1>

            <p className="text-[#A0A0A8]">
              Fast charging solutions for all your devices. From Apple to Samsung,
              Anker to Soundcore — we&apos;ve got you covered.
            </p>

            <Link
              href="/shop-with-sidebar"
              className="inline-flex font-medium text-white text-custom-sm rounded-md bg-brand-accent py-3 px-9 ease-out duration-200 hover:bg-brand-hover mt-6"
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
            />
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[394px] py-6 sm:py-10 lg:py-16 pl-4 sm:pl-7.5 lg:pl-12.5">
            <div className="flex items-center gap-3 mb-5 sm:mb-7.5">
              <span className="block font-semibold text-heading-3 sm:text-heading-1 text-brand-accent">
                Audio
              </span>
              <span className="block text-white text-sm sm:text-custom-1 sm:leading-[24px]">
                Zone
                <br />
                &nbsp;
              </span>
            </div>

            <h1 className="font-semibold text-white text-xl sm:text-3xl mb-3">
              <Link href="/shop-with-sidebar">
                Wireless Audio Collection
              </Link>
            </h1>

            <p className="text-[#A0A0A8]">
              Discover premium sound with JBL, Sony, Soundcore, and CMF
              earphones & headphones. Experience music like never before.
            </p>

            <Link
              href="/shop-with-sidebar"
              className="inline-flex font-medium text-white text-custom-sm rounded-md bg-brand-accent py-3 px-9 ease-out duration-200 hover:bg-brand-hover mt-6"
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
            />
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default HeroCarousal;
