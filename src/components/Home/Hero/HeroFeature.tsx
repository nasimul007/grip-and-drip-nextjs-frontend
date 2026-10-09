import React from "react";
import Image from "next/image";

const featureData = [
  {
    img: "/images/icons/icon-01.svg",
    title: "Free Shipping",
    description: "For orders above ৳2,000+",
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
    title: "Cash on Delivery",
    description: "Pay when you receive",
  },
];

const HeroFeature = () => {
  return (
    <div className="max-w-[1060px] w-full mx-auto px-4 sm:px-8 xl:px-0">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-3 sm:gap-7.5 xl:gap-12.5 mt-5">
        {featureData.map((item, key) => (
          <div className="flex items-center gap-4" key={key}>
            <Image src={item.img} alt="" width={40} height={41} className="w-7 h-7 sm:w-10 sm:h-10" />
            <div>
              <h3 className="font-medium text-custom-sm sm:text-lg text-white">{item.title}</h3>
              <p className="text-custom-xs sm:text-sm text-brand-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
