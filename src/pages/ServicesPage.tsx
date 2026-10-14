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
  FilterX
} from 'lucide-react';
import { CategoryFilter } from '../components/CategoryFilter';
import { ServiceCard } from '../components/ServiceCard';
import { TelegramBanner } from '../components/TelegramBanner';
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
      
      {/* 1. Services Header Banner with Peruvian Mascot & Guarantee Seals */}
      <section className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-[#03140a] via-[#051c0f] to-[#020d06] border border-emerald-500/35 shadow-[0_0_50px_rgba(0,255,136,0.14)] overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono text-[#00ff88] tracking-widest uppercase">
              <Package className="w-4 h-4 text-[#00ff88]" />
              <span>CATÁLOGO DIGITAL // ACTIVACIÓN INMEDIATA 24/7</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Catálogo Oficial de <span className="text-[#00ff88] neon-glow-green">Servicios & Cuentas</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Suscripciones privadas 4K UHD, auditorías de fuentes abiertas OSINT y software original. Todas las compras cuentan con reposición inmediata por parte de nuestros creadores autorizados.
            </p>

            {/* Quick Guarantees Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#020b05] border border-emerald-900/60 text-xs">
                <Zap className="w-4 h-4 text-[#00ff88] shrink-0" />
                <span className="font-bold text-white font-mono text-[11px]">3 a 5 min entrega</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#020b05] border border-emerald-900/60 text-xs">
                <ShieldCheck className="w-4 h-4 text-[#00ff88] shrink-0" />
                <span className="font-bold text-white font-mono text-[11px]">100% Reposición</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#020b05] border border-emerald-900/60 text-xs col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
                <span className="font-bold text-white font-mono text-[11px]">Cuentas privadas</span>
              </div>
            </div>
          </div>

          {/* Peruvian Llama Character */}
          <div className="relative shrink-0 w-44 sm:w-52 lg:w-56 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <img
              src="/imagenes/llama-about.png"
              alt="Mascota Descuentos Perú"
              className="relative z-10 w-full h-auto max-h-64 object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]"
            />
          </div>
        </div>
      </section>

      {/* 2. Interactive Category Filter Deck & Creator Avatars */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        vendors={vendors}
        selectedVendorId={selectedVendorId}
        onSelectVendorId={setSelectedVendorId}
        categoryCounts={categoryCounts}
      />

      {/* 3. Results Summary Strip */}
      <div className="flex items-center justify-between gap-4 px-2">
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <span>
            Mostrando <strong className="text-white font-bold">{filteredServices.length}</strong> de {services.filter(s => s.active !== false).length} servicios disponibles
          </span>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('todos');
              setSelectedVendorId('todos');
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold text-rose-300 bg-rose-950/60 border border-rose-800/60 hover:bg-rose-900 hover:text-white transition-all cursor-pointer"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Limpiar filtros</span>
          </button>
        )}
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

      {/* 5. Payment Methods Guaranteed Banner */}
      {paymentMethods.filter((p) => p.active).length > 0 && (
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#06140c]/90 border border-emerald-900/50 shadow-[0_0_30px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00ff88] block mb-1">
                FORMAS DE PAGO GARANTIZADAS
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Paga con total confianza y rapidez
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Aceptamos transferencias bancarias peruanas inmediatas, billeteras digitales y criptomonedas con activación en minutos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {paymentMethods
                .filter((p) => p.active)
                .map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#030d07] border border-emerald-900/60 shadow-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
                    <span className="text-xs font-bold text-white">{method.name}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Support Coordination Banner */}
      <TelegramBanner onNavigateToContact={onNavigateToContact} />
    </div>
  );
};
