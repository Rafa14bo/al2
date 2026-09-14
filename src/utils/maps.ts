import type { StoreSettings } from '@/types';

const DEFAULT_PLACEHOLDER_MAPS_URL = 'https://maps.app.goo.gl/FPZJGGSdgLcUPGEAA';

function buildAddressQuery(settings: StoreSettings | null): string {
  if (!settings) return '';
  const parts = [
    settings.store_name,
    settings.address_street,
    settings.address_neighborhood,
    settings.address_city && settings.address_state
      ? `${settings.address_city} - ${settings.address_state}`
      : settings.address_city,
    settings.address_zip,
  ].filter(Boolean);
  return parts.join(', ');
}

/** Link para abrir o Google Maps (app ou site) com o endereço real da loja. */
export function getMapsSearchUrl(settings: StoreSettings | null): string {
  // Se o admin já colou um link próprio (ex: do Google Business, com fotos e
  // avaliações), respeita ele. Só usa o endereço automático se o campo ainda
  // estiver com o link de exemplo padrão ou vazio.
  if (settings?.maps_url && settings.maps_url !== DEFAULT_PLACEHOLDER_MAPS_URL) {
    return settings.maps_url;
  }
  const query = buildAddressQuery(settings);
  if (!query) return DEFAULT_PLACEHOLDER_MAPS_URL;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** URL para o <iframe> do mapa incorporado, sempre a partir do endereço real. */
export function getMapsEmbedUrl(settings: StoreSettings | null): string {
  const query = buildAddressQuery(settings) || 'Barretos, SP';
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}
