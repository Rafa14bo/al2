import {
  Flame, Sandwich, Beef, ChefHat, Drumstick, HandPlatter, Star, CupSoda, Beer, UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  'mais-pedidos': Flame,
  'lanches-com-salsicha': Sandwich,
  'lanches-com-hamburguer': Beef,
  'lanches-com-hamb-artesanal': ChefHat,
  'lanches-com-frango': Drumstick,
  'lanches-com-contra-file': HandPlatter,
  'especiais': Star,
  'bebidas': CupSoda,
  'cervejas': Beer,
};

const DEFAULT_ICON = UtensilsCrossed;

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICON_MAP[slug] || DEFAULT_ICON;
}
