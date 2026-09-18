import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, UtensilsCrossed } from 'lucide-react';
import type { ProductWithAddons, ProductAddon } from '@/types';
import { formatCurrency } from '@/utils/format';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/Toast';
import { useState } from 'react';

interface ProductDrawerProps {
  product: ProductWithAddons | null;
  onClose: () => void;
}

export function ProductDrawer({ product, onClose }: ProductDrawerProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<Record<string, ProductAddon[]>>({});

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setNotes('');
      setSelectedAddons({});
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  if (!product) return null;

  const toggleAddon = (groupId: string, addon: ProductAddon, maxQuantity: number) => {
    setSelectedAddons((prev) => {
      const current = prev[groupId] || [];
      const exists = current.find((a) => a.id === addon.id);
      if (exists) {
        return { ...prev, [groupId]: current.filter((a) => a.id !== addon.id) };
      }
      if (current.length >= maxQuantity) {
        showToast(`Máximo de ${maxQuantity} adicionais`, 'warning');
        return prev;
      }
      return { ...prev, [groupId]: [...current, addon] };
    });
  };

  const allAddons = Object.values(selectedAddons).flat();
  const addonsTotal = allAddons.reduce((sum, a) => sum + a.price, 0);
  const total = (product.price + addonsTotal) * quantity;

  const handleAdd = () => {
    addItem(product, quantity, allAddons, notes);
    showToast('Adicionado à sacola!', 'success');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-3xl sm:rounded-t-3xl shrink-0">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-red/10 to-brand-yellow/10 flex items-center justify-center">
              <UtensilsCrossed className="w-12 h-12 text-brand-red/30" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
          {product.is_example && (
            <span className="absolute top-3 left-3 bg-black/80 text-brand-yellow text-xs font-bold px-3 py-1 rounded-full">
              EXEMPLO
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold text-black">{product.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
            <p className="text-lg font-bold text-brand-red mt-2">{formatCurrency(product.price)}</p>
          </div>

          {product.addon_groups && product.addon_groups.length > 0 && (
            <div className="space-y-3">
              {product.addon_groups.map((group) => (
                <div key={group.id} className="border border-gray-100 rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm text-black">{group.name}</h3>
                    {group.is_required && (
                      <span className="text-xs text-brand-red font-medium">Obrigatório</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {group.addons.map((addon) => {
                      const isSelected = (selectedAddons[group.id] || []).some((a) => a.id === addon.id);
                      return (
                        <label
                          key={addon.id}
                          className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'bg-brand-red border-brand-red' : 'border-gray-300'
                            }`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                            <span className="text-sm text-gray-800">{addon.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-brand-red">
                            + {formatCurrency(addon.price)}
                          </span>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isSelected}
                            onChange={() => toggleAddon(group.id, addon, group.max_quantity)}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-black">Alguma observação?</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: sem cebola, ponto da carne, etc."
              className="input-field mt-1.5 resize-none"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700 hover:border-brand-red hover:text-brand-red transition-colors"
              >
                −
              </button>
              <span className="text-lg font-bold w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700 hover:border-brand-red hover:text-brand-red transition-colors"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-black">{formatCurrency(total)}</p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.is_available}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
          >
            <Plus className="w-5 h-5" />
            Adicionar à Sacola
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
