import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Phone, MapPin, Package, LogOut, Plus, Trash2, Edit3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { ImageUpload } from '@/components/ImageUpload';
import { getOrdersByUser, getAddresses, saveAddress, deleteAddress } from '@/services/api';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Order, Address } from '@/types';

export function ProfilePage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Casa', street: '', number: '', complement: '', neighborhood: '', city: 'Barretos', state: 'SP', zip: '', reference: '' });

  useEffect(() => {
    if (!user) {
      navigate('/entrar');
      return;
    }
    getOrdersByUser(user.id).then(setOrders).catch(console.error);
    getAddresses(user.id).then(setAddresses).catch(console.error);
  }, [user, navigate]);

  useEffect(() => {
    setEditName(profile?.name || '');
    setEditPhone(profile?.phone || '');
    setAvatarUrl(profile?.avatar_url || '');
  }, [profile]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateProfile(editName, editPhone, avatarUrl);
    if (error) {
      showToast('Erro ao salvar', 'error');
    } else {
      showToast('Perfil atualizado!', 'success');
    }
    setSaving(false);
  };

  const handleAvatarChange = async (url: string) => {
    setAvatarUrl(url);
    const { error } = await updateProfile(editName || profile?.name || '', editPhone || profile?.phone || '', url);
    if (error) {
      showToast('Erro ao salvar a foto', 'error');
    } else {
      showToast(url ? 'Foto atualizada!' : 'Foto removida', 'success');
    }
  };

  const handleSaveAddress = async () => {
    if (!newAddr.street || !newAddr.number || !newAddr.neighborhood || !newAddr.zip) {
      showToast('Preencha os campos obrigatórios', 'warning');
      return;
    }
    const { error } = await saveAddress({ ...newAddr, user_id: user.id });
    if (error) {
      showToast('Erro ao salvar endereço', 'error');
    } else {
      showToast('Endereço salvo!', 'success');
      const updated = await getAddresses(user.id);
      setAddresses(updated);
      setShowAddrForm(false);
      setNewAddr({ label: 'Casa', street: '', number: '', complement: '', neighborhood: '', city: 'Barretos', state: 'SP', zip: '', reference: '' });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const { error } = await deleteAddress(id);
    if (error) {
      showToast('Erro ao excluir', 'error');
    } else {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showToast('Endereço removido', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-4">
            <ImageUpload bucket="avatars" folder={user.id} value={avatarUrl} onChange={handleAvatarChange} shape="circle" />
            <div className="flex-1">
              <h1 className="font-display text-xl font-bold text-black">{profile?.name || 'Cliente'}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              {profile?.role === 'admin' && (
                <Link to="/admin" className="inline-block mt-1 text-xs font-semibold text-white bg-black px-3 py-1 rounded-full">Painel Admin</Link>
              )}
            </div>
            <button onClick={() => { signOut(); navigate('/'); }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'profile' as const, label: 'Perfil', icon: UserIcon },
            { key: 'orders' as const, label: 'Pedidos', icon: Package },
            { key: 'addresses' as const, label: 'Endereços', icon: MapPin },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === t.key ? 'bg-brand-red text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="card p-5 space-y-4 animate-fade-in">
            <div>
              <label className="text-sm font-medium text-gray-700">Nome</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Telefone</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">E-mail</label>
              <input value={user.email || ''} disabled className="input-field mt-1 bg-gray-50 text-gray-500" />
            </div>
            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary w-full">
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        )}

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className="space-y-3 animate-fade-in">
            {orders.length === 0 ? (
              <div className="card p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">Você ainda não fez pedidos.</p>
                <Link to="/cardapio" className="btn-primary">Fazer primeiro pedido</Link>
              </div>
            ) : (
              orders.map((order) => (
                <Link key={order.id} to={`/pedido/${order.order_number}`} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <p className="font-semibold text-black text-sm">Pedido #{order.order_number}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                    <p className="text-xs text-gray-400 mt-1">{order.order_items?.length || 0} {order.order_items?.length === 1 ? 'item' : 'itens'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-red">{formatCurrency(order.total)}</p>
                    <span className={`badge mt-1 ${
                      order.status === 'ENTREGUE' ? 'bg-green-100 text-green-700' :
                      order.status === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{order.status}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Addresses tab */}
        {tab === 'addresses' && (
          <div className="space-y-3 animate-fade-in">
            {addresses.map((addr) => (
              <div key={addr.id} className="card p-4 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-red mt-0.5" />
                  <div>
                    <p className="font-semibold text-black text-sm">{addr.label}</p>
                    <p className="text-sm text-gray-600">{addr.street}, {addr.number}</p>
                    <p className="text-xs text-gray-500">{addr.neighborhood} - {addr.city}/{addr.state}</p>
                    <p className="text-xs text-gray-400">CEP: {addr.zip}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-red-500 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {showAddrForm ? (
              <div className="card p-4 space-y-3 animate-scale-in">
                <div>
                  <label className="text-sm font-medium text-gray-700">Label (Casa, Trabalho...)</label>
                  <input value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} className="input-field mt-1" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Rua*</label>
                    <input value={newAddr.street} onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nº*</label>
                    <input value={newAddr.number} onChange={(e) => setNewAddr({ ...newAddr, number: e.target.value })} className="input-field mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Complemento</label>
                    <input value={newAddr.complement} onChange={(e) => setNewAddr({ ...newAddr, complement: e.target.value })} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bairro*</label>
                    <input value={newAddr.neighborhood} onChange={(e) => setNewAddr({ ...newAddr, neighborhood: e.target.value })} className="input-field mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">CEP*</label>
                    <input value={newAddr.zip} onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })} className="input-field mt-1" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Cidade*</label>
                    <input value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} className="input-field mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Referência</label>
                  <input value={newAddr.reference} onChange={(e) => setNewAddr({ ...newAddr, reference: e.target.value })} className="input-field mt-1" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddrForm(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold">Cancelar</button>
                  <button onClick={handleSaveAddress} className="btn-primary flex-1">Salvar endereço</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddrForm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-brand-red hover:text-brand-red transition-colors text-sm font-semibold">
                <Plus className="w-4 h-4" /> Adicionar endereço
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
