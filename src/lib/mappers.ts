import type { ProductListItem, ProductDetail } from "./types";

const categoryImages: Record<string, string> = {
  charger: "/images/categories/charger-cat.png",
  earphone: "/images/categories/app-earphone.png",
  cable: "/images/categories/cables1.png",
  speaker: "/images/categories/speaker.png",
  headphone: "/images/categories/jbl-headphone.png",
  smartwatch: "/images/categories/amz-smartwatch.png",
  accessory: "/images/categories/accessory.png",
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
    img: categoryImages[key] || "/images/categories/accessory.webp",
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
      thumbnails: item.primary_image ? [item.primary_image.image] : [],
      previews: item.primary_image ? [item.primary_image.image] : [],
    },
  };
}

export function mapProductDetailForDisplay(item: ProductDetail) {
  const images = [...item.images]
    .sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return a.sort_order - b.sort_order;
    })
    .map((img) => {
      try {
        return new URL(img.image).pathname;
      } catch {
        return img.image;
      }
    })
    .filter((url): url is string => url !== null);
  return {
    title: item.name,
    reviews: 0,
    price: item.compare_price || item.effective_price,
    discountedPrice: item.effective_price,
    id: item.id,
    slug: item.slug,
    description: item.description,
    attributes: item.attributes,
    variants: item.variants.map((v) => ({
      ...v,
      image: v.image
        ? (() => {
            try {
              return new URL(v.image).pathname;
            } catch {
              return v.image;
            }
          })()
        : null,
    })),
    imgs: {
      thumbnails: images.length ? images : [],
      previews: images.length ? images : [],
    },
  };
}
