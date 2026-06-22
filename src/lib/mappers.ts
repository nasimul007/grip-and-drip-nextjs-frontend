import type { ProductListItem } from "./types";

const categoryImages: Record<string, string> = {
  televisions: "/images/categories/categories-01.png",
  "laptop & pc": "/images/categories/categories-02.png",
  "mobile & tablets": "/images/categories/categories-03.png",
  "games & videos": "/images/categories/categories-04.png",
  "home appliances": "/images/categories/categories-05.png",
  "health & sports": "/images/categories/categories-06.png",
  watches: "/images/categories/categories-07.png",
};

export function mapCategoryForDisplay(apiCategory: {
  id: number;
  name: string;
  slug: string;
}) {
  const key = apiCategory.name.toLowerCase();
  return {
    title: apiCategory.name,
    id: apiCategory.id,
    img: categoryImages[key] || "/images/categories/categories-01.png",
  };
}

export function mapProductForDisplay(item: ProductListItem) {
  return {
    title: item.name,
    reviews: 0,
    price: item.compare_price || item.effective_price,
    discountedPrice: item.effective_price,
    id: item.id,
    slug: item.slug,
    imgs: {
      thumbnails: item.primary_image ? [item.primary_image] : [],
      previews: item.primary_image ? [item.primary_image] : [],
    },
  };
}
