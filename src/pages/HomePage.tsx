import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Truck, Store, UtensilsCrossed, MapPin, Phone, MessageCircle, Search } from 'lucide-react';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { useStore } from '@/contexts/StoreContext';
import { StoreStatusBadge, ContactButtons } from '@/components/StoreWidgets';
import { ProductCard } from '@/components/ProductCard';
import { ProductDrawer } from '@/components/ProductDrawer';
import { ReviewsSection } from '@/components/ReviewsSection';
import { getProducts, getProductById, getCategories, getReviews } from '@/services/api';
import { useHorizontalWheelScroll } from '@/hooks/useHorizontalWheelScroll';
import { getMapsEmbedUrl } from '@/utils/maps';
import type { Product, ProductWithAddons, Category, Review } from '@/types';
import { formatCurrency } from '@/utils/format';

const GALLERY_FOOD = [
  '/images/alisson2.png',
  '/images/alisson3.png',
  '/images/alisson4.png',
];

const GALLERY_AMBIENTE = [
  '/images/alisson5.png',
];

const HERO_IMAGE = '/images/alisson2.png';

export function HomePage() {
  const { settings } = useStore();
  const categoryScrollRef = useHorizontalWheelScroll<HTMLDivElement>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithAddons | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [galleryTab, setGalleryTab] = useState<'food' | 'ambiente'>('food');
  const [galleryIndex, setGalleryIndex] = useState(0);

  const loadReviews = () => {
    getReviews().then(setReviews).catch((e) => console.error(e));
  };

  useEffect(() => {
    (async () => {
      try {
        const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prods);
        setCategories(cats);
        setFeatured(prods.filter((p) => p.is_featured && p.is_available).slice(0, 6));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    loadReviews();
  }, []);

  const reviewsAvg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const reviewsAvgLabel = reviews.length ? reviewsAvg.toFixed(1).replace('.', ',') : '—';

  const openProduct = async (product: Product) => {
    const full = await getProductById(product.id);
    if (full) setSelectedProduct(full);
  };

  const galleryImages = galleryTab === 'food' ? GALLERY_FOOD : GALLERY_AMBIENTE;

  const scrollGallery = (dir: number) => {
    setGalleryIndex((i) => (i + dir + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative h-[420px] sm:h-[500px] flex items-center justify-center overflow-hidden">
        <img src={HERO_IMAGE} alt="Alisson Lanches" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
          {reviews.length > 0 && (
            <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
              <Star className="w-4 h-4 fill-brand-yellow text-brand-yellow" />
              <span className="text-white font-semibold text-sm">{reviewsAvgLabel}</span>
              <span className="text-white/70 text-sm">• {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}</span>
            </div>
          )}
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
            Desde 2015 levando<br />sabor para Barretos.
          </h1>
          <p className="text-white/80 mt-3 text-sm sm:text-base">{settings?.description}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link to="/cardapio" className="btn-secondary">VER CARDÁPIO</Link>
            <Link to="/cardapio" className="btn-primary">FAZER PEDIDO</Link>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <span className="flex items-center gap-1.5 text-white/90 text-sm"><Truck className="w-4 h-4" /> Delivery</span>
            <span className="flex items-center gap-1.5 text-white/90 text-sm"><Store className="w-4 h-4" /> Retirada</span>
            <span className="flex items-center gap-1.5 text-white/90 text-sm"><UtensilsCrossed className="w-4 h-4" /> Refeição no local</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Status */}
        <div className="flex items-center justify-center">
          <StoreStatusBadge />
        </div>

        {/* Categories quick nav */}
        <section>
          <h2 className="font-display text-xl font-bold text-black mb-4">Categorias</h2>
          <div ref={categoryScrollRef} className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/cardapio?cat=${cat.slug}`}
                className="shrink-0 flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all min-w-[100px]"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-red/20">
                  {(() => { const Icon = getCategoryIcon(cat.slug); return <Icon className="w-6 h-6 text-brand-red" />; })()}
                </div>
                <span className="text-xs font-semibold text-gray-800 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section id="cardapio-destaque">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-black">Mais pedidos</h2>
            <Link to="/cardapio" className="text-sm font-semibold text-brand-red hover:underline">Ver tudo →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card h-64 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => openProduct(product)} />
              ))}
            </div>
          )}
        </section>

        {/* About */}
        <section id="sobre" className="card p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-black mb-3">Sobre o Alisson Lanches</h2>
          <p className="text-gray-600 leading-relaxed">
            {reviews.length > 0 ? (
              <>
                Desde 2015, o Alisson Lanches tem levado sabor para Barretos. Com uma avaliação de {reviewsAvgLabel} estrelas
                e {reviews.length === 1 ? '1 avaliação' : `mais de ${reviews.length} avaliações`} de clientes satisfeitos, oferecemos lanches, hambúrgueres e porções
                com qualidade e sabor que você só encontra aqui.
              </>
            ) : (
              <>
                Desde 2015, o Alisson Lanches tem levado sabor para Barretos, oferecendo lanches, hambúrgueres e porções
                com qualidade e sabor que você só encontra aqui.
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            {reviews.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-brand-yellow text-brand-yellow" />
                  <span className="font-bold text-black">{reviewsAvgLabel}</span>
                  <span className="text-sm text-gray-500">avaliação</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black">{reviews.length}</span>
                  <span className="text-sm text-gray-500">{reviews.length === 1 ? 'avaliação' : 'avaliações'}</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <span className="font-bold text-black">R$ 20-40</span>
              <span className="text-sm text-gray-500">por pessoa</span>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <ReviewsSection reviews={reviews} onChange={loadReviews} />

        {/* Gallery */}
        <section id="galeria">
          <h2 className="font-display text-xl font-bold text-black mb-4">Galeria</h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setGalleryTab('food'); setGalleryIndex(0); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${galleryTab === 'food' ? 'bg-brand-red text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
            >
              Gastronomia
            </button>
            <button
              onClick={() => { setGalleryTab('ambiente'); setGalleryIndex(0); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${galleryTab === 'ambiente' ? 'bg-brand-red text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
            >
              Ambiente
            </button>
          </div>

          {/* Mobile carousel */}
          <div className="md:hidden relative">
            <div className="overflow-hidden rounded-2xl">
              <img src={galleryImages[galleryIndex]} alt="Galeria" className="w-full h-64 object-cover rounded-2xl" />
            </div>
            <button onClick={() => scrollGallery(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-lg">‹</button>
            <button onClick={() => scrollGallery(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-lg">›</button>
            <div className="flex justify-center gap-1.5 mt-2">
              {galleryImages.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === galleryIndex ? 'bg-brand-red' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-4 gap-3">
            {galleryImages.map((img, i) => (
              <div key={i} className="overflow-hidden rounded-2xl h-40 group cursor-pointer">
                <img src={img} alt="Galeria" loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              </div>
            ))}
          </div>
        </section>

        {/* Location */}
        <section id="localizacao" className="card p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-black mb-4">Localização</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-red mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-black text-sm">{settings?.address_street}</p>
                  <p className="text-gray-600 text-sm">{settings?.address_neighborhood}</p>
                  <p className="text-gray-600 text-sm">{settings?.address_city} - {settings?.address_state}</p>
                  <p className="text-gray-600 text-sm">CEP: {settings?.address_zip}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-red" />
                <span className="text-gray-800 text-sm font-medium">{settings?.phone}</span>
              </div>
              <ContactButtons />
            </div>
            <div className="rounded-2xl overflow-hidden h-64 bg-gray-100">
              <iframe
                src={getMapsEmbedUrl(settings)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title={`Mapa ${settings?.store_name || 'Alisson Lanches'}`}
              />
            </div>
          </div>
        </section>
      </div>

      <ProductDrawer product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
