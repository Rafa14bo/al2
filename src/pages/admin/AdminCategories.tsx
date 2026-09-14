import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, GripVertical, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { slugify } from '@/utils/format';
import type { Category } from '@/types';

export function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('categories').select('*').order('sort_order');
    if (error) { showToast('Erro ao carregar', 'error'); return; }
    setCategories(data as Category[]);
    setLoading(false);
  }, [useToast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editing) {
      const { error } = await supabase.from('categories').update({ name, slug: slugify(name) }).eq('id', editing.id);
      if (error) { showToast('Erro ao atualizar', 'error'); return; }
      showToast('Categoria atualizada!', 'success');
    } else {
      const { error } = await supabase.from('categories').insert({
        name, slug: slugify(name), sort_order: categories.length, is_active: true,
      });
      if (error) { showToast('Erro ao criar', 'error'); return; }
      showToast('Categoria criada!', 'success');
    }
    setShowForm(false);
    setEditing(null);
    setName('');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta categoria? Os produtos dela ficarão sem categoria.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { showToast('Erro ao excluir', 'error'); return; }
    showToast('Categoria excluída', 'info');
    load();
  };

  const toggleActive = async (cat: Category) => {
    const { error } = await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id);
    if (error) { showToast('Erro', 'error'); return; }
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-black">Categorias</h1>
        <button onClick={() => { setEditing(null); setName(''); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Nova categoria
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 animate-pulse">Carregando...</div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="card p-3 flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-300" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-black">{cat.name}</p>
                <p className="text-xs text-gray-400">/{cat.slug}</p>
              </div>
              <span className={`badge ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {cat.is_active ? 'Ativa' : 'Inativa'}
              </span>
              <button onClick={() => toggleActive(cat)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                {cat.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={() => { setEditing(cat); setName(cat.name); setShowForm(true); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {categories.length === 0 && <p className="text-gray-400 text-center py-8">Nenhuma categoria.</p>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/50 animate-fade-in" />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-black">{editing ? 'Editar categoria' : 'Nova categoria'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input-field mt-1" placeholder="Ex: Lanches" />
              </div>
              <button onClick={handleSave} disabled={!name.trim()} className="btn-primary w-full">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
