import React from 'react';
import { List, FileText, GraduationCap, ArrowRight, ShieldCheck, Zap, ShieldAlert, Flame, Headphones, Sparkles, Bot, Search, Shield, Palette, Laptop, User, Tag } from 'lucide-react';
import { ServiceItem } from '../data/servicesData';
import { Vendor } from '../data/vendorsData';
import { StreamingVisual, InvestigacionVisual, EducacionVisual, LeaksVisual } from './CardVisuals';
import { ServiceAppLogo } from './BrandLogos';

interface ServiceCardProps {
  service: ServiceItem;
  onOpenDetails: (service: ServiceItem) => void;
  customImage?: string | null;
  onImageUpload?: (serviceId: string, dataUrl: string) => void;
  vendors?: Vendor[];
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onOpenDetails,
  customImage,
  onImageUpload,
  vendors = []
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageUpload(service.id, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const activeImage = customImage || service.customImageUrl;

  // Determine authorized vendors for this specific product
  const authorizedVendors = vendors.filter(
    (v) => v.active && (v.allowedServiceIds?.includes(service.id) || v.id === service.vendorId)
  );
  const primaryVendor = authorizedVendors.find((v) => v.id === service.vendorId) || authorizedVendors[0];

  // Calculate starting price
  const displayPrice =
    service.priceFrom ||
    (service.details?.plans && service.details.plans.length > 0
      ? service.details.plans[0].price
      : 'S/ 10.00');

  // Badge text - sanitized from any emoji
  const rawBadge = service.badge || (service.popular ? 'MÁS VENDIDO' : null);
  const badgeText = rawBadge
    ? rawBadge.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()
    : null;

  const renderBadgeIcon = () => {
    if (!badgeText) return null;
    const lower = badgeText.toLowerCase();
    if (lower.includes('vendido') || lower.includes('popular')) {
      return <Flame className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />;
    }
    if (lower.includes('hifi') || lower.includes('audio') || lower.includes('spotify')) {
      return <Headphones className="w-3 h-3 text-emerald-400 shrink-0" />;
    }
    if (lower.includes('estreno') || lower.includes('disney')) {
      return <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />;
    }
    if (lower.includes('ia') || lower.includes('gpt')) {
      return <Bot className="w-3 h-3 text-violet-400 shrink-0" />;
    }
    if (lower.includes('osint') || lower.includes('intel')) {
      return <Search className="w-3 h-3 text-[#00ff88] shrink-0" />;
    }
    if (lower.includes('pentesting') || lower.includes('seguridad')) {
      return <Shield className="w-3 h-3 text-rose-400 shrink-0" />;
    }
    if (lower.includes('diseño') || lower.includes('canva')) {
      return <Palette className="w-3 h-3 text-pink-400 shrink-0" />;
    }
    if (lower.includes('oem') || lower.includes('licencia') || lower.includes('windows')) {
      return <Laptop className="w-3 h-3 text-blue-400 shrink-0" />;
    }
    return <Tag className="w-3 h-3 text-[#00ff88] shrink-0" />;
  };

  const renderVisual = () => {
    switch (service.visualType) {
      case 'leaks':
        return <LeaksVisual customImage={activeImage} />;
      case 'streaming':
        return <StreamingVisual customImage={activeImage} />;
      case 'investigacion':
        return <InvestigacionVisual customImage={activeImage} />;
      case 'educacion':
        return <EducacionVisual customImage={activeImage} />;
      default:
        return <StreamingVisual customImage={activeImage} />;
    }
  };

  const getSubItemIcon = () => {
    switch (service.category) {
      case 'leaks':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />;
      case 'streaming':
        return <List className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
      case 'investigacion':
        return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
      case 'educacion':
        return <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
      default:
        return <List className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(service)}
      className="group relative bg-[#06140c] border border-emerald-950/80 hover:border-emerald-500/50 rounded-3xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_8px_40px_rgba(0,255,136,0.18)] transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Visual Image Area */}
      <div className="w-full relative overflow-hidden group/visual">
        {renderVisual()}

        {/* Floating Top Badge with SVG Icon */}
        {badgeText && (
          <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/85 text-[#00ff88] border border-emerald-500/40 shadow-lg backdrop-blur-md flex items-center gap-1.5 select-none">
            {renderBadgeIcon()}
            <span>{badgeText}</span>
          </div>
        )}

        {/* Floating Stock Indicator */}
        <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#040e07]/90 text-emerald-300 border border-emerald-900/60 shadow backdrop-blur-sm flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          <span>En Stock</span>
        </div>

        {/* Hidden upload trigger for quick inline test */}
        {onImageUpload && (
          <div
            className="absolute bottom-2.5 right-2.5 z-20 opacity-0 group-hover/visual:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-200 bg-black/80 hover:bg-black border border-emerald-500/40 backdrop-blur-sm cursor-pointer shadow"
              title="Cambiar imagen del producto"
            >
              {customImage ? 'Cambiar foto' : 'Subir foto'}
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Header Row: Category Kicker & Delivery Speed */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-black tracking-[0.2em] text-[#00ff88] uppercase">
              {service.categoryLabel}
            </span>
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#00ff88]" />
              <span>{service.details?.deliveryTime || 'Entrega en 5 min'}</span>
            </span>
          </div>

          {/* Product Title with Real Official App Logo */}
          <div className="flex items-center gap-2.5">
            <ServiceAppLogo
              serviceId={service.id}
              serviceTitle={service.title}
              size={24}
              className="shrink-0 shadow-sm"
            />
            <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-emerald-300 transition-colors tracking-tight line-clamp-1">
              {service.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
            {service.description}
          </p>

          {/* Price Kicker */}
          <div className="mt-3.5 pt-3 border-t border-emerald-950/70 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block leading-none">
                Precio desde
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl sm:text-2xl font-black text-[#00ff88] tracking-tight">
                  {displayPrice}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">/ mes</span>
              </div>
            </div>

            {/* Vendor Chip */}
            {primaryVendor && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#030d07] border border-emerald-900/70 text-right max-w-[50%]"
                title={`Vendedor: ${primaryVendor.name}`}
              >
                {primaryVendor.avatar && (primaryVendor.avatar.startsWith('/') || primaryVendor.avatar.startsWith('http') || primaryVendor.avatar.includes('.')) ? (
                  <img
                    src={primaryVendor.avatar}
                    alt={primaryVendor.name}
                    className="w-5 h-5 rounded-full object-cover shrink-0 border border-emerald-500/50 shadow-sm"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-950 flex items-center justify-center border border-emerald-500/50 shrink-0">
                    <User className="w-3 h-3 text-[#00ff88]" />
                  </div>
                )}
                <div className="truncate text-left leading-tight">
                  <span className="text-[10px] font-bold text-white block truncate">
                    {primaryVendor.name}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono block">
                    @{primaryVendor.username}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer: Sub-item label on left, Action Button on right */}
        <div className="pt-3 border-t border-emerald-950/70 flex items-center justify-between gap-2">
          {/* Subitem text with icon */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 max-w-[55%] truncate">
            {getSubItemIcon()}
            <span className="truncate text-[11px]">{service.subItemLabel}</span>
          </div>

          {/* CTA Green Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(service);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:shadow-[0_0_22px_rgba(0,255,136,0.5)] active:scale-95 transition-all whitespace-nowrap cursor-pointer shrink-0"
          >
            <span>{service.buttonLabel ? service.buttonLabel.replace(' →', '') : 'Ver Planes'}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
