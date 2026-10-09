import { API_URL } from "./site";
import type {
  PaginatedResponse,
  ProductDetail,
  ProductListItem,
} from "./types";

export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
  children?: CategoryNode[];
};

export type CategoryDetail = {
  id: number;
  name: string;
  slug: string;
  description: string;
  meta_title: string;
  meta_description: string;
  og_image: string | null;
  breadcrumb: { name: string; slug: string }[];
  subcategories: CategoryNode[];
  product_count: number;
};

export type RelatedProduct = Pick<
  ProductListItem,
  | "id"
  | "name"
  | "slug"
  | "primary_image"
  | "price"
  | "compare_price"
  | "effective_price"
  | "stock"
  | "brand"
>;

/**
 * Server-side GET against the Django API with ISR caching.
 * Returns null on 404 or network failure so pages can degrade gracefully.
 */
export async function serverGet<T>(
  path: string,
  revalidate = 120
): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const getProduct = (slug: string) =>
  serverGet<ProductDetail>(`/api/products/${encodeURIComponent(slug)}/`);

export const getRelatedProducts = async (slug: string) => {
  const data = await serverGet<
    PaginatedResponse<RelatedProduct> | RelatedProduct[]
  >(`/api/products/${encodeURIComponent(slug)}/related/`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results;
};

export const getProducts = (query: string) =>
  serverGet<PaginatedResponse<ProductListItem>>(`/api/products/?${query}`, 60);

export const getCategoryTree = async () => {
  const data = await serverGet<
    PaginatedResponse<CategoryNode> | CategoryNode[]
  >("/api/categories/?page_size=100", 600);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results;
};

export const getCategory = (slug: string) =>
  serverGet<CategoryDetail>(`/api/categories/${encodeURIComponent(slug)}/`, 600);

/** Find a category (and its ancestors) in the tree by id. */
export function findCategoryPath(
  tree: CategoryNode[],
  id: number,
  trail: CategoryNode[] = []
): CategoryNode[] | null {
  for (const node of tree) {
    const path = [...trail, node];
    if (node.id === id) return path;
    if (node.children?.length) {
      const found = findCategoryPath(node.children, id, path);
      if (found) return found;
    }
  }
  return null;
}
