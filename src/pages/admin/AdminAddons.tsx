import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronRight, Link2, Unlink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/utils/format';
import type { AddonGroup, ProductAddon, Product } from '@/types';

export function AdminAddons() {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<(AddonGroup & { addons: ProductAddon[] })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showAddonForm, setShowAddonForm] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<AddonGroup | null>(null);
  const [groupForm, setGroupForm] = useState({ name: '', is_required: false, min_quantity: 0, max_quantity: 5 });
  const [addonForm, setAddonForm] = useState({ name: '', price: '' });

  const load = useCallback(async () => {
    const [grpRes, addRes, prodRes] = await Promise.all([
      supabase.from('addon_groups').select('*').order('sort_order'),
      supabase.from('product_addons').select('*').order('sort_order'),
      supabase.from('products').select('*').order('name'),
    ]);
    const groupList = (grpRes.data || []).map((g) => ({
      ...g,
      addons: (addRes.data || []).filter((a) => a.addon_group_id === g.id),
    }));
    setGroups(groupList as (AddonGroup & { addons: ProductAddon[] })[]);
    setProducts(prodRes.data as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveGroup = async () => {
    if (!groupForm.name.trim()) return;
    if (editingGroup) {
      const { error } = await supabase.from('addon_groups').update({
        name: groupForm.name, is_required: groupForm.is_required,
        min_quantity: groupForm.min_quantity, max_quantity: groupForm.max_quantity,
      }).eq('id', editingGroup.id);
      if (error) { showToast('Erro', 'error'); return; }
      showToast('Grupo atualizado!', 'success');
    } else {
      const { error } = await supabase.from('addon_groups').insert({
        name: groupForm.name, is_required: groupForm.is_required,
        min_quantity: groupForm.min_quantity, max_quantity: groupForm.max_quantity, sort_order: groups.length,
      });
      if (error) { showToast('Erro', 'error'); return; }
      showToast('Grupo criado!', 'success');
    }
    setShowGroupForm(false);
    setEditingGroup(null);
    setGroupForm({ name: '', is_required: false, min_quantity: 0, max_quantity: 5 });
    load();
  };

  const handleSaveAddon = async (groupId: string) => {
    if (!addonForm.name.trim()) return;
    const { error } = await supabase.from('product_addons').insert({
      addon_group_id: groupId, name: addonForm.name,
      price: parseFloat(addonForm.price) || 0, is_available: true, sort_order: 0,
    });
    if (error) { showToast('Erro', 'error'); return; }
    showToast('Adicional criado!', 'success');
    setShowAddonForm(null);
    setAddonForm({ name: '', price: '' });
    load();
  };

  const handleDeleteAddon = async (id: string) => {
    const { error } = await supabase.from('product_addons').delete().eq('id', id);
    if (error) { showToast('Erro', 'error'); return; }
    showToast('Adicional removido', 'info');
    load();
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Excluir este grupo e todos os seus adicionais?')) return;
    const { error } = await supabase.from('addon_groups').delete().eq('id', id);
    if (error) { showToast('Erro', 'error'); return; }
    showToast('Grupo excluído', 'info');
    load();
  };

  const handleLinkProduct = async (groupId: string, productId: string, link: boolean) => {
    if (link) {
      const { error } = await supabase.from('product_addon_group_links').insert({ product_id: productId, addon_group_id: groupId });
      if (error) { showToast('Erro', 'error'); return; }
      showToast('Produto vinculado!', 'success');
    } else {
      const { error } = await supabase.from('product_addon_group_links').delete().eq('product_id', productId).eq('addon_group_id', groupId);
      if (error) { showToast('Erro', 'error'); return; }
      showToast('Produto desvinculado', 'info');
    }
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-black">Adicionais</h1>
        <button onClick={() => { setEditingGroup(null); setGroupForm({ name: '', is_required: false, min_quantity: 0, max_quantity: 5 }); setShowGroupForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Novo grupo
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 animate-pulse">Carregando...</div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="card overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <button onClick={() => setExpanded(expanded === group.id ? null : group.id)} className="p-1 rounded-lg hover:bg-gray-100">
                  {expanded === group.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-black">{group.name}</p>
                  <p className="text-xs text-gray-400">
                    {group.addons.length} adicionais • {group.is_required ? 'Obrigatório' : 'Opcional'} • Min: {group.min_quantity} Max: {group.max_quantity}
                  </p>
                </div>
                <button onClick={() => { setEditingGroup(group); setGroupForm({ name: group.name, is_required: group.is_required, min_quantity: group.min_quantity, max_quantity: group.max_quantity }); setShowGroupForm(true); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteGroup(group.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {expanded === group.id && (
                <div className="border-t border-gray-100 p-3 space-y-2 animate-fade-in">
                  {group.addons.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-2.5">
                      <span className="text-sm text-gray-800">{addon.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-brand-red">{formatCurrency(addon.price)}</span>
                        <button onClick={() => handleDeleteAddon(addon.id)} className="p-1 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {group.addons.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Nenhum adicional neste grupo.</p>}

                  {showAddonForm === group.id ? (
                    <div className="flex gap-2">
                      <input value={addonForm.name} onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })} placeholder="Nome" className="input-field flex-1" />
                      <input type="number" step="0.01" value={addonForm.price} onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })} placeholder="Preço" className="input-field w-24" />
                      <button onClick={() => handleSaveAddon(group.id)} className="btn-primary shrink-0 px-3">+</button>
                      <button onClick={() => setShowAddonForm(null)} className="px-3 rounded-xl border border-gray-200"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setAddonForm({ name: '', price: '' }); setShowAddonForm(group.id); }} className="w-full flex items-center justify-center gap-1 py-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-brand-red text-xs font-semibold">
                      <Plus className="w-3.5 h-3.5" /> Adicionar item
                    </button>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Vincular a produtos:</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {products.map((prod) => (
                        <ProductLinkToggle key={prod.id} product={prod} groupId={group.id} onToggle={handleLinkProduct} />
                      ))}
                      {products.length === 0 && <p className="text-xs text-gray-400">Nenhum produto cadastrado.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {groups.length === 0 && <p className="text-gray-400 text-center py-8">Nenhum grupo de adicionais.</p>}
        </div>
      )}

      {showGroupForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowGroupForm(false)}>
          <div className="absolute inset-0 bg-black/50 animate-fade-in" />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-black">{editingGroup ? 'Editar grupo' : 'Novo grupo'}</h2>
              <button onClick={() => setShowGroupForm(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome do grupo</label>
                <input value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} className="input-field mt-1" placeholder="Ex: Escolha seus adicionais" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={groupForm.is_required} onChange={(e) => setGroupForm({ ...groupForm, is_required: e.target.checked })} className="accent-brand-red" />
                <span className="text-sm">Obrigatório</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Qtd mínima</label>
                  <input type="number" value={groupForm.min_quantity} onChange={(e) => setGroupForm({ ...groupForm, min_quantity: parseInt(e.target.value) || 0 })} className="input-field mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Qtd máxima</label>
                  <input type="number" value={groupForm.max_quantity} onChange={(e) => setGroupForm({ ...groupForm, max_quantity: parseInt(e.target.value) || 1 })} className="input-field mt-1" />
                </div>
              </div>
              <button onClick={handleSaveGroup} disabled={!groupForm.name.trim()} className="btn-primary w-full">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function ProductLinkToggle({ product, groupId, onToggle }: {
  product: Product;
  groupId: string;
  onToggle: (groupId: string, productId: string, link: boolean) => void;
}) {
  const [linked, setLinked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('product_addon_group_links')
        .select('id')
        .eq('product_id', product.id)
        .eq('addon_group_id', groupId)
        .maybeSingle();
      setLinked(!!data);
      setLoading(false);
    })();
  }, [product.id, groupId]);

  const handleToggle = () => {
    const newState = !linked;
    setLinked(newState);
    onToggle(groupId, product.id, newState);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="w-full flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
    >
      <span className="text-xs text-gray-700 truncate">{product.name}</span>
      {linked ? (
        <Link2 className="w-4 h-4 text-green-500 shrink-0" />
      ) : (
        <Unlink className="w-4 h-4 text-gray-300 shrink-0" />
      )}
    </button>
  );
}
