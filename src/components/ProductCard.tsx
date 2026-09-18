import { Plus, Star, UtensilsCrossed } from 'lucide-react';
import type { Product } from '@/types';
import { formatCurrency } from '@/utils/format';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!product.is_available}
      className="card overflow-hidden text-left group transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className="relative h-36 sm:h-40 overflow-hidden shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-red/10 to-brand-yellow/10 flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-brand-red/30" />
          </div>
        )}
        {product.is_featured && (
          <span className="absolute top-2 left-2 badge bg-brand-yellow text-black">
            <Star className="w-3 h-3 fill-black" />
            Destaque
          </span>
        )}
        {product.is_example && (
          <span className="absolute top-2 right-2 bg-black/80 text-brand-yellow text-[10px] font-bold px-2 py-0.5 rounded-full">
            EXEMPLO
          </span>
        )}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">Indisponível</span>
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-sm text-black leading-tight line-clamp-1">{product.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 leading-snug min-h-[2rem]">{product.description}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-brand-red">{formatCurrency(product.price)}</span>
          <span className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center group-hover:bg-brand-red-dark transition-colors">
            <Plus className="w-4 h-4" />
          </span>
        </div>
      </div>
    </button>
  );
}
