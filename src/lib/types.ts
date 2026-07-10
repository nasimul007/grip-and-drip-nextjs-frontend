export type User = {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  is_vendor: boolean;
};

export type BlogItem = {
  date: string;
  views: number;
  title: string;
  img: string;
};

export type Category = {
  title: string;
  id: number;
  img: string;
};

export type Menu = {
  id: number;
  title: string;
  path?: string;
  newTab: boolean;
  submenu?: Menu[];
};

export type Testimonial = {
  review: string;
  authorName: string;
  authorRole: string;
  authorImg: string;
};

export type ProductImage = {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
};

export type ProductVariant = {
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

export type ProductListItem = {
  id: number;
  name: string;
  slug: string;
  primary_image: {
    id: number;
    image: string;
    alt_text: string;
    is_primary: boolean;
    sort_order: number;
  } | null;
  category_name: string;
  category_slug: string;
  price: number;
  compare_price: number | null;
  effective_price: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  brand: string;
  created_at: string;
};

export type ProductDetail = {
  id: number;
  name: string;
  slug: string;
  description: string;
  category_name: string;
  category_slug: string;
  price: number;
  compare_price: number | null;
  effective_price: number;
  sku: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  brand: string;
  attributes: Record<string, string>;
  images: ProductImage[];
  variants: ProductVariant[];
  breadcrumb: { name: string; slug: string }[];
  meta_title: string;
  meta_description: string;
  og_image: string;
  schema_markup: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type CartItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  price: number;
  quantity: number;
  variant_name: string;
  total: number;
  created_at: string;
};

export type Cart = {
  id: number;
  items: CartItem[];
  total: number;
  created_at: string;
  updated_at: string;
};

export type ShippingRate = {
  id: number;
  area_type: "inside_dhaka" | "outside_dhaka";
  charge: number;
  free_shipping_minimum: number | null;
};

export type OrderItem = {
  product_name: string;
  product_slug: string;
  product_image: string;
  price: number;
  quantity: number;
  variant_name: string;
};

export type ShippingAddress = {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

export type Order = {
  id: number;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_area: string;
  notes: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
};

export type OrderListItem = {
  id: number;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  item_count: number;
  created_at: string;
};

export type AuthResponse = {
  user: User;
  access: string;
  refresh: string;
};

export type TokenResponse = {
  access: string;
  refresh: string;
};
