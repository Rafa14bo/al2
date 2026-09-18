import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, UtensilsCrossed } from 'lucide-react';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { ProductCard } from '@/components/ProductCard';
import { ProductDrawer } from '@/components/ProductDrawer';
import { getProducts, getProductById, getCategories } from '@/services/api';
import { useHorizontalWheelScroll } from '@/hooks/useHorizontalWheelScroll';
import type { Product, ProductWithAddons, Category } from '@/types';

export function MenuPage() {
  const categoryScrollRef = useHorizontalWheelScroll<HTMLDivElement>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithAddons | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.get('cat') || 'todos');

  useEffect(() => {
    (async () => {
      try {
        const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prods);
        setCategories(cats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const debouncedSearch = useDebounce(search, 300);

  const filtered = products.filter((p) => {
    if (!p.is_available) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      const catName = categories.find((c) => c.id === p.category_id)?.name?.toLowerCase() || '';
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        catName.includes(q)
      );
    }
    if (activeCategory === 'todos') return true;
    const cat = categories.find((c) => c.slug === activeCategory);
    return cat ? p.category_id === cat.id : false;
  });

  const openProduct = async (product: Product) => {
    const full = await getProductById(product.id);
    if (full) setSelectedProduct(full);
  };

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    setSearchParams(slug !== 'todos' ? { cat: slug } : {});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar no cardápio..."
              className="input-field pl-10"
            />
          </div>
          <div ref={categoryScrollRef} className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            <button
              onClick={() => handleCategoryChange('todos')}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeCategory === 'todos' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Todos
            </button>
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.slug);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeCategory === cat.slug ? 'bg-brand-red text-white shadow-md scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card h-64 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UtensilsCrossed className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Nenhum produto encontrado.</p>
            <p className="text-gray-400 text-sm mt-1">Tente buscar por outro termo.</p>
          </div>
        ) : (
          <>
            {activeCategory !== 'todos' && (
              <h2 className="font-display text-lg font-bold text-black mb-4">
                {categories.find((c) => c.slug === activeCategory)?.name}
              </h2>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => openProduct(product)} />
              ))}
            </div>
          </>
        )}
      </div>

      <ProductDrawer product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
