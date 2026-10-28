export type VariantItem = {
  id: number;
  name: string;
  sku: string;
  price_override: number | null;
  stock: number;
  is_active: boolean;
  image: string | null;
  attributes: Record<string, string>;
  sort_order: number;
};

export type Product = {
  title: string;
  /** Number of approved reviews. */
  reviews: number;
  ratingAverage?: number | null;
  price: number;
  discountedPrice: number;
  id: number;
  slug?: string;
  description?: string;
  stock?: number;
  warrantyMonths?: number | null;
  sku?: string;
  brand?: string;
  attributes?: Record<string, string>;
  variants?: VariantItem[];
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
