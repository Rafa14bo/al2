import { supabase } from '@/lib/supabase';
import type {
  Category, Product, ProductWithAddons, AddonGroup, ProductAddon,
  Order, OrderItem, OrderItemAddon, Coupon, DeliveryZone,
  StoreSettings, BusinessHour, PaymentSettings, Address, Profile, Review,
} from '@/types';

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data as Category[];
}

export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data as Category[];
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('sort_order');
  if (error) throw error;
  return data as Product[];
}

export async function getProductById(id: string): Promise<ProductWithAddons | null> {
  const { data: product, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!product) return null;

  const { data: links } = await supabase
    .from('product_addon_group_links')
    .select('addon_group_id')
    .eq('product_id', id);

  if (!links || links.length === 0) {
    return { ...product } as ProductWithAddons;
  }

  const groupIds = links.map((l) => l.addon_group_id);
  const { data: groups } = await supabase
    .from('addon_groups')
    .select('*')
    .in('id', groupIds)
    .order('sort_order');

  const { data: addons } = await supabase
    .from('product_addons')
    .select('*')
    .in('addon_group_id', groupIds)
    .eq('is_available', true)
    .order('sort_order');

  const groupsWithAddons = (groups || []).map((g: AddonGroup) => ({
    ...g,
    addons: (addons || []).filter((a: ProductAddon) => a.addon_group_id === g.id),
  }));

  return { ...product, addon_groups: groupsWithAddons } as ProductWithAddons;
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data as DeliveryZone[];
}

export async function getAllDeliveryZones(): Promise<DeliveryZone[]> {
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as DeliveryZone[];
}

export async function validateCoupon(code: string, subtotal: number): Promise<{ coupon: Coupon | null; error: string | null }> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { coupon: null, error: 'Cupom não encontrado ou inativo.' };

  const coupon = data as Coupon;
  const now = new Date();
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    return { coupon: null, error: 'Este cupom ainda não está válido.' };
  }
  if (coupon.end_date && new Date(coupon.end_date) < now) {
    return { coupon: null, error: 'Este cupom expirou.' };
  }
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return { coupon: null, error: 'Este cupom atingiu o limite de uso.' };
  }
  if (subtotal < coupon.min_order) {
    return { coupon: null, error: `Pedido mínimo de R$ ${coupon.min_order.toFixed(2)} para este cupom.` };
  }
  return { coupon, error: null };
}

export async function createOrder(orderData: {
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_type: 'delivery' | 'pickup';
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
  payment_method: 'pix' | 'card' | 'cash';
  payment_card_type: string | null;
  cash_change_for: number | null;
  subtotal: number;
  discount: number;
  total: number;
  coupon_id: string | null;
  notes: string | null;
  items: {
    product_id: string | null;
    product_name: string;
    product_price: number;
    quantity: number;
    notes: string | null;
    addons: { name: string; price: number }[];
  }[];
}): Promise<{ order: Order | null; error: string | null }> {
  const { data: orderNumber, error: numError } = await supabase.rpc('get_next_order_number');
  if (numError) return { order: null, error: numError.message };

  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: orderData.user_id,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_email: orderData.customer_email,
      delivery_type: orderData.delivery_type,
      address_street: orderData.address_street,
      address_number: orderData.address_number,
      address_complement: orderData.address_complement,
      address_neighborhood: orderData.address_neighborhood,
      address_city: orderData.address_city,
      address_state: orderData.address_state,
      address_zip: orderData.address_zip,
      address_reference: orderData.address_reference,
      delivery_zone_id: orderData.delivery_zone_id,
      delivery_fee: orderData.delivery_fee,
      payment_method: orderData.payment_method,
      payment_card_type: orderData.payment_card_type,
      cash_change_for: orderData.cash_change_for,
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      total: orderData.total,
      coupon_id: orderData.coupon_id,
      status: 'NOVO',
      notes: orderData.notes,
    })
    .select('*')
    .maybeSingle();

  if (orderError) return { order: null, error: orderError.message };
  if (!orderRow) return { order: null, error: 'Falha ao criar pedido.' };

  const order = orderRow as Order;

  for (const item of orderData.items) {
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity,
        notes: item.notes,
      })
      .select('*')
      .maybeSingle();

    if (itemError) { console.error('Error creating order item:', itemError); continue; }
    if (!orderItem) continue;

    for (const addon of item.addons) {
      await supabase.from('order_item_addons').insert({
        order_item_id: (orderItem as OrderItem).id,
        addon_name: addon.name,
        addon_price: addon.price,
      });
    }
  }

  if (orderData.coupon_id) {
    await supabase.rpc('increment_coupon_usage', { coupon_id: orderData.coupon_id });
  }

  const { data: finalTotals } = await supabase.rpc('finalize_order', { p_order_id: order.id });
  if (finalTotals) {
    Object.assign(order, finalTotals);
  }

  return { order, error: null };
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, order_item_addons(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function getOrderByNumber(orderNumber: number): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, order_item_addons(*))')
    .eq('order_number', orderNumber)
    .maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

export async function getGuestOrderByNumber(orderNumber: number, phone: string): Promise<Order | null> {
  const { data, error } = await supabase.rpc('get_guest_order_by_number', {
    p_order_number: orderNumber,
    p_phone: phone,
  });
  if (error) throw error;
  return data as Order | null;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, order_item_addons(*))')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, order_item_addons(*))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function updateOrderStatus(orderId: string, status: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  return { error: error?.message ?? null };
}

export async function getAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Address[];
}

export async function saveAddress(addr: Omit<Address, 'id' | 'created_at'>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('addresses').insert(addr);
  return { error: error?.message ?? null };
}

export async function deleteAddress(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Profile[];
}

export async function getCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Coupon[];
}

export async function getBusinessHours(): Promise<BusinessHour[]> {
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .order('day_of_week');
  if (error) throw error;
  return data as BusinessHour[];
}

export async function getAddonGroups(): Promise<(AddonGroup & { addons: ProductAddon[] })[]> {
  const { data: groups, error } = await supabase
    .from('addon_groups')
    .select('*')
    .order('sort_order');
  if (error) throw error;

  const { data: addons, error: addonError } = await supabase
    .from('product_addons')
    .select('*')
    .order('sort_order');
  if (addonError) throw addonError;

  return (groups || []).map((g) => ({
    ...g,
    addons: (addons || []).filter((a) => a.addon_group_id === g.id),
  }));
}

// ============================================================
// AVALIAÇÕES
// ============================================================

export async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as Review[];
}

export async function getMyReview(userId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Review | null;
}

export async function upsertReview(userId: string, rating: number, comment: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('reviews')
    .upsert({ user_id: userId, rating, comment, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  return { error: error?.message ?? null };
}

export async function deleteReview(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('reviews').delete().eq('user_id', userId);
  return { error: error?.message ?? null };
}
