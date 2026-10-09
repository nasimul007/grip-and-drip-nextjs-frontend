import { useState } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { ChevronDownIcon } from '@/components/Common/icons';

export const FALLBACK_MAX_PRICE = 100000;

const PriceDropdown = ({
  onPriceChange,
  rangeMin = 0,
  rangeMax = FALLBACK_MAX_PRICE,
  initialMin,
  initialMax,
}: {
  onPriceChange?: (min: number, max: number) => void;
  /** Cheapest / most expensive product in the current selection. */
  rangeMin?: number;
  rangeMax?: number;
  initialMin?: number;
  initialMax?: number;
}) => {
  const [open, setOpen] = useState(true);
  const lo = Math.max(rangeMin, initialMin || rangeMin);
  const hi = Math.min(rangeMax, initialMax || rangeMax);
  const [price, setPrice] = useState({ from: lo, to: Math.max(lo, hi) });
  const [minStr, setMinStr] = useState(String(lo));
  const [maxStr, setMaxStr] = useState(String(Math.max(lo, hi)));
  // Prices are in whole taka; keep the slider usable on both small and large ranges.
  const step = rangeMax - rangeMin > 5000 ? 50 : 10;

  const apply = (from: number, to: number) => {
    setPrice({ from, to });
    setMinStr(String(from));
    setMaxStr(String(to));
    onPriceChange?.(from, to);
  };

  const commitMin = (raw: string) => {
    const val = Math.max(rangeMin, Math.min(Number(raw) || rangeMin, price.to));
    apply(val, price.to);
  };
  const commitMax = (raw: string) => {
    const val = Math.min(rangeMax, Math.max(Number(raw) || rangeMax, price.from));
    apply(price.from, val);
  };

  const box = "flex items-center flex-1 min-w-0 rounded border border-brand-border bg-brand-surface";
  const field = "w-full min-w-0 bg-transparent text-white px-1 py-1.5 text-sm outline-none";

  return (
    <div className="bg-brand-card border border-brand-border rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-white"
      >
        Price
        <ChevronDownIcon className={`ease-out duration-200 ${open ? "rotate-180" : ""}`} size={18} />
      </button>
      {open && (
        <div className="border-t border-brand-border px-4 py-4">
          <RangeSlider
            id="range-slider-gradient"
            className="margin-lg"
            step={step}
            min={rangeMin}
            max={rangeMax}
            value={[price.from, price.to]}
            onInput={(e) => apply(Math.floor(e[0]), Math.ceil(e[1]))}
          />
          <div className="flex items-center justify-between pt-4 gap-2">
            <div className={box}>
              <span className="shrink-0 pl-2 text-white">৳</span>
              <input
                type="text"
                inputMode="numeric"
                aria-label="Minimum price"
                value={minStr}
                onChange={(e) => setMinStr(e.target.value)}
                onBlur={(e) => commitMin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && commitMin(e.currentTarget.value)}
                className={field}
              />
            </div>
            <span className="shrink-0 text-brand-muted">–</span>
            <div className={box}>
              <span className="shrink-0 pl-2 text-white">৳</span>
              <input
                type="text"
                inputMode="numeric"
                aria-label="Maximum price"
                value={maxStr}
                onChange={(e) => setMaxStr(e.target.value)}
                onBlur={(e) => commitMax(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && commitMax(e.currentTarget.value)}
                className={field}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceDropdown;
