import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Copy, Eye, EyeOff, Star, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { ImageUpload } from '@/components/ImageUpload';
import { formatCurrency, slugify } from '@/utils/format';
import type { Product, Category } from '@/types';

export function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
    ]);
    if (prodRes.data) setProducts(prodRes.data as Product[]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Partial<Product>) => {
    if (editing) {
      const { error } = await supabase.from('products').update({
        name: data.name, description: data.description, price: data.price,
        image_url: data.image_url, category_id: data.category_id,
        is_available: data.is_available, is_featured: data.is_featured,
        is_example: data.is_example,
      }).eq('id', editing.id);
      if (error) { showToast('Erro ao atualizar', 'error'); return; }
      showToast('Produto atualizado!', 'success');
    } else {
      const { error } = await supabase.from('products').insert({
        name: data.name, description: data.description, price: data.price,
        image_url: data.image_url, category_id: data.category_id,
        is_available: data.is_available, is_featured: data.is_featured,
        is_example: data.is_example ?? false, sort_order: 0,
      });
      if (error) { showToast('Erro ao criar produto', 'error'); return; }
      showToast('Produto criado!', 'success');
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { showToast('Erro ao excluir', 'error'); return; }
    showToast('Produto excluído', 'info');
    load();
  };

  const handleDuplicate = async (product: Product) => {
    const { error } = await supabase.from('products').insert({
      name: `${product.name} (cópia)`,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      category_id: product.category_id,
      is_available: product.is_available,
      is_featured: false,
      is_example: product.is_example,
      sort_order: 0,
    });
    if (error) { showToast('Erro ao duplicar', 'error'); return; }
    showToast('Produto duplicado!', 'success');
    load();
  };

  const toggleAvailable = async (product: Product) => {
    const { error } = await supabase.from('products').update({ is_available: !product.is_available }).eq('id', product.id);
    if (error) { showToast('Erro', 'error'); return; }
    load();
  };

  const toggleFeatured = async (product: Product) => {
    const { error } = await supabase.from('products').update({ is_featured: !product.is_featured }).eq('id', product.id);
    if (error) { showToast('Erro', 'error'); return; }
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-black">Cardápio</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Novo produto
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 animate-pulse">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((product) => (
            <div key={product.id} className="card overflow-hidden">
              <div className="relative h-32">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                {product.is_example && (
                  <span className="absolute top-2 right-2 bg-black/80 text-brand-yellow text-[10px] font-bold px-2 py-0.5 rounded-full">EXEMPLO</span>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <button onClick={() => toggleFeatured(product)} className={`p-1.5 rounded-full ${product.is_featured ? 'bg-brand-yellow text-black' : 'bg-white/80 text-gray-500'}`}>
                    <Star className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-black truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{product.category?.name || 'Sem categoria'}</p>
                    <p className="font-bold text-brand-red text-sm mt-1">{formatCurrency(product.price)}</p>
                  </div>
                  <span className={`badge ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {product.is_available ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <button onClick={() => { setEditing(product); setShowForm(true); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Editar">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDuplicate(product)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Duplicar">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleAvailable(product)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Ativar/desativar">
                    {product.is_available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 ml-auto" title="Excluir">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              Nenhum produto. Clique em "Novo produto" para começar.
            </div>
          )}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </AdminLayout>
  );
}

function ProductForm({ product, categories, onSave, onClose }: {
  product: Product | null;
  categories: Category[];
  onSave: (data: Partial<Product>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(String(product?.price || ''));
  const [image_url, setImageUrl] = useState(product?.image_url || '');
  const [category_id, setCategoryId] = useState(product?.category_id || '');
  const [is_available, setIsAvailable] = useState(product?.is_available ?? true);
  const [is_featured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [is_example, setIsExample] = useState(product?.is_example ?? false);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
          <h2 className="font-display text-lg font-bold text-black">{product ? 'Editar produto' : 'Novo produto'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nome*</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field mt-1 resize-none" rows={2} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Preço*</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field mt-1" placeholder="0.00" />
          </div>
          <div>
            <ImageUpload bucket="product-images" folder="products" value={image_url} onChange={setImageUrl} label="Imagem do produto" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Categoria</label>
            <select value={category_id || ''} onChange={(e) => setCategoryId(e.target.value)} className="input-field mt-1">
              <option value="">Sem categoria</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={is_available} onChange={(e) => setIsAvailable(e.target.checked)} className="accent-brand-red" />
              <span className="text-sm">Disponível</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={is_featured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-brand-red" />
              <span className="text-sm">Destaque</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={is_example} onChange={(e) => setIsExample(e.target.checked)} className="accent-brand-red" />
              <span className="text-sm">Exemplo</span>
            </label>
          </div>
          <button
            onClick={() => onSave({ name, description, price: parseFloat(price) || 0, image_url, category_id: category_id || null, is_available, is_featured, is_example })}
            disabled={!name || !price}
            className="btn-primary w-full"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
