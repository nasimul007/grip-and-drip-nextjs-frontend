import { Menu } from "@/types/Menu";

// "Categories" dropdown is inserted after "Shop" from the API in Header.
export const menuData: Menu[] = [
  { id: 1, title: "Home", newTab: false, path: "/" },
  { id: 2, title: "Shop", newTab: false, path: "/shop" },
  { id: 4, title: "Deals", newTab: false, path: "/deals" },
  { id: 3, title: "Contact", newTab: false, path: "/contact" },
];
