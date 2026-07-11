"use client";
import { useState } from "react";

const BrandDropdown = ({
  brands,
  selectedBrand,
  onSelectBrand,
}: {
  brands: string[];
  selectedBrand: string;
  onSelectBrand?: (brand: string) => void;
}) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  return (
    <div className="bg-brand-card border border-brand-border rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className="cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5"
      >
        <p className="text-white">Brand</p>
        <button
          aria-label="button for brand dropdown"
          className={`text-white ease-out duration-200 ${
            toggleDropdown && "rotate-180"
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <div
        className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${
          toggleDropdown ? "flex" : "hidden"
        }`}
      >
        <div
          onClick={() => onSelectBrand && onSelectBrand("")}
          className={`cursor-pointer text-custom-sm ${
            selectedBrand === "" ? "text-brand-accent" : "text-brand-muted"
          } hover:text-brand-accent`}
        >
          All Brands
        </div>
        {brands.map((brand) => (
          <div
            key={brand}
            onClick={() => onSelectBrand && onSelectBrand(brand)}
            className={`cursor-pointer text-custom-sm ${
              selectedBrand === brand ? "text-brand-accent" : "text-brand-muted"
            } hover:text-brand-accent`}
          >
            {brand}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandDropdown;
