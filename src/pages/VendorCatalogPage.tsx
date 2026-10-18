import React, { useMemo } from 'react';
import { ArrowLeft, Send, Star, ShoppingBag, MessageCircle, Package } from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard';
import { PaymentMethodsBanner } from '../components/PaymentMethodsBanner';
import { ServiceItem } from '../data/servicesData';
import { Vendor } from '../data/vendorsData';
import { PaymentMethodItem } from '../data/paymentsData';
import { recordVendorClickEvent } from '../data/telemetryData';

interface VendorCatalogPageProps {
  slug: string;
  services: ServiceItem[];
  vendors: Vendor[];
  customImages: Record<string, string>;
  onImageUpload: (serviceId: string, dataUrl: string) => void;
  onOpenDetails: (service: ServiceItem) => void;
  paymentMethods: PaymentMethodItem[];
  onBackToCatalog: () => void;
}

/** Catálogo público de un vendedor: #/tienda/<username> */
export const VendorCatalogPage: React.FC<VendorCatalogPageProps> = ({
  slug,
  services,
  vendors,
  customImages,
  onImageUpload,
  onOpenDetails,
  paymentMethods,
  onBackToCatalog
}) => {
  const vendor = useMemo(
    () => vendors.find((v) => v.active && v.username.toLowerCase() === slug.toLowerCase()),
    [vendors, slug]
  );

  // Productos del vendedor: principal, asignado o autorizado en su ficha
  const products = useMemo(() => {
    if (!vendor) return [];
    return services.filter(
      (s) =>
        s.active !== false &&
        (s.vendorId === vendor.id ||
          (s.assignedVendorIds && s.assignedVendorIds.includes(vendor.id)) ||
          vendor.allowedServiceIds.includes(s.id))
    );
  }, [services, vendor]);

  if (!vendor) {
    return (
      <div className="py-20 text-center space-y-4">
        <Package className="w-12 h-12 text-zinc-600 mx-auto" />
        <h1 className="text-xl font-black text-white">No encontramos ese vendedor</h1>
        <p className="text-sm text-zinc-400">El enlace puede estar mal escrito o el vendedor no está activo.</p>
        <button
          type="button"
          onClick={onBackToCatalog}
          className="px-5 py-2.5 rounded-lg text-sm font-bold text-zinc-950 bg-[#00ff88] hover:bg-[#33ffa0] cursor-pointer"
        >
          Ver catálogo general
        </button>
      </div>
    );
  }

  const waDigits = (vendor.whatsapp || '').replace(/\D/g, '');

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={onBackToCatalog}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Catálogo general
      </button>

      {/* Cabecera del vendedor */}
      <header className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <img
          src={vendor.avatar}
          alt={vendor.name}
          width={80}
          height={80}
          className="w-20 h-20 rounded-xl object-cover border border-zinc-700 shrink-0"
        />
        <div className="flex-1 min-w-0 text-left space-y-1">
          <p className="font-mono text-[10px] tracking-widest uppercase text-emerald-400">Catálogo oficial</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">{vendor.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-zinc-400">
            <span>@{vendor.username}</span>
            <span className="inline-flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400" />
              {vendor.rating.toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              {vendor.salesCount} ventas
            </span>
            <span>{products.length} servicios</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <a
            href={vendor.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordVendorClickEvent(vendor.id, vendor.name, 'telegram', 'Vendor Catalog')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-zinc-950 bg-[#00ff88] hover:bg-[#33ffa0] transition-colors"
          >
            <Send className="w-4 h-4 -rotate-12" />
            Escribir por Telegram
          </a>
          {waDigits && (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          )}
        </div>
      </header>

      {/* Productos */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((service) => (
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
        <div className="py-14 text-center rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-2">
          <Package className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-white font-bold">Este vendedor aún no tiene servicios asignados</p>
          <p className="text-xs text-zinc-500">Se asignan desde el panel de administración.</p>
        </div>
      )}

      <PaymentMethodsBanner paymentMethods={paymentMethods} />
    </div>
  );
};
