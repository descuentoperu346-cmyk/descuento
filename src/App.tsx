import React, { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServiceCard } from './components/ServiceCard';
import { TelegramBanner } from './components/TelegramBanner';
import { Footer } from './components/Footer';
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
import { useLeakArticles } from './hooks/useLeakArticles';
import { CONTENT_DB_ENABLED } from './lib/contentEnv';
import { enqueueSave, friendlyError, setRemoteStatus } from './lib/remoteStatus';
import { isPanelHash, PANEL_HASH } from './lib/panelRoute';
import { AdminReturnButton } from './components/AdminReturnButton';
import { useAuthRequest } from './lib/accountStore';
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

// Carga bajo demanda: el visitante de la portada no descarga el panel admin, leaks, etc.
const ServiceDetailModal = lazy(() => import('./components/ServiceDetailModal').then((m) => ({ default: m.ServiceDetailModal })));
const AdminPortal = lazy(() => import('./pages/AdminPortal').then((m) => ({ default: m.AdminPortal })));
const AuthModal = lazy(() => import('./components/AuthModal'));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const FigureProfilePage = lazy(() => import('./pages/FigureProfilePage').then((m) => ({ default: m.FigureProfilePage })));
const VendorCatalogPage = lazy(() => import('./pages/VendorCatalogPage').then((m) => ({ default: m.VendorCatalogPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const ComplaintsPage = lazy(() => import('./pages/ComplaintsPage').then((m) => ({ default: m.ComplaintsPage })));
const LeaksTab = lazy(() => import('./components/LeaksTab').then((m) => ({ default: m.LeaksTab })));

// Direcciones cortas para Google y los buscadores: https://<web>/privacidad, /terminos y /reclamaciones abren cada página (#/privacidad, #/terminos, #/reclamaciones).
if (typeof window !== 'undefined') {
  const short = window.location.pathname.match(/^\/(privacidad|terminos|reclamaciones)\/?$/i);
  if (short) window.history.replaceState(null, '', `/#/${short[1].toLowerCase()}`);
}

// Catálogo por vendedor: #/tienda/<username>. Se evalúa antes que el resto de rutas.
const readVendorSlug = (): string | null => {
  if (typeof window === 'undefined') return null;
  const m = window.location.hash.match(/^#\/tienda\/([^/?#]+)/i);
  return m ? decodeURIComponent(m[1]) : null;
};

// Ficha de una figura del expediente: #/leaks/figura/<id> (página propia, sin modal).
const readFigureId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const m = window.location.hash.match(/^#\/leaks\/figura\/([^/?#]+)/i);
  return m ? decodeURIComponent(m[1]) : null;
};

// Alto de pantalla completa: mientras carga, el pie de página queda fuera de la vista y no "salta" al llegar el contenido.
const PageFallback = () => <div className="min-h-screen" aria-busy="true" />;

/** Formulario de cuenta (ingresar, crear cuenta, "Mi cuenta"): se descarga solo cuando alguien lo abre. */
function AuthHost() {
  const request = useAuthRequest();
  if (!request) return null;
  return (
    <Suspense fallback={null}>
      <AuthModal request={request} />
    </Suspense>
  );
}
export default function App() {
  // Navigation tabs: 'inicio' | 'servicios' | 'leaks' | 'nosotros' | 'contacto'
  const [vendorSlug, setVendorSlug] = useState<string | null>(readVendorSlug);
  const [figureId, setFigureId] = useState<string | null>(readFigureId);
  const [activeNavTab, setActiveNavTab] = useState<string>(() => {
    if (readVendorSlug()) return 'tienda';
    if (readFigureId()) return 'figura';
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('leaks') || hash.includes('filtrac')) return 'leaks';
      if (hash.includes('servicios') || hash.includes('catalogo')) return 'servicios';
      if (hash.includes('nosotros') || hash.includes('about')) return 'nosotros';
      if (hash.includes('contacto') || hash.includes('contact')) return 'contacto';
      if (hash.includes('privacidad')) return 'privacidad';
      if (hash.includes('terminos')) return 'terminos';
      if (hash.includes('reclamaciones')) return 'reclamaciones';
    }
    return 'inicio';
  });

  // Category filter state (used across views)
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

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

  // Con base de datos de contenido: el catálogo, los vendedores y los pagos se leen de Supabase.
  // "ready" = la base ya tiene datos; solo entonces se permite guardar cambios desde el panel
  // (evita que un guardado parcial deje la base con la mitad del catálogo).
  const remoteReady = useRef({ products: false, vendors: false, payments: false });

  // Hydrate catalog and vendors from backend API
  useEffect(() => {
    if (CONTENT_DB_ENABLED) {
      import('./lib/leaksDb').then(async (m) => {
        const [p, v, pm] = await Promise.all([m.fetchProductsFromDb(), m.fetchVendorsFromDb(), m.fetchPaymentMethodsFromDb()]);
        if (p) {
          remoteReady.current.products = true;
          servicesRef.current = p;
          setServices(p);
          saveStoredServices(p);
        }
        if (v) {
          remoteReady.current.vendors = true;
          vendorsRef.current = v;
          setVendors(v);
          saveStoredVendors(v);
        }
        if (pm) {
          remoteReady.current.payments = true;
          paymentsRef.current = pm;
          setPaymentMethods(pm);
          saveStoredPaymentMethods(pm);
        }
      });
      return;
    }
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

  // Últimos valores confirmados (para calcular qué cambió al guardar)
  const vendorsRef = useRef<Vendor[]>(vendors);
  const servicesRef = useRef<ServiceItem[]>(services);
  const paymentsRef = useRef<PaymentMethodItem[]>(paymentMethods);

  // Guarda en la base solo lo que cambió. Si falla, la pantalla ya muestra el cambio pero el panel avisa del error.
  const saveRemote = <T,>(
    kind: 'products' | 'vendors' | 'payments',
    label: string,
    task: () => Promise<T>,
    onDone: (result: T) => void
  ) => {
    if (!remoteReady.current[kind]) {
      setRemoteStatus({
        state: 'error',
        message: `La base de datos aún no tiene ${label}. Ejecuta los pasos 3 y 4 de supabase/LEEME.md antes de editar desde el panel.`
      });
      return;
    }
    setRemoteStatus({ state: 'saving', message: `Guardando ${label}…` });
    enqueueSave(task)
      .then((result) => {
        onDone(result);
        setRemoteStatus({ state: 'saved', message: `Cambios guardados en la base de datos (${label}).` });
      })
      .catch((e) => setRemoteStatus({ state: 'error', message: friendlyError(e) }));
  };

  const handleUpdateVendors = (updatedVendors: Vendor[]) => {
    const prev = vendorsRef.current;
    vendorsRef.current = updatedVendors;
    setVendors(updatedVendors);
    saveStoredVendors(updatedVendors);
    if (!CONTENT_DB_ENABLED) return;
    saveRemote(
      'vendors',
      'vendedores',
      async () => (await import('./lib/supabaseBrowser')).syncVendors(prev, updatedVendors),
      (normalized) => {
        vendorsRef.current = normalized;
        setVendors(normalized);
        saveStoredVendors(normalized);
      }
    );
  };

  const handleUpdateServices = (updatedServices: ServiceItem[]) => {
    const prev = servicesRef.current;
    servicesRef.current = updatedServices;
    setServices(updatedServices);
    saveStoredServices(updatedServices);
    if (!CONTENT_DB_ENABLED) return;
    saveRemote(
      'products',
      'productos',
      async () => (await import('./lib/supabaseBrowser')).syncProducts(prev, updatedServices, 'admin'),
      (normalized) => {
        servicesRef.current = normalized;
        setServices(normalized);
        saveStoredServices(normalized);
      }
    );
  };

  const handleUpdatePaymentMethods = (updatedMethods: PaymentMethodItem[]) => {
    const prev = paymentsRef.current;
    paymentsRef.current = updatedMethods;
    setPaymentMethods(updatedMethods);
    saveStoredPaymentMethods(updatedMethods);
    if (!CONTENT_DB_ENABLED) return;
    saveRemote(
      'payments',
      'métodos de pago',
      async () => (await import('./lib/supabaseBrowser')).syncPaymentMethods(prev, updatedMethods),
      (normalized) => {
        paymentsRef.current = normalized;
        setPaymentMethods(normalized);
        saveStoredPaymentMethods(normalized);
      }
    );
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
  const [modalMounted, setModalMounted] = useState(false);
  useEffect(() => { if (selectedService) setModalMounted(true); }, [selectedService]);

  // Dedicated view routing: 'store' (Tienda Pública) or 'portal' (Web Completa de Vendedores & Admin)
  const [currentView, setCurrentView] = useState<'store' | 'portal'>(() => {
    if (readVendorSlug() || readFigureId()) return 'store';
    if (typeof window !== 'undefined' && isPanelHash(window.location.hash)) return 'portal';
    return 'store';
  });

  // Artículos de Leaks: se descargan solo al abrir Leaks o el panel (no pesan en el inicio)
  const {
    articles: leakArticles,
    update: handleUpdateLeakArticles,
    replace: replaceLeakArticles
  } = useLeakArticles(
    activeNavTab === 'leaks' || currentView === 'portal'
  );
  useEffect(() => {
    if (activeNavTab === 'leaks') void import('./components/LeaksTab');
  }, [activeNavTab]);

  // Al iniciar sesión en el panel se recarga el contenido con la cuenta del staff:
  // así se ven también los productos ocultos y (admin) los leaks en borrador.
  const handleStaffSession = async () => {
    if (!CONTENT_DB_ENABLED) return;
    try {
      const m = await import('./lib/supabaseBrowser');
      const c = await m.readStaffContent();
      if (c.products) {
        remoteReady.current.products = true;
        servicesRef.current = c.products;
        setServices(c.products);
        saveStoredServices(c.products);
      }
      if (c.vendors) {
        remoteReady.current.vendors = true;
        vendorsRef.current = c.vendors;
        setVendors(c.vendors);
        saveStoredVendors(c.vendors);
      }
      if (c.payments) {
        remoteReady.current.payments = true;
        paymentsRef.current = c.payments;
        setPaymentMethods(c.payments);
        saveStoredPaymentMethods(c.payments);
      }
      if (c.leaks) replaceLeakArticles(c.leaks);
    } catch (e) {
      console.warn('No se pudo cargar el contenido del panel', e);
    }
  };

  // Sync state with browser hash navigation (#/portal, #/servicios, #/leaks, #/nosotros, #/contacto)
  useEffect(() => {
    const handleHashChange = () => {
      const fig = readFigureId();
      setFigureId(fig);
      if (fig) {
        setVendorSlug(null);
        setCurrentView('store');
        setActiveNavTab('figura');
        window.scrollTo({ top: 0 });
        return;
      }
      const slug = readVendorSlug();
      setVendorSlug(slug);
      if (slug) {
        setCurrentView('store');
        setActiveNavTab('tienda');
        return;
      }
      const hash = window.location.hash.toLowerCase();
      if (isPanelHash(window.location.hash)) {
        setCurrentView('portal');
      } else {
        setCurrentView('store');
        if (hash.includes('leaks') || hash.includes('filtrac')) {
          setActiveNavTab('leaks');
        } else if (hash.includes('servicios') || hash.includes('catalogo')) {
          setActiveNavTab('servicios');
        } else if (hash.includes('nosotros') || hash.includes('about')) {
          setActiveNavTab('nosotros');
        } else if (hash.includes('contacto') || hash.includes('contact')) {
          setActiveNavTab('contacto');
        } else if (hash.includes('privacidad')) {
          setActiveNavTab('privacidad');
        } else if (hash.includes('terminos')) {
          setActiveNavTab('terminos');
        } else if (hash.includes('reclamaciones')) {
          setActiveNavTab('reclamaciones');
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
    window.location.hash = PANEL_HASH;
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
      <Suspense fallback={<PageFallback />}>
      <AdminPortal
        onBackToStore={navigateToStore}
        vendors={vendors}
        onUpdateVendors={handleUpdateVendors}
        services={services}
        onUpdateServices={handleUpdateServices}
        paymentMethods={paymentMethods}
        onUpdatePaymentMethods={handleUpdatePaymentMethods}
        leakArticles={leakArticles ?? []}
        onUpdateLeakArticles={handleUpdateLeakArticles}
        onStaffSession={handleStaffSession}
      />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar with Real Multi-Page Navigation */}
      <Navbar
        activeTab={activeNavTab === 'figura' ? 'leaks' : activeNavTab}
        onTabChange={handleTabChange}
        onOpenAdmin={navigateToPortal}
      />

      {/* Main Content Layout - Separate Views for Maximum Contrast and Flow */}
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
        {/* ======================= PAGE: SERVICIOS ======================= */}
        {activeNavTab === 'servicios' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-16">
            <ServicesPage
              services={services}
              vendors={vendors}
              customImages={customImages}
              onImageUpload={handleImageUpload}
              onOpenDetails={(s) => {
                recordProductViewEvent(s.id, s.title, s.vendorId);
                setSelectedService(s);
              }}
              paymentMethods={paymentMethods}
              onNavigateToContact={() => handleTabChange('contacto')}
            />
          </div>
        )}

        {/* ======================= PAGE: FICHA DE UNA FIGURA ======================= */}
        {activeNavTab === 'figura' && figureId && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-20">
            <FigureProfilePage figureId={figureId} />
          </div>
        )}

        {/* ======================= PAGE: CATÁLOGO POR VENDEDOR ======================= */}
        {activeNavTab === 'tienda' && vendorSlug && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-16">
            <VendorCatalogPage
              slug={vendorSlug}
              services={services}
              vendors={vendors}
              customImages={customImages}
              onImageUpload={handleImageUpload}
              onOpenDetails={(s) => {
                recordProductViewEvent(s.id, s.title, s.vendorId);
                setSelectedService(s);
              }}
              paymentMethods={paymentMethods}
              onBackToCatalog={() => handleTabChange('servicios')}
            />
          </div>
        )}

        {/* ======================= PAGE: LEAKS & FILTRACIONES ======================= */}
        {activeNavTab === 'leaks' && (
          <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
            {leakArticles ? (
              <LeaksTab
                articles={leakArticles}
                onOpenContact={() => handleTabChange('contacto')}
              />
            ) : (
              <PageFallback />
            )}
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

        {/* ======================= PAGE: POLÍTICA DE PRIVACIDAD ======================= */}
        {activeNavTab === 'privacidad' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16">
            <PrivacyPage onNavigateToContact={() => handleTabChange('contacto')} onNavigateToTerms={() => handleTabChange('terminos')} />
          </div>
        )}

        {/* ======================= PAGE: TÉRMINOS Y CONDICIONES ======================= */}
        {activeNavTab === 'terminos' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16">
            <TermsPage onNavigateToContact={() => handleTabChange('contacto')} onNavigateToPrivacy={() => handleTabChange('privacidad')} />
          </div>
        )}

        {/* ======================= PAGE: LIBRO DE RECLAMACIONES ======================= */}
        {activeNavTab === 'reclamaciones' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16">
            <ComplaintsPage onNavigateToTerms={() => handleTabChange('terminos')} onNavigateToPrivacy={() => handleTabChange('privacidad')} />
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

            {/* Banner del equipo: solo imagen; al pulsarla lleva a Nosotros (no a ningún chat) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6 sm:pb-8">
              <button
                type="button"
                onClick={() => handleTabChange('nosotros')}
                className="group block w-full cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 transition-colors hover:border-[#00ff88]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00ff88]"
              >
                <img
                  src="/imagenes/banner-equipo.webp"
                  alt="Descuentos Perú: el Perú necesita una voz, una voz unida. El equipo: @elnanovip, @Tin9o, @whiskyper, @DIESTRApe y @AbbysPeru. Pulsa para conocer al equipo."
                  width={1600}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
                />
              </button>
            </section>

            {/* Quick Section Jump Cards */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-6 sm:pt-2 sm:pb-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Card 1: Servicios */}
                <div
                  onClick={() => handleTabChange('servicios')}
                  className="group hud-card p-4 sm:p-5 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer hover:bg-zinc-900"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700">
                      <Layers className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-zinc-900/60 px-2 py-0.5 rounded-full">
                      {services.filter((s) => s.active !== false).length} ACTIVOS
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#00ff88] transition-colors">
                    Catálogo de Servicios
                  </h3>
                  <p className="hidden sm:block text-xs text-slate-400 mt-1 line-clamp-2">
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
                  className="group hud-card p-4 sm:p-5 rounded-xl bg-gradient-to-b from-[#1c0808] to-[#0a0303] border border-rose-900/60 hover:border-rose-500/80 transition-all cursor-pointer hover:bg-[#240a0a]"
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
                  <p className="hidden sm:block text-xs text-slate-400 mt-1 line-clamp-2">
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
                  className="group hud-card p-4 sm:p-5 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer hover:bg-zinc-900"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700">
                      <Users className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-zinc-900/60 px-2 py-0.5 rounded-full">
                      GARANTÍA 100%
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#00ff88] transition-colors">
                    Quiénes Somos
                  </h3>
                  <p className="hidden sm:block text-xs text-slate-400 mt-1 line-clamp-2">
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
                  className="group hud-card p-4 sm:p-5 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer hover:bg-zinc-900"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700">
                      <Send className="w-5 h-5 -rotate-12" />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#00ff88] bg-zinc-900/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                      EN LÍNEA
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#00ff88] transition-colors">
                    Contacto & Soporte
                  </h3>
                  <p className="hidden sm:block text-xs text-slate-400 mt-1 line-clamp-2">
                    Atención personalizada por Telegram con respuesta garantizada en menos de 5 min.
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#00ff88]">
                    <span>Escribir por Telegram</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </section>

            {/* Cómo funciona */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <p className="section-eyebrow">01 / Cómo funciona</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-6">
                De la elección a la activación, <span className="text-gradient">en tres pasos</span>
              </h2>
              <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { n: '01', t: 'Elige', d: 'Explora el catálogo y escoge el servicio y el plan que necesitas.' },
                  { n: '02', t: 'Paga', d: 'Yape o tu banco preferido; envías el comprobante a tu vendedor.' },
                  { n: '03', t: 'Recibe', d: 'Activación por Telegram en minutos, con garantía de reposición.' }
                ].map((s) => (
                  <li key={s.n} className="hud-card relative rounded-xl p-5 sm:p-6">
                    <span className="font-mono text-4xl sm:text-5xl font-black text-zinc-800 select-none">{s.n}</span>
                    <h3 className="mt-2 text-lg font-black text-white">{s.t}</h3>
                    <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{s.d}</p>
                  </li>
                ))}
              </ol>
            </section>
            {/* Featured Services Showcase */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <p className="section-eyebrow">02 / Más solicitados</p>
                  <div className="hidden">
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#00ff88] hover:bg-[#00e676] transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
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
                      recordProductViewEvent(s.id, s.title, s.vendorId);
                      setSelectedService(s);
                    }}
                    vendors={vendors}
                  />
                ))}
              </div>

              </section>

            {/* Leaks & Threat Intel Spotlight Banner */}
            <LeaksBanner onExploreLeaks={() => handleTabChange('leaks')} />

            {/* Payment Methods Showcase Banner with Real Official App Logos */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <PaymentMethodsBanner paymentMethods={paymentMethods} />

              {/* Telegram Connect Banner */}
              <div className="mt-6 sm:mt-8">
                <TelegramBanner
                  onDirectClick={() => {
                    handleTabChange('contacto');
                  }}
                />
              </div>
            </div>

          </>
        )}
        </Suspense>
      </main>

      {/* Botón "Volver al panel": solo lo ve un administrador con sesión activa */}
      <AdminReturnButton />

      {/* Footer with Global Multi-Page Navigation */}
      <Footer
        onOpenAdmin={navigateToPortal}
        onNavigateTab={handleTabChange}
        activeTab={activeNavTab === 'figura' ? 'leaks' : activeNavTab}
      />

      {/* Interactive Detail Modal with Vendor and Payment Selection */}
      {modalMounted && (<Suspense fallback={null}><ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        vendors={vendors}
        paymentMethods={paymentMethods}
      /></Suspense>)}

      <AuthHost />

      {/* Global Floating Creators Dock */}
      <FloatingVendorsDock />
    </div>
  );
}



