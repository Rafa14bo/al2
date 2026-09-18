import { Phone, MessageCircle, MapPin } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { getMapsSearchUrl } from '@/utils/maps';

export function WhatsAppButton() {
  const { settings } = useStore();
  const location = useLocation();
  const whatsapp = settings?.whatsapp || '5517981467315';

  if (location.pathname === '/sacola') return null;

  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-24 right-4 z-30 w-14 h-14 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors animate-pulse-ring"
      title="Fale conosco"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.25-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.23-.17-.48-.29z"/>
      </svg>
    </a>
  );
}

export function StoreStatusBadge() {
  const { isOpen, settings, businessHours } = useStore();

  if (settings?.is_temporarily_closed) {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-700">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        Loja fechada temporariamente
      </span>
    );
  }

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const today = businessHours.find((h) => h.day_of_week === now.getDay());

  let timeInfo = '';
  if (isOpen && today?.close_time) {
    const [h, m] = today.close_time.split(':').map(Number);
    const closeDate = new Date(now);
    closeDate.setHours(h, m, 0, 0);
    const diffMin = Math.max(0, Math.round((closeDate.getTime() - now.getTime()) / 60000));
    const hh = Math.floor(diffMin / 60);
    const mm = diffMin % 60;
    const remaining = hh > 0 ? `${hh}h${mm > 0 ? ` ${mm}min` : ''}` : `${mm}min`;
    timeInfo = ` · fecha às ${today.close_time} (faltam ${remaining})`;
  } else if (!isOpen && today?.is_open && today?.open_time && currentTime < today.open_time) {
    timeInfo = ` · abre hoje às ${today.open_time}`;
  }

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      {isOpen ? 'Loja aberta' : 'Loja fechada'}{timeInfo}
    </span>
  );
}

export function ContactButtons() {
  const { settings } = useStore();
  const phone = settings?.phone || '(17) 98146-7315';
  const whatsapp = settings?.whatsapp || '5517981467315';
  const mapsUrl = getMapsSearchUrl(settings);

  const phoneDigits = phone.replace(/\D/g, '');
  const telLink = phoneDigits.length === 11 ? `55${phoneDigits}` : phoneDigits;

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
      >
        <MapPin className="w-4 h-4" />
        Como Chegar
      </a>
      <a
        href={`tel:${telLink}`}
        className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-800 text-sm font-semibold hover:border-brand-red hover:text-brand-red transition-colors"
      >
        <Phone className="w-4 h-4" />
        Ligar
      </a>
      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </a>
    </div>
  );
}