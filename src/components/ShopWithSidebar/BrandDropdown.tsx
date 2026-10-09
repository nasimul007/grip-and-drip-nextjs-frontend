"use client";
import { useState } from "react";
import { ChevronDownIcon } from "@/components/Common/icons";

export type BrandOption = { name: string; count: number };

const BrandDropdown = ({
  brands,
  selectedBrand,
  onSelectBrand,
}: {
  brands: BrandOption[];
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
}) => {
  const [open, setOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? brands : brands.slice(0, 8);

  return (
    <div className="bg-brand-card border border-brand-border rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-white"
      >
        Brand
        <ChevronDownIcon className={`ease-out duration-200 ${open ? "rotate-180" : ""}`} size={18} />
      </button>
      {open && (
        <ul className="flex flex-col gap-1 border-t border-brand-border px-4 py-3 text-custom-sm">
          <li>
            <button
              type="button"
              onClick={() => onSelectBrand("")}
              className={`w-full text-left py-0.5 hover:text-brand-accent ${selectedBrand === "" ? "text-brand-accent" : "text-brand-muted"}`}
            >
              All brands
            </button>
          </li>
          {shown.map((b) => (
            <li key={b.name}>
              <button
                type="button"
                onClick={() => onSelectBrand(b.name)}
                aria-pressed={selectedBrand === b.name}
                className={`flex w-full items-center justify-between gap-2 py-0.5 text-left hover:text-brand-accent ${
                  selectedBrand === b.name ? "text-brand-accent" : "text-brand-muted"
                }`}
              >
                <span className="truncate">{b.name}</span>
                <span className="text-custom-xs opacity-70">{b.count}</span>
              </button>
            </li>
          ))}
          {brands.length > 8 && (
            <li>
              <button type="button" onClick={() => setShowAll(!showAll)} className="mt-1 text-custom-xs text-white hover:text-brand-accent">
                {showAll ? "Show fewer" : `Show all ${brands.length} brands`}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default BrandDropdown;
