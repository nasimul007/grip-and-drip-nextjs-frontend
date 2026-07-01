"use client";

import { useState } from "react";

type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  children?: CategoryNode[];
};

const ExpandIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    className={`${expanded ? "rotate-90" : ""} stroke-current transition-transform duration-200`}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.5 2.5L7.5 6L4.5 9.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CategoryItem = ({
  category,
  depth,
  selectedIds,
  onSelect,
}: {
  category: CategoryNode;
  depth: number;
  selectedIds: string[];
  onSelect?: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = !!category.children?.length;
  const selected = selectedIds.includes(String(category.id));

  return (
    <div>
      <button
        type="button"
        className={`${
          selected && "text-blue"
        } group flex items-center justify-between w-full ease-out duration-200 hover:text-blue text-left`}
        style={{ paddingLeft: depth * 16 }}
        onClick={() => {
          if (onSelect) onSelect(String(category.id));
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="flex items-center justify-center w-4 h-4 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {hasChildren && <ExpandIcon expanded={expanded} />}
          </span>

          <div
            className={`cursor-pointer flex items-center justify-center rounded w-4 h-4 border shrink-0 ${
              selected ? "border-blue bg-blue" : "bg-white border-gray-3"
            }`}
          >
            <svg
              className={selected ? "block" : "hidden"}
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.33317 2.5L3.74984 7.08333L1.6665 5"
                stroke="white"
                strokeWidth="1.94437"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span className="truncate">{category.name}</span>
        </div>
      </button>

      {expanded && hasChildren && (
        <div>
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              depth={depth + 1}
              selectedIds={selectedIds}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryDropdown = ({
  categories,
  selectedIds,
  onSelectCategory,
}: {
  categories: CategoryNode[];
  selectedIds: string[];
  onSelectCategory?: (id: string) => void;
}) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={(e) => {
          e.preventDefault();
          setToggleDropdown(!toggleDropdown);
        }}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-dark">Category</p>
        <button
          aria-label="button for category dropdown"
          className={`text-dark ease-out duration-200 ${
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
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            depth={0}
            selectedIds={selectedIds}
            onSelect={onSelectCategory}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryDropdown;
