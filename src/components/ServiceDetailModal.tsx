import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  Clock,
  ShieldAlert,
  Sparkles,
  Users,
  MessageCircle,
  QrCode,
  CreditCard,
  Check
} from 'lucide-react';
import { ServiceItem, TELEGRAM_USERNAME, TELEGRAM_URL } from '../data/servicesData';
import { Vendor } from '../data/vendorsData';
import { PaymentMethodItem } from '../data/paymentsData';
import { recordVendorClickEvent } from '../data/telemetryData';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  vendors?: Vendor[];
  paymentMethods?: PaymentMethodItem[];
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  vendors = [],
  paymentMethods = []
}) => {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');

  if (!service) return null;

  const authorizedVendors = vendors.filter(
    (v) =>
      v.active &&
      (v.allowedServiceIds?.includes(service.id) || v.id === service.vendorId)
  );

  const effectiveVendorId = selectedVendorId || service.vendorId || authorizedVendors[0]?.id || '';

  const chosenVendor =
    authorizedVendors.find((v) => v.id === effectiveVendorId) ||
    authorizedVendors[0] ||
    vendors[0];

  const currentPlan = service.details?.plans?.[selectedPlanIndex];

  const handleOrderTelegram = () => {
    // Record telemetry click for vendor
    recordVendorClickEvent(
      chosenVendor?.id || 'vendedor-central',
      chosenVendor?.name || 'Descuentos Perú Central',
      'telegram',
      service.title
    );

    const targetUrl = chosenVendor?.telegramUrl || TELEGRAM_URL;
    const vendorTag = chosenVendor
      ? `${chosenVendor.name} (@${chosenVendor.username})`
      : `@${TELEGRAM_USERNAME}`;

    const planText = currentPlan
      ? `¡Hola ${vendorTag}! Deseo solicitar/adquirir el producto: *${service.title}* - Plan: *${currentPlan.name}* (${currentPlan.price}) en Descuentos Perú. ¿Tienen disponibilidad inmediata para pago?`
      : `¡Hola ${vendorTag}! Deseo consultar sobre el producto: *${service.title}* en Descuentos Perú.`;

    const url = `${targetUrl}?text=${encodeURIComponent(planText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOrderWhatsApp = () => {
    if (!chosenVendor?.whatsapp) return;

    // Record telemetry click for vendor
    recordVendorClickEvent(
      chosenVendor?.id || 'vendedor-central',
      chosenVendor?.name || 'Descuentos Perú Central',
      'whatsapp',
      service.title
    );

    const cleanPhone = chosenVendor.whatsapp.replace(/\D/g, '');
    const planText = currentPlan
      ? `¡Hola ${chosenVendor.name}! Deseo adquirir *${service.title}* - Plan *${currentPlan.name}* (${currentPlan.price}) desde Descuentos Perú. ¿Podrías brindarme los datos de pago?`
      : `¡Hola ${chosenVendor.name}! Deseo consultar sobre *${service.title}* desde Descuentos Perú.`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(planText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getServiceBanner = () => {
    if (service.customImageUrl) return service.customImageUrl;
    if (service.category === 'leaks') return '/imagenes/card-leaks.jpg';
    if (service.category === 'investigacion') return '/imagenes/card-investigacion.png';
    if (service.category === 'educacion') return '/imagenes/card-educacion.png';
    return '/imagenes/card-streaming.png';
  };

  const banner = getServiceBanner();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#06140c] border border-emerald-500/40 rounded-3xl shadow-[0_0_60px_rgba(0,255,136,0.25)] overflow-hidden text-slate-100 my-6">
        
        {/* Modal Banner Image */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
          <img
            src={banner}
            alt={service.title}
            className="w-full h-full object-cover object-center filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06140c] via-[#06140c]/40 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-3.5 left-4 flex items-center gap-2">
            {service.badge && (
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/85 text-[#00ff88] border border-emerald-500/40 shadow backdrop-blur-md">
                {service.badge}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#040e07]/90 text-emerald-300 border border-emerald-900/60 shadow backdrop-blur-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
              <span>En Stock</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-20 p-2.5 rounded-xl text-white bg-black/70 hover:bg-black border border-emerald-500/30 transition-all cursor-pointer shadow-lg"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Header */}
        <div className="px-5 sm:px-7 pt-2 pb-4 border-b border-emerald-950/80 bg-[#06140c]">
          <span className="text-[11px] font-black tracking-[0.2em] text-[#00ff88] uppercase block">
            {service.categoryLabel}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
            {service.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            {service.details?.overview || service.description}
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Key Features */}
          {service.details?.features && service.details.features.length > 0 && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Garantías y Características Incluidas</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {service.details.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-200 bg-[#040e07] p-3 rounded-xl border border-emerald-950/80 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-[#00ff88] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Plans Selector */}
          {service.details?.plans && service.details.plans.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Selecciona tu Plan o Modalidad:
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">Precios en Soles (S/)</span>
              </div>

              <div className="space-y-2.5">
                {service.details.plans.map((plan, idx) => {
                  const isSelected = selectedPlanIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedPlanIndex(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#092b1b] border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.25)]'
                          : 'bg-[#040e07] border-emerald-950 hover:border-emerald-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-[#00ff88] bg-[#00ff88]'
                                : 'border-slate-600 bg-black/40'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                          <span className="text-sm font-black text-white">{plan.name}</span>
                          {plan.popular && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00ff88] border border-emerald-500/30">
                              RECOMENDADO
                            </span>
                          )}
                        </div>
                        {plan.perks && plan.perks.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5 ml-6">
                            {plan.perks.map((p, pIdx) => (
                              <span
                                key={pIdx}
                                className="text-[10px] text-emerald-300 bg-emerald-950/70 px-2.5 py-0.5 rounded-md border border-emerald-900/50 font-medium"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="sm:text-right shrink-0 ml-6 sm:ml-0">
                        <span className="text-lg font-black text-[#00ff88]">{plan.price}</span>
                        <span className="text-[11px] text-slate-400 block font-medium">/ {plan.period}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Authorized Vendor Selector & Contact Info */}
          {authorizedVendors.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#00ff88]" />
                <span>Vendedor Asignado para este Producto:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {authorizedVendors.map((vendor) => {
                  const isSelected = chosenVendor?.id === vendor.id;
                  return (
                    <div
                      key={vendor.id}
                      onClick={() => setSelectedVendorId(vendor.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#092b1b] border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)]'
                          : 'bg-[#040e07] border-emerald-950 hover:border-emerald-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {vendor.avatar && (vendor.avatar.startsWith('/') || vendor.avatar.startsWith('http') || vendor.avatar.includes('.')) ? (
                            <img
                              src={vendor.avatar}
                              alt={vendor.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-emerald-500/50 shadow-sm"
                            />
                          ) : (
                            <span className="text-base">{vendor.avatar || '👤'}</span>
                          )}
                          <span className="text-xs font-bold text-white">{vendor.name}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] text-[#00ff88] font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Activo</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="text-emerald-400">@{vendor.username}</span>
                        {vendor.rating && <span>⭐ {vendor.rating} ({vendor.salesCount || 100}+)</span>}
                      </div>

                      {/* Vendor's accepted payments */}
                      {vendor.paymentMethods && vendor.paymentMethods.length > 0 && (
                        <div className="text-[10px] text-slate-400 truncate pt-1.5 border-t border-emerald-950">
                          Acepta: <strong className="text-slate-300">{vendor.paymentMethods.join(', ')}</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Vendor payment details snippet */}
              {chosenVendor?.paymentConfig && (
                <div className="p-3.5 rounded-2xl bg-[#030d07] border border-emerald-900/60 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Datos de pago de {chosenVendor.name}
                    </span>
                    {chosenVendor.paymentConfig.qrImageUrl && (
                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="text-[10px] font-bold text-[#00ff88] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3 h-3" /> Ver Código QR
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {chosenVendor.paymentConfig.yapePhone && (
                      <div className="bg-[#05140c] p-2 rounded-lg border border-emerald-950">
                        <span className="text-slate-400 block text-[9px] uppercase">Yape / Plin</span>
                        <strong className="text-white font-mono">{chosenVendor.paymentConfig.yapePhone}</strong>
                      </div>
                    )}
                    {chosenVendor.paymentConfig.bcpAccount && (
                      <div className="bg-[#05140c] p-2 rounded-lg border border-emerald-950">
                        <span className="text-slate-400 block text-[9px] uppercase">Cuenta BCP</span>
                        <strong className="text-white font-mono">{chosenVendor.paymentConfig.bcpAccount}</strong>
                      </div>
                    )}
                    {chosenVendor.paymentConfig.binancePayId && (
                      <div className="bg-[#05140c] p-2 rounded-lg border border-emerald-950 sm:col-span-2">
                        <span className="text-slate-400 block text-[9px] uppercase">Binance Pay ID</span>
                        <strong className="text-white font-mono">{chosenVendor.paymentConfig.binancePayId}</strong>
                      </div>
                    )}
                  </div>

                  {chosenVendor.paymentConfig.paymentInstructions && (
                    <p className="text-[10px] text-slate-400 italic">
                      "{chosenVendor.paymentConfig.paymentInstructions}"
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Delivery & Support notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#040e07] p-3.5 rounded-2xl border border-emerald-950/80">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Entrega:</strong> {service.details?.deliveryTime || 'Inmediata'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Garantía:</strong> {service.details?.supportNote || 'Soporte 24/7'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-6 border-t border-emerald-950/80 bg-[#040f07] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span>Atención directa con: </span>
            <strong className="text-emerald-400">
              {chosenVendor?.name} (@{chosenVendor?.username || TELEGRAM_USERNAME})
            </strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {(chosenVendor?.whatsapp && (chosenVendor.username === 'Tin9o' || chosenVendor.id === 'vendedor-tino')) && (
              <button
                type="button"
                onClick={handleOrderWhatsApp}
                className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#0e3b20] hover:bg-[#13522d] border border-emerald-500/40 transition-all cursor-pointer whitespace-nowrap"
                title="Escribir por WhatsApp a Tin9o (+51 919 192 244)"
              >
                <MessageCircle className="w-4 h-4 text-[#00ff88]" />
                <span>WhatsApp (+51 919 192 244)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOrderTelegram}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_25px_rgba(0,255,136,0.4)] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <img
                src="/imagenes/telegram-icon.png"
                alt=""
                className="w-4 h-4 rounded-full object-contain shrink-0"
              />
              <span>Comprar por Telegram</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Lightbox Modal */}
      {showQrModal && chosenVendor?.paymentConfig?.qrImageUrl && (
        <div
          onClick={() => setShowQrModal(false)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="p-6 rounded-3xl bg-[#06140c] border border-emerald-500/50 max-w-sm text-center shadow-2xl space-y-4"
          >
            <h4 className="text-sm font-bold text-white">
              Código QR de Pago ({chosenVendor.name})
            </h4>
            <div className="w-64 h-64 mx-auto rounded-2xl bg-white p-2 overflow-hidden shadow">
              <img
                src={chosenVendor.paymentConfig.qrImageUrl}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-slate-400">
              Escanea con tu app de Yape o Plin para transferir directamente.
            </p>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#00ff88] cursor-pointer"
            >
              Cerrar QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
