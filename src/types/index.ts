export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  name: string;
  phone: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  is_example: boolean;
  created_at: string;
  category?: Category;
}

export interface AddonGroup {
  id: string;
  name: string;
  is_required: boolean;
  min_quantity: number;
  max_quantity: number;
  sort_order: number;
  created_at: string;
}

export interface ProductAddon {
  id: string;
  addon_group_id: string;
  name: string;
  price: number;
  is_available: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProductAddonGroupLink {
  id: string;
  product_id: string;
  addon_group_id: string;
}

export interface ProductWithAddons extends Product {
  addon_groups?: (AddonGroup & { addons: ProductAddon[] })[];
}

export type OrderStatus =
  | 'NOVO'
  | 'CONFIRMADO'
  | 'EM_PREPARACAO'
  | 'PRONTO'
  | 'SAINDO_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'CANCELADO';

export type DeliveryType = 'delivery' | 'pickup';
export type PaymentMethod = 'pix' | 'card' | 'cash';

export interface Order {
  id: string;
  order_number: number;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_type: DeliveryType;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  address_reference: string | null;
  delivery_zone_id: string | null;
  delivery_fee: number;
  payment_method: PaymentMethod;
  payment_card_type: string | null;
  cash_change_for: number | null;
  subtotal: number;
  discount: number;
  total: number;
  coupon_id: string | null;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  notes: string | null;
  order_item_addons?: OrderItemAddon[];
}

export interface OrderItemAddon {
  id: string;
  order_item_id: string;
  addon_name: string;
  addon_price: number;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  reference: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order: number;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  delivery_fee: number;
  min_order: number;
  estimated_time: string;
  is_active: boolean;
  created_at: string;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  logo_url: string;
  phone: string;
  whatsapp: string;
  address_street: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  maps_url: string;
  description: string;
  rating: number;
  review_count: number;
  is_temporarily_closed: boolean;
  primary_color: string;
  secondary_color: string;
  updated_at: string;
}

export interface BusinessHour {
  id: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

export interface PaymentSettings {
  id: string;
  pix_enabled: boolean;
  pix_key: string;
  pix_key_type: 'cpf' | 'email' | 'phone' | 'random';
  pix_receiver_name: string;
  pix_instructions: string;
  pix_qr_code_url: string;
  card_enabled: boolean;
  card_credit: boolean;
  card_debit: boolean;
  card_instructions: string;
  cash_enabled: boolean;
  cash_change_available: boolean;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  image_url: string;
  quantity: number;
  notes: string;
  addons: { name: string; price: number }[];
  unit_price: number;
  total_price: number;
}

export interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  profiles?: { name: string } | null;
}
