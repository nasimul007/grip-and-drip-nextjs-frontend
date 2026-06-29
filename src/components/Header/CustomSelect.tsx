"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type CategoryOption = {
  label: string;
  value: string;
  slug?: string;
  children?: CategoryOption[];
};

const CategoryItem = ({
  option,
  selectedOption,
  onSelect,
}: {
  option: CategoryOption;
  selectedOption: CategoryOption;
  onSelect: (option: CategoryOption) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = !!option.children?.length;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(option);
  };

  return (
    <div
      className={`select-item relative ${
        selectedOption === option ? "same-as-selected" : ""
      }`}
      onClick={handleClick}
      onMouseEnter={() => hasChildren && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="flex items-center justify-between gap-2">
        {option.label}
        {hasChildren && (
          <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.52949 3.52999C5.78949 3.26999 6.20949 3.26999 6.46949 3.52999L11.4695 8.52999C11.7295 8.78999 11.7295 9.20999 11.4695 9.46999L6.46949 14.47C6.20949 14.73 5.78949 14.73 5.52949 14.47C5.26949 14.21 5.26949 13.79 5.52949 13.53L10.0595 8.99999L5.52949 4.46999C5.26949 4.20999 5.26949 3.78999 5.52949 3.52999Z" fill=""/>
          </svg>
        )}
      </span>
      {isHovered && hasChildren && (
        <div
          className="absolute left-full top-0 z-50 shadow-2 border border-gray-3 bg-white rounded-md py-2.5 min-w-[180px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {option.children!.map((child) => (
            <CategoryItem
              key={child.value}
              option={child}
              selectedOption={selectedOption}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CustomSelect = ({ options }: { options: CategoryOption[] }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[0]);
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
    setIsOpen(false);
    if (option.slug) {
      router.push(`/shop-with-sidebar?category=${option.slug}`);
    } else {
      router.push("/shop-with-sidebar");
    }
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
        {options.slice(1).map((option) => (
          <CategoryItem
            key={option.value}
            option={option}
            selectedOption={selectedOption}
            onSelect={handleOptionClick}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
