import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Truck, Store, QrCode, Copy, CreditCard, Banknote, Wallet, MapPin } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { useToast } from '@/components/ui/Toast';
import { getDeliveryZones, createOrder, getAddresses } from '@/services/api';
import { useHorizontalWheelScroll } from '@/hooks/useHorizontalWheelScroll';
import { formatCurrency } from '@/utils/format';
import type { DeliveryZone, Address, PaymentMethod, DeliveryType } from '@/types';

type Step = 'dados' | 'entrega' | 'pagamento' | 'revisao' | 'confirmacao';

const STEPS: { key: Step; label: string }[] = [
  { key: 'dados', label: 'Dados' },
  { key: 'entrega', label: 'Entrega' },
  { key: 'pagamento', label: 'Pagamento' },
  { key: 'revisao', label: 'Revisão' },
  { key: 'confirmacao', label: 'Confirmação' },
];

export function CheckoutPage() {
  const stepsScrollRef = useHorizontalWheelScroll<HTMLDivElement>();
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { settings, paymentSettings } = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('dados');
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [address, setAddress] = useState({
    street: '', number: '', complement: '', neighborhood: '',
    city: settings?.address_city || 'Barretos', state: settings?.address_state || 'SP',
    zip: '', reference: '',
  });
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cardType, setCardType] = useState<'credito' | 'debito'>('credito');
  const [needsChange, setNeedsChange] = useState(false);
  const [changeFor, setChangeFor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<number | null>(null);
  const [couponData, setCouponData] = useState<{ couponId: string | null; discount: number }>({ couponId: null, discount: 0 });

  useEffect(() => {
    getDeliveryZones().then(setZones).catch(console.error);
  }, []);

  useEffect(() => {
    if (user) {
      getAddresses(user.id).then(setSavedAddresses).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    const savedCoupon = sessionStorage.getItem('checkout-coupon');
    const savedDiscount = sessionStorage.getItem('checkout-discount');
    if (savedCoupon && savedCoupon !== 'null') {
      const parsed = JSON.parse(savedCoupon);
      setCouponData({ couponId: parsed.couponId, discount: parseFloat(savedDiscount || '0') });
    }
  }, []);

  const selectedZone = zones.find((z) => z.id === selectedZoneId);
  const deliveryFee = deliveryType === 'pickup' ? 0 : (selectedZone?.delivery_fee || 0);
  const discount = couponData.discount;
  const total = Math.max(0, subtotal - discount) + deliveryFee;

  if (items.length === 0 && step !== 'confirmacao') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-gray-500 mb-4">Sua sacola está vazia.</p>
        <Link to="/cardapio" className="btn-primary">Ver Cardápio</Link>
      </div>
    );
  }

  const canProceedDados = name.trim() && phone.trim();
  const belowMinOrder = !!(selectedZone && selectedZone.min_order > 0 && subtotal < selectedZone.min_order);
  const canProceedEntrega = deliveryType === 'pickup' || (!!selectedZone && !belowMinOrder && !!address.street && !!address.number && !!address.neighborhood && !!address.zip);

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setAddress({
      street: addr.street, number: addr.number, complement: addr.complement || '',
      neighborhood: addr.neighborhood, city: addr.city, state: addr.state,
      zip: addr.zip, reference: addr.reference || '',
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { order, error } = await createOrder({
        user_id: user?.id || null,
        customer_name: name,
        customer_phone: phone,
        customer_email: user?.email || null,
        delivery_type: deliveryType,
        address_street: deliveryType === 'pickup' ? null : address.street,
        address_number: deliveryType === 'pickup' ? null : address.number,
        address_complement: deliveryType === 'pickup' ? null : address.complement || null,
        address_neighborhood: deliveryType === 'pickup' ? null : address.neighborhood,
        address_city: deliveryType === 'pickup' ? null : address.city,
        address_state: deliveryType === 'pickup' ? null : address.state,
        address_zip: deliveryType === 'pickup' ? null : address.zip,
        address_reference: deliveryType === 'pickup' ? null : address.reference || null,
        delivery_zone_id: deliveryType === 'pickup' ? null : selectedZoneId || null,
        delivery_fee: deliveryFee,
        payment_method: paymentMethod,
        payment_card_type: paymentMethod === 'card' ? cardType : null,
        cash_change_for: paymentMethod === 'cash' && needsChange ? parseFloat(changeFor) || null : null,
        subtotal,
        discount,
        total,
        coupon_id: couponData.couponId,
        notes: null,
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_price: item.product_price,
          quantity: item.quantity,
          notes: item.notes || null,
          addons: item.addons,
        })),
      });

      if (error) {
        showToast('Erro ao criar pedido: ' + error, 'error');
        setSubmitting(false);
        return;
      }

      if (order) {
        setCompletedOrderNumber(order.order_number);
        clearCart();
        sessionStorage.removeItem('checkout-coupon');
        sessionStorage.removeItem('checkout-discount');
        setStep('confirmacao');
        showToast('Pedido realizado com sucesso!', 'success');
      }
    } catch (e) {
      showToast('Algo deu errado. Tente novamente.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyPixKey = () => {
    if (paymentSettings?.pix_key) {
      navigator.clipboard.writeText(paymentSettings.pix_key);
      showToast('Chave PIX copiada!', 'success');
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-display text-2xl font-bold text-black mb-2">Checkout</h1>

        {/* Step indicator */}
        <div ref={stepsScrollRef} className="flex items-center gap-1 mb-6 overflow-x-auto no-scrollbar">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1 shrink-0">
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                i === stepIndex ? 'bg-brand-red text-white' : i < stepIndex ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {i < stepIndex ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
            </div>
          ))}
        </div>

        {/* Step: Dados */}
        {step === 'dados' && (
          <div className="card p-5 space-y-4 animate-fade-in">
            <h2 className="font-semibold text-black">Seus dados</h2>
            <div>
              <label className="text-sm font-medium text-gray-700">Nome*</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" className="input-field mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Telefone*</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" className="input-field mt-1" />
            </div>
            {!user && (
              <p className="text-xs text-gray-400">Você está comprando como visitante. Crie uma conta depois para acompanhar seus pedidos.</p>
            )}
            <button onClick={() => canProceedDados ? setStep('entrega') : showToast('Preencha os dados', 'warning')} disabled={!canProceedDados} className="btn-primary w-full">
              Continuar
            </button>
          </div>
        )}

        {/* Step: Entrega */}
        {step === 'entrega' && (
          <div className="card p-5 space-y-4 animate-fade-in">
            <h2 className="font-semibold text-black">Tipo de entrega</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryType('delivery')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${deliveryType === 'delivery' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}`}
              >
                <Truck className="w-6 h-6 text-brand-red" />
                <span className="text-sm font-semibold">Entrega</span>
              </button>
              <button
                onClick={() => setDeliveryType('pickup')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${deliveryType === 'pickup' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}`}
              >
                <Store className="w-6 h-6 text-brand-red" />
                <span className="text-sm font-semibold">Retirada no local</span>
              </button>
            </div>

            {deliveryType === 'pickup' ? (
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-brand-red inline mr-1" />
                Retirar em: {settings?.address_street}, {settings?.address_neighborhood}, {settings?.address_city} - {settings?.address_state}
              </div>
            ) : (
              <>
                {savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Endereços salvos</label>
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${selectedAddressId === addr.id ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}`}
                      >
                        <p className="text-sm font-semibold text-black">{addr.label}</p>
                        <p className="text-xs text-gray-500">{addr.street}, {addr.number} - {addr.neighborhood}</p>
                      </button>
                    ))}
                    <p className="text-xs text-gray-400">Ou preencha um novo endereço:</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Região de entrega*</label>
                  {zones.length === 0 ? (
                    <p className="text-sm text-orange-600 bg-orange-50 rounded-xl p-3 mt-1">
                      Nenhuma região de entrega disponível no momento. Escolha "Retirada no local" ou entre em contato pelo WhatsApp.
                    </p>
                  ) : (
                    <select value={selectedZoneId} onChange={(e) => setSelectedZoneId(e.target.value)} className="input-field mt-1">
                      <option value="">Selecione sua região</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} — Taxa: {formatCurrency(z.delivery_fee)} • {z.estimated_time}
                        </option>
                      ))}
                    </select>
                  )}
                  {belowMinOrder && (
                    <p className="text-xs text-orange-500 mt-1">
                      Pedido mínimo para essa região: {formatCurrency(selectedZone!.min_order)} (faltam {formatCurrency(selectedZone!.min_order - subtotal)})
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Rua*</label>
                    <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nº*</label>
                    <input value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} className="input-field mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Complemento</label>
                    <input value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bairro*</label>
                    <input value={address.neighborhood} onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })} className="input-field mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">CEP*</label>
                    <input value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} className="input-field mt-1" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Cidade*</label>
                    <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="input-field mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Ponto de referência</label>
                  <input value={address.reference} onChange={(e) => setAddress({ ...address, reference: e.target.value })} placeholder="Ex: próximo ao mercado" className="input-field mt-1" />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <button onClick={() => setStep('dados')} className="flex items-center gap-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={() => {
                  if (canProceedEntrega) {
                    setStep('pagamento');
                  } else if (belowMinOrder) {
                    showToast(`Pedido mínimo para essa região: ${formatCurrency(selectedZone!.min_order)}`, 'warning');
                  } else {
                    showToast('Preencha o endereço', 'warning');
                  }
                }}
                disabled={!canProceedEntrega}
                className="btn-primary flex-1"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step: Pagamento */}
        {step === 'pagamento' && (
          <div className="card p-5 space-y-4 animate-fade-in">
            <h2 className="font-semibold text-black">Forma de pagamento</h2>

            {paymentSettings?.pix_enabled && (
              <button
                onClick={() => setPaymentMethod('pix')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${paymentMethod === 'pix' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}`}
              >
                <QrCode className="w-6 h-6 text-brand-red" />
                <span className="text-sm font-semibold">PIX</span>
              </button>
            )}

            {paymentSettings?.card_enabled && (
              <button
                onClick={() => setPaymentMethod('card')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${paymentMethod === 'card' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}`}
              >
                <CreditCard className="w-6 h-6 text-brand-red" />
                <span className="text-sm font-semibold">Cartão</span>
              </button>
            )}

            {paymentMethod === 'card' && (
              <div className="pl-4 space-y-2">
                {paymentSettings?.card_credit && (
                  <label className="flex items-center gap-2 p-2 rounded-lg cursor-pointer">
                    <input type="radio" name="cardType" checked={cardType === 'credito'} onChange={() => setCardType('credito')} className="accent-brand-red" />
                    <span className="text-sm">Crédito</span>
                  </label>
                )}
                {paymentSettings?.card_debit && (
                  <label className="flex items-center gap-2 p-2 rounded-lg cursor-pointer">
                    <input type="radio" name="cardType" checked={cardType === 'debito'} onChange={() => setCardType('debito')} className="accent-brand-red" />
                    <span className="text-sm">Débito</span>
                  </label>
                )}
                {paymentSettings?.card_instructions && (
                  <p className="text-xs text-gray-500 mt-1">{paymentSettings.card_instructions}</p>
                )}
                <p className="text-xs text-gray-400">O pagamento será feito presencialmente na loja.</p>
              </div>
            )}

            {paymentSettings?.cash_enabled && (
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${paymentMethod === 'cash' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}`}
              >
                <Banknote className="w-6 h-6 text-brand-red" />
                <span className="text-sm font-semibold">Dinheiro</span>
              </button>
            )}

            {paymentMethod === 'cash' && paymentSettings?.cash_change_available && (
              <div className="pl-4 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={needsChange} onChange={(e) => setNeedsChange(e.target.checked)} className="accent-brand-red" />
                  <span className="text-sm">Precisa de troco?</span>
                </label>
                {needsChange && (
                  <input
                    type="number"
                    value={changeFor}
                    onChange={(e) => setChangeFor(e.target.value)}
                    placeholder="Troco para R$"
                    className="input-field"
                  />
                )}
              </div>
            )}

            {!paymentSettings?.pix_enabled && !paymentSettings?.card_enabled && !paymentSettings?.cash_enabled && (
              <p className="text-sm text-gray-500">Nenhum método de pagamento configurado. Entre em contato com a loja.</p>
            )}

            <div className="flex gap-2">
              <button onClick={() => setStep('entrega')} className="flex items-center gap-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              <button onClick={() => setStep('revisao')} className="btn-primary flex-1">Continuar</button>
            </div>
          </div>
        )}

        {/* Step: Revisao */}
        {step === 'revisao' && (
          <div className="card p-5 space-y-4 animate-fade-in">
            <h2 className="font-semibold text-black">Revisão do pedido</h2>

            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-semibold text-black">Cliente</p>
                <p className="text-gray-600">{name} • {phone}</p>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-black">Entrega</p>
                {deliveryType === 'pickup' ? (
                  <p className="text-gray-600">Retirada no local</p>
                ) : (
                  <p className="text-gray-600">
                    {address.street}, {address.number} {address.complement && `- ${address.complement}`}<br />
                    {address.neighborhood} - {address.city}/{address.state} - CEP: {address.zip}
                  </p>
                )}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-black">Pagamento</p>
                <p className="text-gray-600">
                  {paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'card' ? `Cartão (${cardType})` : 'Dinheiro'}
                  {paymentMethod === 'cash' && needsChange && ` — Troco para R$ ${changeFor}`}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.quantity}x {item.product_name}</span>
                  <span className="font-medium text-gray-700">{formatCurrency(item.total_price)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Desconto</span><span>- {formatCurrency(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-600">Taxa de entrega</span><span>{formatCurrency(deliveryFee)}</span></div>
              <div className="flex justify-between font-bold text-base pt-1"><span className="text-black">Total</span><span className="text-brand-red">{formatCurrency(total)}</span></div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep('pagamento')} className="flex items-center gap-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Enviando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirmacao */}
        {step === 'confirmacao' && completedOrderNumber && (
          <div className="card p-6 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-display text-xl font-bold text-black">Pedido realizado com sucesso!</h2>
            <p className="text-gray-600">Seu pedido é o <span className="font-bold text-brand-red">#{completedOrderNumber}</span></p>

            {paymentMethod === 'pix' && paymentSettings?.pix_enabled && (
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3">
                <h3 className="font-semibold text-sm text-black">Pagamento via PIX</h3>
                {paymentSettings.pix_receiver_name && (
                  <p className="text-sm text-gray-600">Recebedor: {paymentSettings.pix_receiver_name}</p>
                )}
                <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-gray-200">
                  <Wallet className="w-5 h-5 text-brand-red shrink-0" />
                  <span className="text-sm font-mono flex-1 truncate">{paymentSettings.pix_key || 'Chave não configurada'}</span>
                  {paymentSettings.pix_key && (
                    <button onClick={copyPixKey} className="flex items-center gap-1 text-xs font-semibold text-brand-red">
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                  )}
                </div>
                {paymentSettings.pix_instructions && (
                  <p className="text-xs text-gray-500">{paymentSettings.pix_instructions}</p>
                )}
                {paymentSettings.pix_qr_code_url && (
                  <div className="flex flex-col items-center gap-2">
                    <img src={paymentSettings.pix_qr_code_url} alt="QR Code PIX" className="w-48 h-48 rounded-xl object-contain" />
                    <p className="text-xs text-gray-400">Escaneie o QR Code para pagar</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Link to={`/pedido/${completedOrderNumber}`} className="btn-primary">Acompanhar Pedido</Link>
              <Link to="/cardapio" className="text-sm text-gray-500 hover:text-brand-red">Fazer novo pedido</Link>
            </div>

            {!user && (
              <div className="bg-brand-yellow/20 rounded-xl p-4 mt-4">
                <p className="text-sm font-semibold text-black">Crie uma conta para acompanhar seus pedidos e salvar seus dados.</p>
                <Link to="/entrar" className="text-sm font-semibold text-brand-red hover:underline mt-1 inline-block">Criar conta →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
