import { useState } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

const PriceDropdown = ({ onPriceChange }: { onPriceChange?: (min: number, max: number) => void }) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const MAX_PRICE = 100000;

  const [selectedPrice, setSelectedPrice] = useState({
    from: 0,
    to: MAX_PRICE,
  });

  const [minStr, setMinStr] = useState("0");
  const [maxStr, setMaxStr] = useState(String(MAX_PRICE));

  const commitMin = (raw: string) => {
    const val = Math.max(0, Math.min(Number(raw) || 0, selectedPrice.to));
    setSelectedPrice((prev) => ({ ...prev, from: val }));
    setMinStr(String(val));
    if (onPriceChange) onPriceChange(val, selectedPrice.to);
  };

  const commitMax = (raw: string) => {
    const val = Math.max(selectedPrice.from, Math.min(Number(raw) || 0, MAX_PRICE));
    setSelectedPrice((prev) => ({ ...prev, to: val }));
    setMaxStr(String(val));
    if (onPriceChange) onPriceChange(selectedPrice.from, val);
  };

  return (
    <div className="bg-brand-card border border-brand-border rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className="cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5"
      >
        <p className="text-white">Price</p>
        <button
          onClick={() => setToggleDropdown(!toggleDropdown)}
          id="price-dropdown-btn"
          aria-label="button for price dropdown"
          className={`text-white ease-out duration-200 ${
            toggleDropdown && 'rotate-180'
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

      {/* // <!-- dropdown menu --> */}
      <div className={`p-6 ${toggleDropdown ? 'block' : 'hidden'}`}>
        <div id="pricingOne">
          <div className="price-range">
            <RangeSlider
              id="range-slider-gradient"
              className="margin-lg"
              step={'any'}
              max={MAX_PRICE}
              value={[selectedPrice.from, selectedPrice.to]}
              onInput={(e) => {
                const from = Math.floor(e[0]);
                const to = Math.ceil(e[1]);
                setSelectedPrice({ from, to });
                setMinStr(String(from));
                setMaxStr(String(to));
                if (onPriceChange) onPriceChange(from, to);
              }}
            />

            <div className="price-amount flex items-center justify-between pt-4 gap-2">
              <div className="flex items-center flex-1 min-w-0 rounded border border-brand-border bg-brand-card">
                <span className="shrink-0 px-2 py-1.5 text-white">৳</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={minStr}
                  onChange={(e) => setMinStr(e.target.value)}
                  onBlur={(e) => commitMin(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && commitMin(e.currentTarget.value)}
                  className="w-full min-w-0 bg-transparent text-white px-1 py-1.5 outline-none"
                />
              </div>
              <span className="shrink-0 text-brand-muted">—</span>
              <div className="flex items-center flex-1 min-w-0 rounded border border-brand-border bg-brand-card">
                <span className="shrink-0 px-2 py-1.5 text-white">৳</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={maxStr}
                  onChange={(e) => setMaxStr(e.target.value)}
                  onBlur={(e) => commitMax(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && commitMax(e.currentTarget.value)}
                  className="w-full min-w-0 bg-transparent text-white px-1 py-1.5 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDropdown;
