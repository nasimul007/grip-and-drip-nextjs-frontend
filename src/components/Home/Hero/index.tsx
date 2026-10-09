import React from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-5 lg:pb-7.5 pt-4 lg:pt-7.5 bg-brand-dark">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-brand-surface overflow-hidden">
              <Image
                src="/images/hero/hero-bg.png"
                alt=""
                className="absolute right-0 bottom-0 -z-1 opacity-20"
                width={534}
                height={520}
              />

              <HeroCarousel />
            </div>
          </div>

          <div className="hidden md:block xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              <div className="w-full relative rounded-[10px] bg-brand-surface p-4 sm:p-6 lg:p-7.5">
                <div className="flex items-center gap-8">
                  <div>
                    <h2 className="max-w-[153px] font-semibold text-white text-xl mb-10">
                      <Link href="/shop?q=JBL">JBL Speakers</Link>
                    </h2>

                    <div>
                      <p className="font-medium text-brand-muted text-custom-sm mb-1.5">
                        premium sound
                      </p>
                      <span className="flex items-center gap-3">
                        <span className="font-medium text-heading-5 text-brand-accent">
                          From ৳4,000
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="drop-shadow-[0_4px_12px_rgba(0,212,170,0.25)] hover:scale-105 transition-transform duration-300">
                    <Image
                      src="/images/hero/All_Speakers.png"
                      alt="JBL speakers"
                      width={160}
                      height={210}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full relative rounded-[10px] bg-brand-surface p-4 sm:p-6 lg:p-7.5">
                <div className="flex items-center gap-8">
                  <div>
                    <h2 className="max-w-[153px] font-semibold text-white text-xl mb-10">
                      <Link href="/shop?q=Anker">Anker Chargers</Link>
                    </h2>

                    <div>
                      <p className="font-medium text-brand-muted text-custom-sm mb-1.5">
                        fast charging
                      </p>
                      <span className="flex items-center gap-3">
                        <span className="font-medium text-heading-5 text-brand-accent">
                          Up to 45W
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="drop-shadow-[0_4px_12px_rgba(0,212,170,0.25)] hover:scale-105 transition-transform duration-300">
                    <Image
                      src="/images/hero/anker-chargers.webp"
                      alt="Anker chargers"
                      width={160}
                      height={210}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HeroFeature />
    </section>
  );
};

export default Hero;
