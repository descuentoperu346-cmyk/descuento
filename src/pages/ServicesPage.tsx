import React, { useState, useMemo } from 'react';
import {
  Search,
  Package,
  Sparkles,
  ShoppingBag,
  Send,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  FilterX,
  Tv,
  ExternalLink
} from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard';
import { TelegramBanner } from '../components/TelegramBanner';
import { PaymentMethodsBanner } from '../components/PaymentMethodsBanner';
import { ServiceItem, TELEGRAM_URL } from '../data/servicesData';
import { Vendor } from '../data/vendorsData';
import { PaymentMethodItem } from '../data/paymentsData';

interface ServicesPageProps {
  services: ServiceItem[];
  vendors: Vendor[];
  customImages: Record<string, string>;
  onImageUpload: (serviceId: string, dataUrl: string) => void;
  onOpenDetails: (service: ServiceItem) => void;
  paymentMethods: PaymentMethodItem[];
  onNavigateToContact: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  vendors,
  customImages,
  onImageUpload,
  onOpenDetails,
  paymentMethods,
  onNavigateToContact
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      if (service.active === false) return false;

      const matchesCategory =
        selectedCategory === 'todos' || service.category === selectedCategory;

      const matchesVendor =
        selectedVendorId === 'todos' ||
        service.vendorId === selectedVendorId ||
        (service.assignedVendorIds && service.assignedVendorIds.includes(selectedVendorId)) ||
        vendors.some(
          (v) =>
            v.id === selectedVendorId &&
            v.active &&
            v.allowedServiceIds.includes(service.id)
        );

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.categoryLabel.toLowerCase().includes(query) ||
        service.subItemLabel.toLowerCase().includes(query) ||
        service.details.overview.toLowerCase().includes(query) ||
        (service.details.plans &&
          service.details.plans.some((p) =>
            p.name.toLowerCase().includes(query)
          ));

      return matchesCategory && matchesVendor && matchesSearch;
    });
  }, [services, vendors, selectedCategory, selectedVendorId, searchQuery]);

  const categoryCounts = useMemo(() => {
    const active = services.filter((s) => s.active !== false);
    return {
      todos: active.length,
      streaming: active.filter((s) => s.category === 'streaming').length,
      investigacion: active.filter((s) => s.category === 'investigacion').length,
      educacion: active.filter((s) => s.category === 'educacion').length
    };
  }, [services]);

  const isFiltered = selectedCategory !== 'todos' || selectedVendorId !== 'todos' || searchQuery !== '';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Direct Catalog Header & Filters (Zero repetitive boxes) */}
      <div className="space-y-4 pt-2">
        {/* Title & Stats Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/15">
          <div className="text-left space-y-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono text-[#00ff88] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <span>CATÁLOGO OFICIAL · ACTIVACIÓN INMEDIATA EN PERÚ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cuentas Premium & <span className="text-[#00ff88] neon-glow-green">Servicios Digitales</span>
            </h1>
          </div>

          {/* Quick Value Indicators & Official Sales Catalogs */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <a
              href="https://t.me/ShopAbbys"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#041a0e] border border-emerald-500/40 hover:border-[#00ff88] text-white hover:text-[#00ff88] transition-all flex items-center gap-1.5 shadow-sm font-bold group"
              title="Abrir Catálogo Oficial de Ventas de Abbys en Telegram"
            >
              <Send className="w-3 h-3 text-[#00ff88] group-hover:scale-110 transition-transform" />
              <span>Catálogo Abbys</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>

            <a
              href="https://t.me/whiskyrefes"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#041a0e] border border-emerald-500/40 hover:border-[#00ff88] text-white hover:text-[#00ff88] transition-all flex items-center gap-1.5 shadow-sm font-bold group"
              title="Abrir Catálogo y Referencias de Whisky en Telegram"
            >
              <Send className="w-3 h-3 text-[#00ff88] group-hover:scale-110 transition-transform" />
              <span>Catálogo Whisky</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>

            <span className="px-2.5 py-1.5 rounded-xl bg-black/60 border border-emerald-500/25 text-emerald-300 hidden md:flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#00ff88]" />
              3 a 5 min entrega
            </span>
          </div>
        </div>

        {/* 2. Category Switcher Tabs + Search Input */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Category Tabs: smooth swipe on mobile, wrapped on larger screens */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none sm:flex-wrap">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('todos');
                setSelectedVendorId('todos');
                setSearchQuery('');
              }}
              className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                selectedCategory === 'todos' && selectedVendorId === 'todos' && searchQuery === ''
                  ? 'bg-[#00ff88] text-slate-950 shadow-[0_0_18px_rgba(0,255,136,0.45)] font-black scale-102'
                  : 'bg-[#030d07] text-slate-300 hover:text-white border border-emerald-900/80 hover:border-emerald-500/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Todos ({categoryCounts.todos})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('streaming')}
              className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                selectedCategory === 'streaming'
                  ? 'bg-[#00ff88] text-slate-950 shadow-[0_0_18px_rgba(0,255,136,0.45)] font-black scale-102'
                  : 'bg-[#030d07] text-cyan-300 hover:text-white border border-cyan-900/60 hover:border-cyan-500/60'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Streaming 4K ({categoryCounts.streaming})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('investigacion')}
              className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                selectedCategory === 'investigacion'
                  ? 'bg-[#00ff88] text-slate-950 shadow-[0_0_18px_rgba(0,255,136,0.45)] font-black scale-102'
                  : 'bg-[#030d07] text-rose-300 hover:text-white border border-rose-900/60 hover:border-rose-500/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Investigación OSINT ({categoryCounts.investigacion})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('educacion')}
              className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                selectedCategory === 'educacion'
                  ? 'bg-[#00ff88] text-slate-950 shadow-[0_0_18px_rgba(0,255,136,0.45)] font-black scale-102'
                  : 'bg-[#030d07] text-amber-300 hover:text-white border border-amber-900/60 hover:border-amber-500/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Software & Apps ({categoryCounts.educacion})</span>
            </button>
          </div>

          {/* Instant Search Bar */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#00ff88] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar servicio (ej. Netflix, OSINT)..."
                className="w-full pl-8 pr-7 py-2 rounded-xl bg-black/70 border border-emerald-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all font-sans shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <FilterX className="w-3 h-3" />
                </button>
              )}
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('todos');
                  setSelectedVendorId('todos');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-mono font-bold text-rose-300 bg-rose-950/60 border border-rose-800/60 hover:bg-rose-900 hover:text-white transition-all cursor-pointer whitespace-nowrap shrink-0"
                title="Restablecer todos los filtros"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Strip */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span>
              Mostrando <strong className="text-white font-bold">{filteredServices.length}</strong> de {services.filter((s) => s.active !== false).length} servicios oficiales
            </span>
          </div>
        </div>
      </div>

      {/* 4. 3-Column Service Cards Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              customImage={customImages[service.id]}
              onImageUpload={onImageUpload}
              onOpenDetails={onOpenDetails}
              vendors={vendors}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#06140c] rounded-3xl border border-emerald-950 p-8 space-y-4 shadow-xl">
          <Package className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No encontramos servicios coincidentes</h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            Prueba ajustando el término de búsqueda o cambiando el filtro de creador seleccionado.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('todos');
              setSelectedVendorId('todos');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-[#00ff88] rounded-xl hover:bg-[#00e676] cursor-pointer font-mono shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all"
          >
            Restablecer todos los filtros
          </button>
        </div>
      )}

      {/* 5. Payment Methods Guaranteed Banner with Real Official App Logos */}
      <PaymentMethodsBanner paymentMethods={paymentMethods} className="mt-12" />

      {/* 6. Support Coordination Banner */}
      <TelegramBanner onNavigateToContact={onNavigateToContact} />
    </div>
  );
};
