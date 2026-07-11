import React from "react";
import Image from "next/image";
import Link from "next/link";

const PromoBanner = () => {
  return (
    <section className="overflow-hidden py-20 bg-brand-dark">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-lg bg-brand-surface py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
          <div className="max-w-[550px] w-full">
            <span className="block font-medium text-xl text-brand-accent mb-3">
              Premium Wireless Audio
            </span>

            <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-white mb-5">
              JBL & Soundcore Collection
            </h2>

            <p className="text-brand-muted">
              Experience studio-quality sound with our curated selection of JBL
              speakers and Soundcore earphones. From deep bass to crystal-clear
              treble.
            </p>

            <Link
              href="/shop-with-sidebar"
              className="inline-flex font-medium text-custom-sm text-white bg-brand-accent py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-brand-hover mt-7.5"
            >
              Shop Audio
            </Link>
          </div>

          <Image
            src="/images/promo/promo-01.png"
            alt="promo img"
            className="absolute bottom-0 right-4 lg:right-26 -z-1 opacity-40"
            width={274}
            height={350}
          />
        </div>

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          <div className="relative z-1 overflow-hidden rounded-lg bg-brand-surface py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <Image
              src="/images/promo/Anker-Nano-3-30W-Adapter-with-Type-C.png"
              alt="promo img"
              className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-10 -z-1 opacity-40"
              width={241}
              height={241}
            />

            <div className="text-right">
              <span className="block text-lg text-brand-muted mb-1.5">
                Fast Charging Solutions
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-white mb-2.5">
                Chargers & Cables
              </h2>

              <p className="font-semibold text-custom-1 text-brand-accent">
                From 20W to 45W
              </p>

              <Link
                href="/shop-with-sidebar"
                className="inline-flex font-medium text-custom-sm text-white bg-brand-accent py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-brand-hover mt-9"
              >
                Explore Now
              </Link>
            </div>
          </div>

          <div className="relative z-1 overflow-hidden rounded-lg bg-brand-surface py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <Image
              src="/images/promo/promo-03.png"
              alt="promo img"
              className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-8.5 -z-1 opacity-40"
              width={200}
              height={200}
            />

            <div>
              <span className="block text-lg text-brand-muted mb-1.5">
                Smart Wearables
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-white mb-2.5">
                Smartwatches & <span className="text-brand-accent">More</span>
              </h2>

              <p className="max-w-[285px] text-custom-sm text-brand-muted">
                Track your fitness, stay connected, and express your style with
                Amazfit, CMF, and Pop smartwatches.
              </p>

              <Link
                href="/shop-with-sidebar"
                className="inline-flex font-medium text-custom-sm text-white bg-brand-accent py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-brand-hover mt-7.5"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
