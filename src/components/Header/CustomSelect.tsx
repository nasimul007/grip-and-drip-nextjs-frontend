"use client";
import React, { useState, useEffect, useRef } from "react";

type CategoryOption = {
  label: string;
  value: string;
  children?: CategoryOption[];
};

const CustomSelect = ({ options }: { options: CategoryOption[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [hoveredOption, setHoveredOption] = useState<CategoryOption | null>(
    null
  );
  const selectRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      selectRef.current &&
      !selectRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: CategoryOption) => {
    setSelectedOption(option);
    setHoveredOption(null);
    setIsOpen(false);
  };

  const renderOption = (option: CategoryOption) => {
    const hasChildren = option.children && option.children.length > 0;
    const isHovered = hoveredOption === option;

    return (
      <div
        key={option.value}
        className={`select-item relative ${
          selectedOption === option ? "same-as-selected" : ""
        }`}
        onClick={() => handleOptionClick(option)}
        onMouseEnter={() => hasChildren && setHoveredOption(option)}
        onMouseLeave={() => setHoveredOption(null)}
      >
        <span className="flex items-center justify-between gap-2">
          {option.label}
          {hasChildren && (
            <span className="text-[10px] leading-none">▶</span>
          )}
        </span>
        {isHovered && hasChildren && (
          <div
            className="absolute left-full top-0 z-50 shadow-2 border border-gray-3 bg-white rounded-md py-2.5 min-w-[180px]"
            onMouseEnter={() => setHoveredOption(option)}
            onMouseLeave={() => setHoveredOption(null)}
          >
            {option.children!.map((child) => (
              <div
                key={child.value}
                className={`select-item ${
                  selectedOption === child ? "same-as-selected" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionClick(child);
                }}
              >
                {child.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="dropdown-content custom-select relative"
      ref={selectRef}
      style={{ width: "200px" }}
    >
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.slice(1).map(renderOption)}
      </div>
    </div>
  );
};

export default CustomSelect;
