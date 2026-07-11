"use client";
import React from "react";
import Image from "next/image";

const featureData = [
  {
    img: "/images/icons/icon-01.svg",
    title: "Free Shipping",
    description: "For all orders ৳1,000+",
  },
  {
    img: "/images/icons/icon-02.svg",
    title: "Easy Returns",
    description: "7-day return policy",
  },
  {
    img: "/images/icons/icon-03.svg",
    title: "100% Authentic",
    description: "Genuine products guaranteed",
  },
  {
    img: "/images/icons/icon-04.svg",
    title: "24/7 Support",
    description: "Anywhere & anytime",
  },
];

const HeroFeature = () => {
  return (
    <div className="max-w-[1060px] w-full mx-auto px-4 sm:px-8 xl:px-0">
      <div className="flex flex-wrap items-center gap-7.5 xl:gap-12.5 mt-10">
        {featureData.map((item, key) => (
          <div className="flex items-center gap-4" key={key}>
            <Image src={item.img} alt="icons" width={40} height={41} />
            <div>
              <h3 className="font-medium text-lg text-white">{item.title}</h3>
              <p className="text-sm text-brand-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
