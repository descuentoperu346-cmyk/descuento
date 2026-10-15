import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServiceCard } from './components/ServiceCard';
import { TelegramBanner } from './components/TelegramBanner';
import { Footer } from './components/Footer';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { AdminPortal } from './pages/AdminPortal';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LeaksTab } from './components/LeaksTab';
import { LeaksBanner } from './components/LeaksBanner';
import { PaymentMethodsBanner } from './components/PaymentMethodsBanner';
import { FloatingVendorsDock } from './components/FloatingVendorsDock';
import {
  ServiceItem,
  TELEGRAM_URL,
  getStoredServices,
  saveStoredServices
} from './data/servicesData';
import {
  Vendor,
  getStoredVendors,
  saveStoredVendors
} from './data/vendorsData';
import {
  PaymentMethodItem,
  getStoredPaymentMethods,
  saveStoredPaymentMethods
} from './data/paymentsData';
import {
  recordVisitEvent,
  recordProductViewEvent
} from './data/telemetryData';
import {
  LeakArticle,
  getStoredLeakArticles,
  saveStoredLeakArticles
} from './data/leaksData';
import {
  fetchProductsApi,
  fetchVendorsApi
} from './lib/api';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Radio,
  Users,
  CheckCircle2,
  Lock,
  Layers,
  Send
} from 'lucide-react';

export default function App() {
  // Navigation tabs: 'inicio' | 'servicios' | 'leaks' | 'nosotros' | 'contacto'
  const [activeNavTab, setActiveNavTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('leaks') || hash.includes('filtrac')) return 'leaks';
      if (hash.includes('servicios') || hash.includes('catalogo')) return 'inicio';
      if (hash.includes('nosotros') || hash.includes('about')) return 'nosotros';
      if (hash.includes('contacto') || hash.includes('contact')) return 'contacto';
    }
    return 'inicio';
  });

  // Category filter state (used across views)
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Leaks & Breaches articles state
  const [leakArticles, setLeakArticles] = useState<LeakArticle[]>(getStoredLeakArticles);

  const handleUpdateLeakArticles = (updatedArticles: LeakArticle[]) => {
    setLeakArticles(updatedArticles);
    saveStoredLeakArticles(updatedArticles);
  };

  // Record visitor telemetry once per session
  useEffect(() => {
    try {
      if (!sessionStorage.getItem('dp_visited_session')) {
        sessionStorage.setItem('dp_visited_session', 'true');
        recordVisitEvent();
      }
    } catch {
      // ignore
    }
  }, []);

  // Hydrate catalog and vendors from backend API
  useEffect(() => {
    fetchProductsApi().then((serverServices) => {
      if (serverServices && serverServices.length > 0) {
        setServices(serverServices);
        saveStoredServices(serverServices);
      }
    });

    fetchVendorsApi().then((serverVendors) => {
      if (serverVendors && serverVendors.length > 0) {
        setVendors(serverVendors);
        saveStoredVendors(serverVendors);
      }
    });
  }, []);

  // Vendors state (persisted in localStorage)
  const [vendors, setVendors] = useState<Vendor[]>(getStoredVendors);

  // Services catalog state (persisted in localStorage)
  const [services, setServices] = useState<ServiceItem[]>(getStoredServices);

  // Payment methods state (persisted in localStorage)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>(getStoredPaymentMethods);

  const handleUpdateVendors = (updatedVendors: Vendor[]) => {
    setVendors(updatedVendors);
    saveStoredVendors(updatedVendors);
  };

  const handleUpdateServices = (updatedServices: ServiceItem[]) => {
    setServices(updatedServices);
    saveStoredServices(updatedServices);
  };

  const handleUpdatePaymentMethods = (updatedMethods: PaymentMethodItem[]) => {
    setPaymentMethods(updatedMethods);
    saveStoredPaymentMethods(updatedMethods);
  };

  // Custom images state (persisted in localStorage)
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('dp_custom_images');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleImageUpload = (serviceId: string, dataUrl: string) => {
    setCustomImages((prev) => {
      const updated = { ...prev, [serviceId]: dataUrl };
      try {
        localStorage.setItem('dp_custom_images', JSON.stringify(updated));
      } catch {
        // quota limit handling
      }
      return updated;
    });
  };

  // Product detail modal state (only for plan selection and purchase coordination)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Dedicated view routing: 'store' (Tienda Pública) or 'portal' (Web Completa de Vendedores & Admin)
  const [currentView, setCurrentView] = useState<'store' | 'portal'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('portal') || hash.includes('admin') || hash.includes('vendedor')) {
        return 'portal';
      }
    }
    return 'store';
  });

  // Sync state with browser hash navigation (#/portal, #/servicios, #/leaks, #/nosotros, #/contacto)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('portal') || hash.includes('admin') || hash.includes('vendedor')) {
        setCurrentView('portal');
      } else {
        setCurrentView('store');
        if (hash.includes('leaks') || hash.includes('filtrac')) {
          setActiveNavTab('leaks');
        } else if (hash.includes('servicios') || hash.includes('catalogo')) {
          setActiveNavTab('inicio');
        } else if (hash.includes('nosotros') || hash.includes('about')) {
          setActiveNavTab('nosotros');
        } else if (hash.includes('contacto') || hash.includes('contact')) {
          setActiveNavTab('contacto');
        } else {
          setActiveNavTab('inicio');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveNavTab(tabId);
    if (tabId === 'inicio') {
      window.location.hash = '';
    } else {
      window.location.hash = `#/${tabId}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPortal = () => {
    window.location.hash = '#/portal';
    setCurrentView('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStore = () => {
    window.location.hash = '';
    setCurrentView('store');
    setActiveNavTab('inicio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trending / featured services for Home Page Preview
  const featuredServices = useMemo(() => {
    const active = services.filter((s) => s.active !== false);
    // Prioritize popular items like Netflix, ChatGPT, Disney, Canva, or take the first 3
    const preferredIds = ['netflix-peru', 'chatgpt-plus', 'disney-plus', 'canva-pro'];
    const matched = active.filter((s) => preferredIds.includes(s.id));
    if (matched.length >= 3) return matched.slice(0, 3);
    return active.slice(0, 3);
  }, [services]);

  // If user is in portal mode, render the complete standalone web app (no overlays, no modal over store)
  if (currentView === 'portal') {
    return (
      <AdminPortal
        onBackToStore={navigateToStore}
        vendors={vendors}
        onUpdateVendors={handleUpdateVendors}
        services={services}
        onUpdateServices={handleUpdateServices}
        paymentMethods={paymentMethods}
        onUpdatePaymentMethods={handleUpdatePaymentMethods}
        leakArticles={leakArticles}
        onUpdateLeakArticles={handleUpdateLeakArticles}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050b08] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar with Real Multi-Page Navigation */}
      <Navbar
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onOpenAdmin={navigateToPortal}
      />

      {/* Main Content Layout - Separate Views for Maximum Contrast and Flow */}
      <main className="flex-1">
        {/* ======================= PAGE: SERVICIOS ======================= */}
        {activeNavTab === 'servicios' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-16">
            <ServicesPage
              services={services}
              vendors={vendors}
              customImages={customImages}
              onImageUpload={handleImageUpload}
              onOpenDetails={(s) => {
                recordProductViewEvent(s.id, s.title);
                setSelectedService(s);
              }}
              paymentMethods={paymentMethods}
              onNavigateToContact={() => handleTabChange('contacto')}
            />
          </div>
        )}

        {/* ======================= PAGE: LEAKS & FILTRACIONES ======================= */}
        {activeNavTab === 'leaks' && (
          <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
            <LeaksTab
              articles={leakArticles}
              onOpenContact={() => handleTabChange('contacto')}
            />
          </div>
        )}

        {/* ======================= PAGE: QUIÉNES SOMOS ======================= */}
        {activeNavTab === 'nosotros' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16">
            <AboutPage
              onNavigateToServices={() => handleTabChange('servicios')}
              onNavigateToContact={() => handleTabChange('contacto')}
              onNavigateToLeaks={() => handleTabChange('leaks')}
              vendors={vendors}
            />
          </div>
        )}

        {/* ======================= PAGE: CONTACTO & SOPORTE ======================= */}
        {activeNavTab === 'contacto' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16">
            <ContactPage vendors={vendors} />
          </div>
        )}

        {/* ======================= PAGE: INICIO (HOME DASHBOARD) ======================= */}
        {activeNavTab === 'inicio' && (
          <>
            {/* Hero Section */}
            <Hero
              onExploreClick={() => handleTabChange('servicios')}
              onTelegramConsult={() => handleTabChange('contacto')}
              onSelectCategory={(category) => {
                setSelectedCategory(category);
                handleTabChange('servicios');
              }}
              onNavigateToLeaks={() => handleTabChange('leaks')}
            />

            {/* Quick Section Jump Cards */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-6 sm:pt-2 sm:pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Servicios */}
                <div
                  onClick={() => handleTabChange('servicios')}
                  className="group p-5 rounded-2xl bg-gradient-to-b from-[#081a10] to-[#040e08] border border-emerald-900/60 hover:border-emerald-400/80 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(0,255,136,0.2)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-xl bg-emerald-950/80 text-[#00ff88] border border-emerald-500/30">
                      <Layers className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      {services.filter((s) => s.active !== false).length} ACTIVOS
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#00ff88] transition-colors">
                    Catálogo de Servicios
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Streaming 4K, cuentas premium, licencias de software y bases OSINT verificadas.
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#00ff88]">
                    <span>Explorar catálogo</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Card 2: Leaks & Filtraciones */}
                <div
                  onClick={() => handleTabChange('leaks')}
                  className="group p-5 rounded-2xl bg-gradient-to-b from-[#1c0808] to-[#0a0303] border border-rose-900/60 hover:border-rose-500/80 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(244,63,94,0.2)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-500/30">
                      <ShieldAlert className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      INTEL
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">
                    Leaks & Filtraciones
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Auditorías sobre brechas de datos, bases filtradas y reportes de seguridad en Perú.
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-rose-400">
                    <span>Ver filtraciones</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Card 3: Quiénes Somos */}
                <div
                  onClick={() => handleTabChange('nosotros')}
                  className="group p-5 rounded-2xl bg-gradient-to-b from-[#081a10] to-[#040e08] border border-emerald-900/60 hover:border-emerald-400/80 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(0,255,136,0.2)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-xl bg-emerald-950/80 text-[#00ff88] border border-emerald-500/30">
                      <Users className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      GARANTÍA 100%
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#00ff88] transition-colors">
                    Quiénes Somos
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Conoce nuestra trayectoria, garantías de reposición y protocolos de seguridad.
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#00ff88]">
                    <span>Conocer equipo</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Card 4: Contacto & Asesores */}
                <div
                  onClick={() => handleTabChange('contacto')}
                  className="group p-5 rounded-2xl bg-gradient-to-b from-[#081a10] to-[#040e08] border border-emerald-900/60 hover:border-emerald-400/80 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(0,255,136,0.2)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-xl bg-emerald-950/80 text-[#00ff88] border border-emerald-500/30">
                      <Send className="w-5 h-5 -rotate-12" />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#00ff88] bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
                      EN LÍNEA
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#00ff88] transition-colors">
                    Contacto & Soporte
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Atención personalizada por Telegram con respuesta garantizada en menos de 5 min.
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#00ff88]">
                    <span>Escribir por Telegram</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Services Showcase */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[11px] font-bold text-[#00ff88] mb-2">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>MÁS SOLICITADOS ESTA SEMANA</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Servicios Destacados
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Cuentas de alta demanda con entrega automatizada y garantía total en Lima y provincias.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleTabChange('servicios')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_15px_rgba(0,255,136,0.35)] transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  <span>Ver Catálogo Completo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    customImage={customImages[service.id]}
                    onImageUpload={handleImageUpload}
                    onOpenDetails={(s) => {
                      recordProductViewEvent(s.id, s.title);
                      setSelectedService(s);
                    }}
                    vendors={vendors}
                  />
                ))}
              </div>

              {/* Interactive Kusi AI Catalog Callout Banner */}
              <div
                onClick={() => handleTabChange('servicios')}
                className="mt-10 relative rounded-3xl overflow-hidden border-2 border-emerald-500/35 shadow-[0_0_35px_rgba(0,255,136,0.12)] p-6 sm:p-7 bg-gradient-to-r from-[#03130a]/95 via-[#062414]/95 to-[#020e06]/95 cursor-pointer group transition-all duration-300 hover:scale-[1.01] hover:border-[#00ff88]"
              >
                {/* Cyber Corner Brackets */}
                <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-[#00ff88]/60 pointer-events-none" />
                <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-[#00ff88]/60 pointer-events-none" />
                <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-[#00ff88]/60 pointer-events-none" />
                <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-[#00ff88]/60 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-emerald-950/80 border border-emerald-400/60 shadow-[0_0_15px_rgba(0,255,136,0.3)] shrink-0 flex items-center justify-center">
                      <img
                        src="/imagenes/llama-about.png"
                        alt="Kusi AI"
                        className="w-full h-full object-contain filter drop-shadow animate-float-card"
                      />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-mono text-[#00ff88] uppercase tracking-wider mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
                        <span>Kusi AI · Monitoreo en Tiempo Real</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-white group-hover:text-[#00ff88] transition-colors">
                        ¿Buscas Spotify, ChatGPT Plus, licencias originales o bases OSINT?
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Explora más de {services.length} cuentas y servicios verificados con reposición 100% garantizada.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl text-xs font-black text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_20px_rgba(0,255,136,0.5)] cursor-pointer whitespace-nowrap shrink-0 transition-transform group-hover:scale-105"
                  >
                    Abrir Catálogo de Servicios →
                  </button>
                </div>
              </div>
            </section>

            {/* Leaks & Threat Intel Spotlight Banner */}
            <LeaksBanner onExploreLeaks={() => handleTabChange('leaks')} />

            {/* Payment Methods Showcase Banner with Real Official App Logos */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <PaymentMethodsBanner paymentMethods={paymentMethods} />

              {/* Telegram Connect Banner */}
              <div className="mt-8">
                <TelegramBanner
                  onDirectClick={() => {
                    handleTabChange('contacto');
                  }}
                />
              </div>
            </div>

          </>
        )}
      </main>

      {/* Footer with Global Multi-Page Navigation */}
      <Footer
        onOpenAdmin={navigateToPortal}
        onNavigateTab={handleTabChange}
        activeTab={activeNavTab}
      />

      {/* Interactive Detail Modal with Vendor and Payment Selection */}
      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        vendors={vendors}
        paymentMethods={paymentMethods}
      />

      {/* Global Floating Creators Dock */}
      <FloatingVendorsDock />
    </div>
  );
}
