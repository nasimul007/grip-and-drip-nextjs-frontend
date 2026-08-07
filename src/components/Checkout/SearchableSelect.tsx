"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Option = { id: string; displayName: string };

type SearchableSelectProps = {
  name: string;
  id: string;
  label: string;
  required?: boolean;
  value: string;
  options: Option[];
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  placeholder: string;
  wrapperClassName?: string;
  onChange: (
    e: {
      target: { name: string; value: string };
    }
  ) => void;
};

const inputClass =
  "rounded-md bg-brand-surface placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-brand-accent/20 disabled:opacity-60";

const fieldClass = (error?: string) =>
  `${inputClass} border ${
    error ? "border-red" : "border-brand-border"
  }`;

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="text-red text-custom-sm mt-1">{message}</p>
  ) : null;

const SearchableSelect = ({
  name,
  id,
  label,
  required,
  value,
  options,
  disabled,
  loading,
  error,
  placeholder,
  wrapperClassName = "mb-5",
  onChange,
}: SearchableSelectProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = useMemo(
    () => options.find((opt) => opt.displayName === value)?.displayName ?? "",
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) =>
      opt.displayName.toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    setHighlight(-1);
  }, [query, filtered]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOption = (opt: Option) => {
    onChange({ target: { name, value: opt.displayName } });
    setOpen(false);
    setQuery("");
    setHighlight(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || loading) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlight((prev) =>
        Math.min(prev + 1, filtered.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && highlight >= 0 && filtered[highlight]) {
        selectOption(filtered[highlight]);
      } else if (open) {
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  const showQuery = open && !disabled && !loading;
  const display = showQuery ? query : selectedLabel;

  return (
    <div className={wrapperClassName} ref={containerRef}>
      <label htmlFor={id} className="block mb-2.5">
        {label} {required && <span className="text-red">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          value={display}
          placeholder={loading ? "Loading..." : placeholder}
          disabled={disabled || loading}
          autoComplete="off"
          className={fieldClass(error)}
          onFocus={() => {
            if (!disabled && !loading) {
              setOpen(true);
              setQuery("");
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted">
          <svg
            className={`fill-current ease-out duration-200 ${
              open && "rotate-180"
            }`}
            width="14"
            height="14"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.06103 7.80259C4.30813 7.51431 4.74215 7.48092 5.03044 7.72802L10.9997 12.8445L16.9689 7.72802C17.2572 7.48092 17.6912 7.51431 17.9383 7.80259C18.1854 8.09088 18.1521 8.5249 17.8638 8.772L11.4471 14.272C11.1896 14.4927 10.8097 14.4927 10.5523 14.272L4.1356 8.772C3.84731 8.5249 3.81393 8.09088 4.06103 7.80259Z"
              fill=""
            />
          </svg>
        </span>

        {open && !disabled && !loading && (
          <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-md border border-brand-border bg-brand-card shadow-1">
            {filtered.length === 0 ? (
              <li className="px-5 py-2.5 text-brand-muted text-sm">
                No matches
              </li>
            ) : (
              filtered.map((opt, index) => (
                <li
                  key={opt.id}
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => selectOption(opt)}
                  className={`px-5 py-2.5 text-sm cursor-pointer ease-out duration-150 ${
                    index === highlight
                      ? "bg-brand-accent/10 text-brand-accent"
                      : "text-white hover:bg-brand-accent/10"
                  }`}
                >
                  {opt.displayName}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <FieldError message={error} />
    </div>
  );
};

export default SearchableSelect;