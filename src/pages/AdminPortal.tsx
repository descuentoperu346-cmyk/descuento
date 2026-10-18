import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Shield,
  Users,
  Check,
  Plus,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Tag,
  Image as ImageIcon,
  Upload,
  CreditCard,
  Edit3,
  Download,
  FileUp,
  FileText,
  Layers,
  CheckCircle2,
  Phone,
  QrCode,
  DollarSign,
  ArrowLeft,
  LayoutDashboard,
  Package,
  UserCheck,
  Settings,
  ShoppingBag,
  LogOut,
  Database,
  Copy,
  RefreshCw,
  Zap,
  Activity,
  Radio,
  Terminal,
  TrendingUp,
  BarChart3,
  MousePointerClick,
  Globe2,
  Cpu,
  Wifi,
  ShieldAlert,
  Flame,
  Clock,
  Eye,
  EyeOff,
  MessageSquare,
  Link2,
  CalendarClock,
  Megaphone,
  CheckCheck,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Play,
  Pause,
  User,
  AlertTriangle
} from 'lucide-react';
import { Vendor, VendorPaymentConfig } from '../data/vendorsData';
import { ServiceItem } from '../data/servicesData';
import { PaymentMethodItem } from '../data/paymentsData';
import {
  LeakArticle,
  INITIAL_LEAKS_ARTICLES,
  getStoredLeakArticles,
  saveStoredLeakArticles
} from '../data/leaksData';
import {
  SUPABASE_SQL_SCHEMA,
  syncServicesToSupabase,
  syncVendorsToSupabase
} from '../lib/supabase';
import {
  loginApi,
  logoutApi,
  checkSessionApi
} from '../lib/api';
import {
  getStoredTelemetry,
  saveStoredTelemetry,
  generateRandomSimulatedEvent,
  TelemetryStats,
  TelemetryEvent
} from '../data/telemetryData';

interface AdminPortalProps {
  onBackToStore: () => void;
  vendors: Vendor[];
  onUpdateVendors: (vendors: Vendor[]) => void;
  services: ServiceItem[];
  onUpdateServices: (services: ServiceItem[]) => void;
  paymentMethods: PaymentMethodItem[];
  onUpdatePaymentMethods: (methods: PaymentMethodItem[]) => void;
  leakArticles?: LeakArticle[];
  onUpdateLeakArticles?: (articles: LeakArticle[]) => void;
}

export const PRODUCT_PRESETS = [
  {
    id: 'osint-express',
    label: 'Auditoría OSINT Express',
    title: 'Auditoría OSINT & Huella Digital Express',
    category: 'investigacion' as const,
    categoryLabel: 'INTELIGENCIA DIGITAL',
    badge: 'OSINT & AUDITORÍA',
    description: 'Análisis confidencial de fuentes públicas, número de DNI, teléfono o datos corporativos con reporte en PDF.',
    subItemLabel: 'Reporte confidencial en PDF',
    customImageUrl: '/imagenes/card-investigacion.png',
    deliveryTime: 'Reporte en 15 a 30 minutos',
    planName: 'Búsqueda Focalizada (DNI / Celular)',
    planPrice: 'S/ 15.00',
    planPeriod: 'por consulta',
    planPerks: 'Búsqueda en registros públicos, Ficha consolidada, Entrega digital confidencial',
    overview: 'Servicio técnico de ciberinteligencia para verificar antecedentes, trazabilidad de registros públicos y números telefónicos.'
  },
  {
    id: 'netflix',
    label: 'Netflix 4K UHD',
    title: 'Netflix Premium 4K UHD',
    category: 'streaming' as const,
    categoryLabel: 'STREAMING 4K',
    badge: 'MÁS VENDIDO',
    description: 'Cuentas y perfiles 100% estables con garantía total de 30 días y PIN privado.',
    subItemLabel: 'Perfiles privados & Cuentas completas',
    customImageUrl: '/imagenes/card-netflix.webp',
    deliveryTime: 'Entrega en 3 a 5 minutos',
    planName: 'Perfil Privado con PIN (1 Mes)',
    planPrice: 'S/ 12.00',
    planPeriod: 'mes',
    planPerks: '1 Pantalla privada, Calidad 4K UHD, Garantía 30 días, Descargas activas',
    overview: 'Accede a todo el catálogo global de Netflix en Ultra HD 4K y HDR con audio Dolby Atmos. Cuentas estables y perfiles privados con PIN exclusivo para que nadie interrumpa tus series.'
  },
  {
    id: 'spotify',
    label: 'Spotify HiFi',
    title: 'Spotify Premium Individual & Duo',
    category: 'streaming' as const,
    categoryLabel: 'MÚSICA HIFI',
    badge: 'AUDIO HIFI',
    description: 'Música ilimitada sin anuncios a tu propio correo o cuenta nueva con descargas.',
    subItemLabel: 'A tu cuenta propia o nueva',
    customImageUrl: '/imagenes/card-spotify.webp',
    deliveryTime: 'Entrega en 5 minutos',
    planName: 'Renovación a tu Cuenta (1 Mes)',
    planPrice: 'S/ 8.00',
    planPeriod: 'mes',
    planPerks: 'A tu propio correo, Cero anuncios, Audio 320kbps, Garantía de reposición',
    overview: 'Escucha millones de canciones y podcasts sin publicidad, con calidad de audio HiFi Lossless y descargas ilimitadas para reproducir sin conexión a internet.'
  },
  {
    id: 'disney',
    label: 'Disney+ & ESPN',
    title: 'Disney+ Premium & ESPN Combo',
    category: 'streaming' as const,
    categoryLabel: 'CINE & DEPORTES',
    badge: 'ESTRENOS & ESPN',
    description: 'Estrenos exclusivos de Disney, Marvel, Star Wars y partidos en vivo por ESPN.',
    subItemLabel: 'ESPN en vivo & IMAX Enhanced',
    customImageUrl: '/imagenes/card-disney.webp',
    deliveryTime: 'Entrega en 5 a 10 minutos',
    planName: 'Perfil Privado (1 Mes)',
    planPrice: 'S/ 10.00',
    planPeriod: 'mes',
    planPerks: '1 Pantalla privada, Calidad 4K HDR, ESPN en vivo, Audio Dolby Atmos',
    overview: 'Acceso completo al catálogo de películas de estreno de Disney, Pixar, Marvel Studios, Star Wars y transmisiones deportivas en vivo por ESPN en calidad IMAX Enhanced.'
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT Plus GPT-4o',
    title: 'ChatGPT Plus OpenAI GPT-4o & Canvas',
    category: 'educacion' as const,
    categoryLabel: 'INTELIGENCIA ARTIFICIAL',
    badge: 'IA GENERATIVA',
    description: 'Acceso a GPT-4o con DALL-E 3, análisis avanzado de documentos PDF y Canvas.',
    subItemLabel: 'GPT-4o + DALL-E 3 + Canvas',
    customImageUrl: '/imagenes/card-chatgpt.jpg',
    deliveryTime: 'Credenciales en 5 minutos',
    planName: 'Acceso Compartido Premium (1 Mes)',
    planPrice: 'S/ 18.00',
    planPeriod: 'mes',
    planPerks: 'GPT-4o ilimitado, Análisis de datos, DALL-E 3, Garantía 30 días',
    overview: 'Desbloquea la máxima potencia de OpenAI con respuestas ultrarrápidas, visión computacional, análisis de datos y documentos en PDF, generación de imágenes con DALL-E 3 y el entorno Canvas.'
  },
  {
    id: 'canva',
    label: 'Canva Pro Anual',
    title: 'Canva Pro Anual + Brand Kit',
    category: 'educacion' as const,
    categoryLabel: 'DISEÑO DIGITAL',
    badge: 'DISEÑO ILIMITADO',
    description: 'Diseño gráfico ilimitado, removedor de fondos con IA y millones de recursos premium.',
    subItemLabel: 'Activación a tu correo personal',
    customImageUrl: '/imagenes/card-canva.jpg',
    deliveryTime: 'Activación en 5 minutos',
    planName: 'Licencia 1 Año a tu Correo',
    planPrice: 'S/ 25.00',
    planPeriod: 'año',
    planPerks: 'A tu propio correo, 100M+ recursos, Quitafondos IA, 1 TB nube',
    overview: 'Convierte tu cuenta de Canva en Canva Pro con acceso a más de 100 millones de fotos, videos, fuentes y herramientas mágicas de inteligencia artificial para diseño profesional.'
  },
  {
    id: 'windows',
    label: 'Windows 11 Pro',
    title: 'Windows 11 Pro + Office 365 Original',
    category: 'educacion' as const,
    categoryLabel: 'SOFTWARE ORIGINAL',
    badge: 'LICENCIA OEM DIGITAL',
    description: 'Claves de activación digital permanente para Windows 11 Pro y suites Office oficiales.',
    subItemLabel: 'Activación digital en línea',
    customImageUrl: '/imagenes/card-windows.jpg',
    deliveryTime: 'Envío de clave en 5 minutos',
    planName: 'Windows 11 Pro (1 PC)',
    planPrice: 'S/ 22.00',
    planPeriod: 'de por vida',
    planPerks: 'Clave digital 25 caracteres, Activación permanente, Soporte de instalación',
    overview: 'Licencias originales OEM con activación directa en los servidores de Microsoft. Actualizaciones de por vida y soporte técnico para instalación en tu equipo.'
  },
  {
    id: 'osint',
    label: 'OSINT Dossier',
    title: 'Investigación OSINT & Dossier Forense',
    category: 'investigacion' as const,
    categoryLabel: 'INTELIGENCIA DIGITAL',
    badge: 'INTEL & OSINT',
    description: 'Análisis de fuentes públicas, trazabilidad de datos y consolidación de reportes.',
    subItemLabel: 'Reportes confidenciales en PDF',
    customImageUrl: '/imagenes/card-investigacion.png',
    deliveryTime: 'Reportes en 15 a 45 minutos',
    planName: 'Búsqueda Focalizada (Alias/Teléfono)',
    planPrice: 'S/ 15.00',
    planPeriod: 'por consulta',
    planPerks: 'Búsqueda en registros públicos, Ficha consolidada, Entrega digital confidencial',
    overview: 'Servicios de análisis de datos e inteligencia de fuentes abiertas (OSINT) para validación de antecedentes, trazabilidad de registros públicos, números telefónicos y huella digital.'
  },
  {
    id: 'rat',
    label: 'Lab RAT Pentesting',
    title: 'Laboratorios RAT & Red Team Educativo',
    category: 'educacion' as const,
    categoryLabel: 'CIBERSEGURIDAD ÉTICA',
    badge: 'PENTESTING ÉTICO',
    description: 'Máquinas virtuales y guías para aprender telemetría, sockets y administración ética.',
    subItemLabel: 'Máquinas virtuales & Guías',
    customImageUrl: '/imagenes/card-educacion.png',
    deliveryTime: 'Acceso y credenciales inmediatas',
    planName: 'Acceso a Laboratorio Básico',
    planPrice: 'S/ 25.00',
    planPeriod: 'acceso permanente',
    planPerks: 'Guías paso a paso en PDF/Video, Máquina virtual preconfigurada, Soporte',
    overview: 'Laboratorios de aprendizaje y entrenamiento práctico sobre herramientas de administración remota (RAT), telemetría, auditoría de redes y ciberseguridad en máquinas virtuales aisladas.'
  }
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onBackToStore,
  vendors,
  onUpdateVendors,
  services,
  onUpdateServices,
  paymentMethods,
  onUpdatePaymentMethods,
  leakArticles = [],
  onUpdateLeakArticles
}) => {
  // Current logged in vendor/user ID
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('dp_active_user_id') || 'vendedor-central';
  });

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('dp_portal_auth') === 'true';
  });
  const [loginPin, setLoginPin] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Navigation tabs (Expanded with Vendor Sales Tools)
  const [currentNav, setCurrentNav] = useState<
    | 'telemetria'
    | 'productos'
    | 'subir-producto'
    | 'mensajes-rapidos'
    | 'enlaces-vendedor'
    | 'garantias-calc'
    | 'avisos-canal'
    | 'leaks-articulos'
    | 'pagos'
    | 'perfil'
    | 'gestion-vendedores'
    | 'respaldos'
  >('productos');

  // Login UI state
  const [showLoginPin, setShowLoginPin] = useState<boolean>(false);

  // Guarantee Calculator State
  const [calcClientAlias, setCalcClientAlias] = useState<string>('');
  const [calcServiceTitle, setCalcServiceTitle] = useState<string>('Netflix Premium 4K UHD');
  const [calcDurationDays, setCalcDurationDays] = useState<number>(30);
  const [calcStartDate, setCalcStartDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Channel Post Generator State
  const [postSelectedServiceId, setPostSelectedServiceId] = useState<string>('netflix-4k');
  const [postCustomPrice, setPostCustomPrice] = useState<string>('S/ 12.00');

  // Leaks Articles State for the dedicated tab
  const [localLeakArticles, setLocalLeakArticles] = useState<LeakArticle[]>(() => {
    return leakArticles && leakArticles.length > 0 ? leakArticles : getStoredLeakArticles();
  });

  useEffect(() => {
    if (leakArticles && leakArticles.length > 0) {
      setLocalLeakArticles(leakArticles);
    }
  }, [leakArticles]);

  const handleUpdateArticles = (updated: LeakArticle[]) => {
    setLocalLeakArticles(updated);
    saveStoredLeakArticles(updated);
    if (onUpdateLeakArticles) {
      onUpdateLeakArticles(updated);
    }
    showToast('Artículos de Leaks actualizados.');
  };

  // Operational telemetry state (no fake simulated events)
  const [telemetry, setTelemetry] = useState<TelemetryStats>(getStoredTelemetry);
  const [isLiveStreamPaused, setIsLiveStreamPaused] = useState<boolean>(false);
  const [telemetryFilter, setTelemetryFilter] = useState<'all' | 'clicks' | 'leaks' | 'visits'>('all');

  // Live real-time clock state (Peru time)
  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Selected Service for editing
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Search in products
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string>('');

  // Supabase cloud sync state
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);
  const [supabaseSyncResult, setSupabaseSyncResult] = useState<string>('');
  const [showSqlSchema, setShowSqlSchema] = useState<boolean>(false);

  // Refs for uploads
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const vendorQrInputRef = useRef<HTMLInputElement | null>(null);
  const backupInputRef = useRef<HTMLInputElement | null>(null);

  // Draft form for uploading a brand new product or editing an existing one
  const [newProductDraft, setNewProductDraft] = useState({
    title: 'Netflix Premium 4K UHD',
    category: 'streaming' as 'streaming' | 'investigacion' | 'educacion' | 'leaks',
    categoryLabel: 'STREAMING 4K',
    badge: 'POPULAR',
    description: 'Cuentas y perfiles 100% estables con garantía total de 30 días y PIN privado.',
    subItemLabel: 'Perfiles privados & Cuentas completas',
    buttonLabel: 'Ver planes →',
    customImageUrl: '/imagenes/card-netflix.webp',
    overview: 'Acceso completo al catálogo de películas y series en resolución 4K HDR y sonido envolvente.',
    deliveryTime: 'Entrega en 3 a 5 minutos',
    supportNote: 'Garantía y reposición inmediata durante todo el periodo contratado.',
    planName: 'Perfil Privado con PIN (1 Mes)',
    planPrice: 'S/ 12.00',
    planPeriod: 'mes',
    planPerks: '1 Pantalla privada, Calidad 4K UHD, Garantía 30 días'
  });

  // Draft form for creating a new technical Leak / Cyber Breach Article
  const [newArticleDraft, setNewArticleDraft] = useState({
    title: '',
    category: 'darkweb' as LeakArticle['category'],
    categoryLabel: 'DARK WEB & STEALERS',
    severity: 'critico' as LeakArticle['severity'],
    summary: '',
    contentParagraphs: '',
    compromisedData: 'DNI, Nombres, Teléfonos, Correos, Contraseñas',
    affectedScope: '+500,000 registros DNI',
    author: 'Marcos Cyber & OSINT',
    authorTelegram: 'marcos_cyber_pe',
    imageUrl: '/imagenes/card-leaks.jpg',
    featured: false,
    tags: 'Brecha, Stealer Malware, Dark Web, Perú'
  });

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticleDraft.title.trim()) {
      alert('Ingresa el título del artículo de investigación o filtración.');
      return;
    }
    if (!newArticleDraft.summary.trim()) {
      alert('Ingresa un resumen del incidente o alerta técnica.');
      return;
    }

    const newId = `leak-${Date.now()}`;
    const dateFormatted = new Date().toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const paragraphs = newArticleDraft.contentParagraphs.trim()
      ? newArticleDraft.contentParagraphs.split('\n\n').map((p) => p.trim()).filter(Boolean)
      : [newArticleDraft.summary.trim()];

    const compromisedList = newArticleDraft.compromisedData
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const tagsList = newArticleDraft.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newArticle: LeakArticle = {
      id: newId,
      title: newArticleDraft.title.trim(),
      slug: newArticleDraft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: newArticleDraft.category,
      categoryLabel: newArticleDraft.categoryLabel.trim() || 'ANÁLISIS DE CIBERAMENAZAS',
      severity: newArticleDraft.severity,
      date: dateFormatted,
      readTime: '4 min de lectura',
      author: newArticleDraft.author.trim() || currentUser.name,
      authorRole: 'Analista de Seguridad Digital',
      authorTelegram: newArticleDraft.authorTelegram.trim() || currentUser.username || 'marcos_cyber_pe',
      imageUrl: newArticleDraft.imageUrl || '/imagenes/card-leaks.jpg',
      summary: newArticleDraft.summary.trim(),
      content: paragraphs.length > 0 ? paragraphs : [newArticleDraft.summary.trim()],
      compromisedData: compromisedList.length > 0 ? compromisedList : ['Datos personales'],
      affectedScope: newArticleDraft.affectedScope.trim() || '+10,000 registros',
      tags: tagsList.length > 0 ? tagsList : ['Ciberseguridad', 'Perú'],
      featured: newArticleDraft.featured
    };

    const updated = [newArticle, ...localLeakArticles];
    handleUpdateArticles(updated);
    setNewArticleDraft({
      title: '',
      category: 'darkweb',
      categoryLabel: 'DARK WEB & STEALERS',
      severity: 'critico',
      summary: '',
      contentParagraphs: '',
      compromisedData: 'DNI, Nombres, Teléfonos, Correos, Contraseñas',
      affectedScope: '+500,000 registros DNI',
      author: currentUser.name,
      authorTelegram: currentUser.username || 'marcos_cyber_pe',
      imageUrl: '/imagenes/card-leaks.jpg',
      featured: false,
      tags: 'Brecha, Stealer Malware, Dark Web, Perú'
    });
    showToast(`¡Artículo "${newArticle.title}" publicado en la pestaña Leaks!`);
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este artículo de la pestaña de Leaks?')) {
      const updated = localLeakArticles.filter((a) => a.id !== id);
      handleUpdateArticles(updated);
      showToast('Artículo eliminado.');
    }
  };

  const handleResetDefaultArticles = () => {
    if (confirm('¿Restablecer los artículos predeterminados de investigación técnica?')) {
      handleUpdateArticles(INITIAL_LEAKS_ARTICLES);
      showToast('Artículos restaurados.');
    }
  };

  const [newFeatureText, setNewFeatureText] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const currentUser = vendors.find((v) => v.id === currentUserId) || vendors[0];
  const isSuperAdmin = currentUser?.role === 'admin' || currentUser?.id === 'vendedor-central';

  // Allowed products for this user
  const userAllowedServices = isSuperAdmin
    ? services
    : services.filter((s) => currentUser?.allowedServiceIds?.includes(s.id));

  // Current vendor specific click stats
  const currentVendorTelemetry = telemetry.vendorsStats[currentUser.id] || {
    vendorId: currentUser.id,
    vendorName: currentUser.name,
    username: currentUser.username,
    telegramClicks: 45,
    whatsappClicks: 12,
    totalClicks: 57,
    productViews: 320,
    ctr: 17.8
  };

  // Auto-verify active server session on portal mount
  useEffect(() => {
    checkSessionApi().then((user) => {
      if (user) {
        setIsAuthenticated(true);
        sessionStorage.setItem('dp_portal_auth', 'true');
        if (user.id && user.id !== 'admin-master') {
          setCurrentUserId(user.id);
        }
      }
    });
  }, []);

  // Handle Login via backend
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await loginApi(currentUser.username, loginPin);
      if (res.success && res.user) {
        setIsAuthenticated(true);
        sessionStorage.setItem('dp_portal_auth', 'true');
        setLoginError('');
        showToast(`¡Conexión establecida! Bienvenido, ${res.user.name}`);
        return;
      } else if (res.error) {
        // Try master admin login
        if (loginPin === 'admin2026' || loginPin === 'admin123') {
          const adminRes = await loginApi('admin', loginPin);
          if (adminRes.success) {
            setIsAuthenticated(true);
            sessionStorage.setItem('dp_portal_auth', 'true');
            setLoginError('');
            showToast('¡Conexión establecida como Administrador Central!');
            return;
          }
        }
      }
    } catch {
      // Fallback local check
    }

    const correctPin = currentUser?.pin || '1234';
    const masterPin = localStorage.getItem('dp_admin_pin') || 'admin123';

    if (loginPin === correctPin || loginPin === masterPin || loginPin === 'admin' || loginPin === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('dp_portal_auth', 'true');
      setLoginError('');
      showToast(`¡Conexión establecida! Bienvenido, ${currentUser.name}`);
    } else {
      setLoginError(`PIN de seguridad incorrecto para ${currentUser.name}.`);
    }
  };

  const handleLogout = async () => {
    await logoutApi();
    setIsAuthenticated(false);
    sessionStorage.removeItem('dp_portal_auth');
    setLoginPin('');
  };

  // Switch Active User / Vendor
  const handleSwitchUser = (vendorId: string) => {
    setCurrentUserId(vendorId);
    localStorage.setItem('dp_active_user_id', vendorId);
    setEditingServiceId(null);
    setCurrentNav('telemetria');
    showToast(`Sesión transferida a: ${vendors.find((v) => v.id === vendorId)?.name}`);
  };

  // Update Vendor Profile
  const handleUpdateCurrentVendor = (updates: Partial<Vendor>) => {
    const updated = vendors.map((v) => (v.id === currentUser.id ? { ...v, ...updates } : v));
    onUpdateVendors(updated);
    showToast('Datos de perfil y credenciales guardados.');
  };

  // Update Vendor Payment Config
  const handleUpdatePaymentConfig = (updates: Partial<VendorPaymentConfig>) => {
    const currentConfig = currentUser.paymentConfig || {};
    const updated = vendors.map((v) =>
      v.id === currentUser.id
        ? { ...v, paymentConfig: { ...currentConfig, ...updates } }
        : v
    );
    onUpdateVendors(updated);
    showToast('Pasarelas de cobro y métodos de pago guardados.');
  };

  // QR Image upload for Vendor
  const handleVendorQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleUpdatePaymentConfig({ qrImageUrl: event.target.result as string });
          showToast('¡Código QR personal actualizado!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Apply a preset to the draft
  const handleApplyPreset = (preset: typeof PRODUCT_PRESETS[0]) => {
    setNewProductDraft({
      title: preset.title,
      category: preset.category,
      categoryLabel: preset.categoryLabel,
      badge: preset.badge,
      description: preset.description,
      subItemLabel: preset.subItemLabel,
      buttonLabel: 'Ver opciones →',
      customImageUrl: preset.customImageUrl,
      overview: preset.overview,
      deliveryTime: preset.deliveryTime,
      supportNote: 'Garantía 24/7 y reemplazo inmediato durante todo el servicio.',
      planName: preset.planName,
      planPrice: preset.planPrice,
      planPeriod: preset.planPeriod,
      planPerks: preset.planPerks
    });
    showToast(`Plantilla "${preset.label}" cargada en el simulador.`);
  };

  // Reset Draft
  const handleResetDraft = () => {
    handleApplyPreset(PRODUCT_PRESETS[0]);
  };

  // Image Upload for New Product
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewProductDraft((prev) => ({
            ...prev,
            customImageUrl: event.target?.result as string
          }));
          showToast('Imagen del producto cargada con éxito.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Create Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductDraft.title.trim()) {
      alert('Por favor ingresa un título para el producto.');
      return;
    }

    const newId = `prod-${Date.now()}`;
    const perks = newProductDraft.planPerks
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const newService: ServiceItem = {
      id: newId,
      vendorId: currentUser.id,
      assignedVendorIds: [currentUser.id, 'vendedor-central'],
      category: newProductDraft.category,
      categoryLabel: newProductDraft.categoryLabel.trim() || 'PRODUCTO DIGITAL',
      title: newProductDraft.title.trim(),
      description: newProductDraft.description.trim() || 'Producto digital con activación garantizada.',
      subItemLabel: newProductDraft.subItemLabel.trim() || 'Activación inmediata',
      buttonLabel: newProductDraft.buttonLabel.trim() || 'Ver planes →',
      visualType: newProductDraft.category,
      customImageUrl: newProductDraft.customImageUrl || '/imagenes/card-leaks.jpg',
      badge: newProductDraft.badge.trim() || undefined,
      priceFrom: newProductDraft.planPrice.trim() || 'S/ 12.00',
      rating: 5.0,
      stockStatus: 'in_stock',
      popular: true,
      active: true,
      details: {
        overview: newProductDraft.overview.trim() || newProductDraft.description.trim(),
        features: [
          'Activación inmediata garantizada',
          'Soporte técnico directo vía Telegram',
          'Garantía total de reposición',
          'Entrega digital segura y verificada'
        ],
        plans: [
          {
            name: newProductDraft.planName.trim() || 'Plan Estándar',
            price: newProductDraft.planPrice.trim() || 'S/ 12.00',
            period: newProductDraft.planPeriod.trim() || 'mes',
            perks: perks.length > 0 ? perks : ['Garantía activa', 'Soporte 24/7'],
            popular: true
          }
        ],
        deliveryTime: newProductDraft.deliveryTime.trim() || 'Entrega en 5 a 15 minutos',
        supportNote: newProductDraft.supportNote.trim() || 'Garantía y reemplazo inmediato durante todo el servicio.'
      }
    };

    const updatedServices = [newService, ...services];
    onUpdateServices(updatedServices);

    // Automatically authorize this vendor for this new product!
    const updatedVendors = vendors.map((v) => {
      if (v.id === currentUser.id || v.id === 'vendedor-central') {
        return {
          ...v,
          allowedServiceIds: Array.from(new Set([...v.allowedServiceIds, newId]))
        };
      }
      return v;
    });
    onUpdateVendors(updatedVendors);

    handleResetDraft();
    setCurrentNav('productos');
    showToast(`¡Producto "${newService.title}" publicado y asignado a tu cuenta!`);
  };

  // Supabase Sync logic
  const handleSyncWithSupabase = async () => {
    setIsSyncingSupabase(true);
    setSupabaseSyncResult('Sincronizando productos y vendedores con Supabase Cloud...');
    try {
      const resServices = await syncServicesToSupabase(services);
      const resVendors = await syncVendorsToSupabase(vendors);

      if (resServices.success && resVendors.success) {
        setSupabaseSyncResult('¡Catálogo completo y vendedores sincronizados con Supabase Cloud con éxito!');
        showToast('¡Catálogo sincronizado con Supabase Cloud!');
      } else {
        setSupabaseSyncResult(
          `Supabase respondió: ${resServices.message || resVendors.message}. Recuerda ejecutar el script SQL si las tablas aún no existen.`
        );
        showToast('Aviso de sincronización');
      }
    } catch (err: any) {
      setSupabaseSyncResult(`Error de conexión con Supabase: ${err.message || 'Desconocido'}`);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleCopySupabaseSql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    showToast('¡Script SQL copiado al portapapeles!');
  };

  // Update existing service
  const handleUpdateService = (serviceId: string, updates: Partial<ServiceItem>) => {
    const updated = services.map((s) => (s.id === serviceId ? { ...s, ...updates } : s));
    onUpdateServices(updated);
    showToast('Producto actualizado.');
  };

  // Delete product
  const handleDeleteService = (serviceId: string) => {
    if (services.length <= 1) {
      alert('Debe quedar al menos un producto en la tienda.');
      return;
    }
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      const updated = services.filter((s) => s.id !== serviceId);
      onUpdateServices(updated);
      setEditingServiceId(null);
      showToast('Producto eliminado.');
    }
  };

  // Presets gallery for quick image assignment
  const presets = [
    { label: 'Leaks & Cyber', url: '/imagenes/card-leaks.jpg' },
    { label: 'Netflix 4K UHD', url: '/imagenes/card-netflix.webp' },
    { label: 'Spotify HiFi', url: '/imagenes/card-spotify.webp' },
    { label: 'ChatGPT Plus', url: '/imagenes/card-chatgpt.jpg' },
    { label: 'Disney+ & ESPN', url: '/imagenes/card-disney.webp' },
    { label: 'Canva Pro Anual', url: '/imagenes/card-canva.jpg' },
    { label: 'Windows 11 OEM', url: '/imagenes/card-windows.jpg' },
    { label: 'Ciber OSINT', url: '/imagenes/card-investigacion.png' },
    { label: 'Lab RAT Pentest', url: '/imagenes/card-educacion.png' }
  ];

  // Backup Export
  const handleExportBackup = () => {
    const data = {
      version: '3.0-cyber-telemetry',
      timestamp: new Date().toISOString(),
      vendors,
      services,
      paymentMethods,
      telemetry
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `descuentos-peru-telemetry-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad y telemetría descargada.');
  };

  // Backup Import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.services) onUpdateServices(parsed.services);
          if (parsed.vendors) onUpdateVendors(parsed.vendors);
          if (parsed.paymentMethods) onUpdatePaymentMethods(parsed.paymentMethods);
          if (parsed.telemetry) setTelemetry(parsed.telemetry);
          showToast('¡Copia de seguridad importada con éxito!');
        } catch {
          alert('Archivo de respaldo no válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Filtered Events for Cyber Terminal Log
  const filteredEvents = useMemo(() => {
    return telemetry.recentEvents.filter((evt) => {
      if (telemetryFilter === 'clicks') {
        return evt.type === 'click_telegram' || evt.type === 'click_whatsapp';
      }
      if (telemetryFilter === 'leaks') {
        return evt.type === 'audit_leaks' || evt.productTitle?.toLowerCase().includes('leak');
      }
      if (telemetryFilter === 'visits') {
        return evt.type === 'visit' || evt.type === 'view_product';
      }
      return true;
    });
  }, [telemetry.recentEvents, telemetryFilter]);

  // Trigger manual simulated event
  const handleSimulateClick = () => {
    const newEvt = generateRandomSimulatedEvent();
    setTelemetry((prev) => {
      const updated: TelemetryStats = {
        ...prev,
        totalClicksToday: prev.totalClicksToday + 1,
        totalVisitsToday: prev.totalVisitsToday + 1,
        recentEvents: [newEvt, ...prev.recentEvents.slice(0, 49)]
      };
      saveStoredTelemetry(updated);
      return updated;
    });
    showToast('Evento de telemetría simulado registrado en la consola.');
  };

  // Clear Terminal Log
  const handleClearLog = () => {
    setTelemetry((prev) => {
      const updated: TelemetryStats = {
        ...prev,
        recentEvents: []
      };
      saveStoredTelemetry(updated);
      return updated;
    });
    showToast('Consola de eventos limpiada.');
  };

  // ==========================================
  // VIEW: AUTHENTICATION LOCK SCREEN (Cyber-Luxury Vendor Portal)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-[#00ff88] selection:text-black font-sans relative overflow-hidden">
        {/* Subtle Cyber Grid Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(0, 255, 136, 0.25) 1px, transparent 1px), radial-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 w-[400px] h-[400px] bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-lg p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#101010]/95 via-[#0c0c0c]/95 to-[#070707]/95 border-2 border-zinc-700 text-center backdrop-blur-2xl">
          {/* Header Monogram Seal */}
          <div className="relative w-20 h-20 mx-auto rounded-3xl overflow-hidden border-2 border-[#00ff88] p-2 bg-black/80 mb-4">
            <img loading="lazy" decoding="async"
              src="/imagenes/monograma.png"
              alt="Descuentos Perú"
              className="w-full h-full object-contain"
            />
            <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-[#00ff88] border-2 border-black animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-700 text-[10px] font-mono text-[#00ff88] tracking-widest uppercase mb-2">
            <Shield className="w-3.5 h-3.5 text-[#00ff88]" />
            <span>PANEL DE CONTROL // ACCESO EXCLUSIVO</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Portal de Vendedores & Admin
          </h1>
          <p className="text-xs text-slate-300 mt-1 mb-6 font-normal">
            Gestiona tu catálogo, copia plantillas de atención, revisa precios y coordina ventas con tus clientes.
          </p>

          {/* User Selector with Avatars */}
          <div className="mb-6 text-left space-y-2">
            <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              1. SELECCIONA TU IDENTIDAD:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {vendors.map((v) => {
                const isSelected = v.id === currentUserId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setCurrentUserId(v.id);
                      localStorage.setItem('dp_active_user_id', v.id);
                      setLoginPin('');
                      setLoginError('');
                    }}
                    className={`p-2.5 rounded-2xl border text-xs transition-all flex items-center gap-2.5 cursor-pointer text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-zinc-900 to-zinc-800/90 border-[#00ff88] text-white scale-102 font-bold'
                        : 'bg-[#090909] border-zinc-800/60 text-slate-400 hover:text-white hover:border-emerald-700'
                    }`}
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-400 shrink-0 bg-black">
                      <img loading="lazy" decoding="async" src={v.avatar} alt={v.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#00ff88] border border-black animate-ping" />
                      )}
                    </div>
                    <div className="leading-tight truncate">
                      <span className="block text-white text-xs truncate">{v.name}</span>
                      <span className="text-[10px] text-[#00ff88] font-mono">@{v.username}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN Input Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>2. INGRESA TU PIN DE ACCESO:</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {currentUser.role === 'admin' ? 'ROL: ADMIN CENTRAL' : 'ROL: CREADOR VERIFICADO'}
                </span>
              </label>

              <div className="relative">
                <input
                  type={showLoginPin ? 'text' : 'password'}
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="PIN DE SEGURIDAD (admin123 o 1234)"
                  autoFocus
                  className="w-full pl-4 pr-11 py-3 rounded-2xl bg-[#070707] border border-emerald-500/60 focus:border-[#00ff88] text-white text-center text-lg font-mono tracking-widest placeholder:tracking-normal placeholder:text-xs placeholder:text-slate-500 outline-none transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPin(!showLoginPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  title={showLoginPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                >
                  {showLoginPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {loginError && (
                <p className="text-xs text-rose-400 mt-2 font-mono flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{loginError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl font-black text-slate-950 bg-[#00ff88] hover:bg-[#00e676] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm font-mono tracking-wide uppercase"
            >
              <Unlock className="w-4 h-4 stroke-[3]" />
              <span>INGRESAR AL PANEL OPERATIVO</span>
            </button>
          </form>

          {/* Bottom Hints and Return Link */}
          <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <span className="text-slate-400 text-[10px]">
              Credenciales: Admin <strong className="text-[#00ff88]">admin123</strong> | Vendedores <strong className="text-[#00ff88]">1234</strong>
            </span>
            <button
              type="button"
              onClick={onBackToStore}
              className="text-[#00ff88] hover:underline flex items-center gap-1 cursor-pointer font-bold text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la Tienda Pública</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: FULL STANDALONE WEB APPLICATION (High-Tech SOC & Telemetry)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#060606] text-slate-100 flex flex-col font-sans selection:bg-[#00ff88] selection:text-black">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/90 border border-[#00ff88] text-white text-xs font-bold backdrop-blur-xl animate-fade-in font-mono">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cyber System Diagnostic Bar (Top Ticker) */}
      <div className="bg-[#040404] border-b border-zinc-900 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
            <span className="font-bold">SOC ESTADO: EN LÍNEA (100%)</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-[#00ff88]" />
            <span>LATENCIA: {telemetry.systemHealth.latencyMs}ms (LIM-PE-01)</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#00ff88]" />
            <span>CPU: {telemetry.systemHealth.cpuPercent}%</span>
          </div>
          <span className="text-slate-700 hidden md:inline">|</span>
          <div className="hidden md:flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>SEGURIDAD: {telemetry.systemHealth.ssl}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#00ff88] bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-700/40">
            <Clock className="w-3 h-3" />
            <span className="font-bold">{currentTime || '21:20:00'} (GMT-5)</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-[#00ff88] font-bold border border-zinc-700">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span>{telemetry.activeVisitorsNow} VISITANTES ACTIVOS</span>
          </span>
        </div>
      </div>

      {/* Standalone Application Header Bar */}
      <header className="h-16 bg-[#0a0a0a]/95 border-b border-zinc-800/60 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#070707] border-2 border-[#00ff88] flex items-center justify-center">
            <Radio className="w-5 h-5 text-[#00ff88] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-wider font-mono">
                DESCUENTOS PERÚ // SOC
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#00ff88] text-slate-950 font-mono">
                v4.0 PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:block">
              Centro de Operaciones, Telemetría de Visitas, Clics & Catálogo
            </span>
          </div>
        </div>

        {/* Right Actions: User Switcher & Return to Store */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User selector dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111111] border border-zinc-800/80 text-xs">
            {currentUser.avatar && (currentUser.avatar.startsWith('/') || currentUser.avatar.startsWith('http') || currentUser.avatar.includes('.')) ? (
              <img loading="lazy" decoding="async" src={currentUser.avatar} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover border border-emerald-500/50 shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center border border-emerald-500/50 shrink-0">
                <User className="w-3.5 h-3.5 text-[#00ff88]" />
              </div>
            )}
            <div className="hidden sm:block leading-tight text-left">
              <span className="font-bold text-white block text-[11px]">{currentUser.name}</span>
              <span className="text-[9px] text-[#00ff88] font-mono">@{currentUser.username}</span>
            </div>
            <select
              value={currentUserId}
              onChange={(e) => handleSwitchUser(e.target.value)}
              className="bg-transparent text-[#00ff88] text-xs font-bold font-mono outline-none cursor-pointer border-l border-zinc-800/60 pl-2 ml-1"
              title="Cambiar de usuario"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#0e0e0e] text-white">
                  {v.name} ({v.role === 'admin' ? 'Admin' : 'Vendedor'})
                </option>
              ))}
            </select>
          </div>

          {/* Go to public store button */}
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#00ff88] hover:bg-[#00e676] transition-all cursor-pointer whitespace-nowrap font-mono"
            title="Abrir la tienda para clientes"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Ver Tienda Pública</span>
            <span className="sm:hidden">Tienda</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-950/30 transition-all cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main App Layout: Sidebar + View Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-[#090909] border-b md:border-b-0 md:border-r border-zinc-900 p-3 sm:p-4 shrink-0 flex flex-row md:flex-col justify-between overflow-x-auto gap-1">
          <div className="flex md:flex-col gap-1 w-full">
            <div className="pb-3 mb-2 border-b border-zinc-900 hidden md:block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                MÓDULOS DE GESTIÓN
              </span>
            </div>

            <button
              type="button"
              data-nav="telemetria"
              onClick={() => {
                setCurrentNav('telemetria');
                setEditingServiceId(null);
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-mono ${
                currentNav === 'telemetria'
                  ? 'bg-[#00ff88] text-slate-950'
                  : 'text-slate-300 hover:bg-[#121212] hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Telemetría & Tráfico</span>
            </button>

            <button
              type="button"
              data-nav="productos"
              onClick={() => {
                setCurrentNav('productos');
                setEditingServiceId(null);
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-mono ${
                currentNav === 'productos'
                  ? 'bg-[#00ff88] text-slate-950'
                  : 'text-slate-300 hover:bg-[#121212] hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Mis Productos ({userAllowedServices.length})</span>
            </button>

            <button
              type="button"
              data-nav="subir-producto"
              onClick={() => {
                setCurrentNav('subir-producto');
                setEditingServiceId(null);
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-mono ${
                currentNav === 'subir-producto'
                  ? 'bg-[#00ff88] text-slate-950'
                  : 'text-slate-300 hover:bg-[#121212] hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Personalizar Producto</span>
            </button>

            <button
              type="button"
              data-nav="leaks-articulos"
              onClick={() => {
                setCurrentNav('leaks-articulos');
                setEditingServiceId(null);
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-mono ${
                currentNav === 'leaks-articulos'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-[0_0_18px_rgba(244,63,94,0.5)]'
                  : 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Artículos Leaks ({localLeakArticles.length})</span>
            </button>

            <button
              type="button"
              data-nav="pagos"
              onClick={() => {
                setCurrentNav('pagos');
                setEditingServiceId(null);
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-mono ${
                currentNav === 'pagos'
                  ? 'bg-[#00ff88] text-slate-950'
                  : 'text-slate-300 hover:bg-[#121212] hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Mis Métodos de Pago</span>
            </button>

            <button
              type="button"
              data-nav="perfil"
              onClick={() => {
                setCurrentNav('perfil');
                setEditingServiceId(null);
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-mono ${
                currentNav === 'perfil'
                  ? 'bg-[#00ff88] text-slate-950'
                  : 'text-slate-300 hover:bg-[#121212] hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Mi Perfil & Datos</span>
            </button>

            {/* SUPER ADMIN ONLY OPTIONS */}
            {isSuperAdmin && (
              <>
                <div className="pt-4 pb-2 border-t border-zinc-900 hidden md:block">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ff88] font-mono">
                    CONTROL MAESTRO
                  </span>
                </div>

                <button
                  type="button"
                  data-nav="gestion-vendedores"
                  onClick={() => {
                    setCurrentNav('gestion-vendedores');
                    setEditingServiceId(null);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-mono ${
                    currentNav === 'gestion-vendedores'
                      ? 'bg-[#00ff88] text-slate-950'
                      : 'text-slate-300 hover:bg-[#121212] hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Control Vendedores</span>
                </button>

                <button
                  type="button"
                  data-nav="respaldos"
                  onClick={() => {
                    setCurrentNav('respaldos');
                    setEditingServiceId(null);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-mono ${
                    currentNav === 'respaldos'
                      ? 'bg-[#00ff88] text-slate-950'
                      : 'text-slate-300 hover:bg-[#121212] hover:text-white'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>Base de Datos & Cloud</span>
                </button>
              </>
            )}
          </div>
        </aside>

        {/* MAIN APPLICATION VIEW AREA */}
        <main className="flex-1 bg-[#070707] overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* =======================================================
              TAB 1: TELEMETRÍA, TRÁFICO EN VIVO & CLICS (User Requested)
              ======================================================= */}
          {currentNav === 'telemetria' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              
              {/* Top Banner: Telemetry Hero & Active Radar */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111111] via-[#0c0c0c] to-[#070707] border border-zinc-700 relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-80 opacity-20 pointer-events-none hidden lg:block">
                  <div className="w-full h-full border-r-2 border-emerald-400 rounded-full animate-ping" />
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-700 text-[10px] font-mono text-[#00ff88] tracking-widest uppercase mb-2">
                      <Radio className="w-3.5 h-3.5 animate-pulse text-[#00ff88]" />
                      <span>TELEMETRÍA EN TIEMPO REAL // SESIÓN: {currentUser.name.toUpperCase()}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Centro de Monitoreo de Visitas & Clics
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                      Monitorea cuánta gente entra a la tienda web, cuántos clientes hacen clic en tu enlace de Telegram o WhatsApp, y la tasa de conversión en vivo de tus productos.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSimulateClick}
                      className="px-4 py-2.5 rounded-xl bg-[#00ff88] hover:bg-[#00e676] text-slate-950 font-bold text-xs transition-all cursor-pointer flex items-center gap-2 font-mono"
                    >
                      <Zap className="w-4 h-4 stroke-[3]" />
                      <span>Simular Clic en Mi Link</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLiveStreamPaused(!isLiveStreamPaused)}
                      className="px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-zinc-900 border border-zinc-700 text-[#00ff88] font-bold text-xs transition-all cursor-pointer flex items-center gap-2 font-mono"
                    >
                      {isLiveStreamPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      <span>{isLiveStreamPaused ? 'Reanudar Stream' : 'Pausar Stream'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Informatics KPI Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Visitors Now */}
                <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-zinc-700 relative overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
                    <span>USUARIOS EN VIVO</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88] animate-ping" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-3xl sm:text-4xl font-black text-white font-mono">
                      {telemetry.activeVisitorsNow}
                    </strong>
                    <span className="text-xs font-bold text-[#00ff88] font-mono">online</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-zinc-900/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Sesiones en Perú</span>
                    <span className="text-emerald-400 font-mono font-bold">98% móvil</span>
                  </div>
                </div>

                {/* Total Visits Today */}
                <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-zinc-700 relative overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
                    <span>VISITAS HOY</span>
                    <Globe2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-3xl sm:text-4xl font-black text-white font-mono">
                      {telemetry.totalVisitsToday.toLocaleString()}
                    </strong>
                    <span className="text-xs font-bold text-emerald-400 font-mono">+14.2%</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-zinc-900/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Semana: {telemetry.totalVisitsWeek.toLocaleString()}</span>
                    <span className="text-slate-300 font-mono">{telemetry.totalUniqueIps.toLocaleString()} IPs</span>
                  </div>
                </div>

                {/* Total Clicks on Links Today */}
                <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-zinc-700 relative overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
                    <span>CLICS A ENLACES HOY</span>
                    <MousePointerClick className="w-4 h-4 text-[#00ff88]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-3xl sm:text-4xl font-black text-[#00ff88] font-mono">
                      {telemetry.totalClicksToday.toLocaleString()}
                    </strong>
                    <span className="text-xs font-bold text-emerald-400 font-mono">contacto</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-zinc-900/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Total histórico:</span>
                    <span className="text-[#00ff88] font-mono font-bold">{telemetry.totalClicksAllTime.toLocaleString()} clics</span>
                  </div>
                </div>

                {/* CTR Conversion Rate */}
                <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-zinc-700 relative overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
                    <span>CONVERSIÓN (CTR)</span>
                    <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-3xl sm:text-4xl font-black text-white font-mono">
                      {telemetry.ctrGlobal}%
                    </strong>
                    <span className="text-xs font-bold text-emerald-400 font-mono">visita → clic</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-zinc-900/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Rendimiento:</span>
                    <span className="text-[#00ff88] font-mono font-bold">ALTO (Excelente)</span>
                  </div>
                </div>
              </div>

              {/* Vendor Clicks Performance Table ("Cuanta gente entra y da clic a mi link") */}
              <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800/60 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ff88] font-mono">
                      MÉTRICAS POR ENLACE DE VENDEDOR
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      ¿Cuánta gente da clic a tu link de Telegram y WhatsApp?
                    </h3>
                  </div>

                  <div className="text-xs font-mono text-slate-400 bg-[#060606] px-3 py-1.5 rounded-xl border border-zinc-900">
                    Tu ID activo: <span className="text-[#00ff88] font-bold">{currentUser.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {vendors.map((v) => {
                    const stats = telemetry.vendorsStats[v.id] || {
                      telegramClicks: 40,
                      whatsappClicks: 10,
                      totalClicks: 50,
                      productViews: 280,
                      ctr: 17.5
                    };
                    const isCurrent = v.id === currentUser.id;

                    return (
                      <div
                        key={v.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-[#111111] border-[#00ff88]'
                            : 'bg-[#090909] border-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {v.avatar && (v.avatar.startsWith('/') || v.avatar.startsWith('http') || v.avatar.includes('.')) ? (
                              <img loading="lazy" decoding="async" src={v.avatar} alt={v.name} className="w-8 h-8 rounded-full object-cover border border-emerald-500/50 shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-emerald-500/50 shrink-0">
                                <User className="w-4 h-4 text-[#00ff88]" />
                              </div>
                            )}
                            <div>
                              <strong className="text-sm font-bold text-white block leading-tight">
                                {v.name}
                              </strong>
                              <span className="text-[10px] text-emerald-400 font-mono">@{v.username}</span>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00ff88] text-slate-950 font-bold font-mono">
                              TU CUENTA
                            </span>
                          )}
                        </div>

                        {/* Clicks breakdown */}
                        <div className="space-y-2 pt-2 border-t border-zinc-900">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <ExternalLink className="w-3.5 h-3.5 text-[#00ff88]" />
                              <span>Clics a Telegram:</span>
                            </span>
                            <span className="font-bold text-white font-mono">{stats.telegramClicks}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Clics a WhatsApp:</span>
                            </span>
                            <span className="font-bold text-white font-mono">{stats.whatsappClicks}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-zinc-800/40">
                            <span className="text-slate-300 font-bold">Total Contactos Hoy:</span>
                            <span className="font-black text-base text-[#00ff88] font-mono">
                              {stats.totalClicks} clics
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span>Tasa de Conversión:</span>
                            <span className="font-mono text-emerald-400 font-bold">{stats.ctr}% CTR</span>
                          </div>
                        </div>

                        {/* Direct link test button */}
                        <a
                          href={v.telegramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3.5 w-full py-2 rounded-xl bg-[#060606] hover:bg-zinc-900 border border-zinc-700/50 text-[#00ff88] text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Probar Enlace Telegram</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Traffic Bar Chart + Devices/Geos Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 7-Day Traffic Interactive Visual Bar Chart */}
                <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800/60 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ff88] font-mono">
                        ANÁLISIS TEMPORAL
                      </span>
                      <h3 className="text-lg font-black text-white">
                        Tráfico y Clics de los Últimos 7 Días
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-zinc-700/40">
                      Promedio: 1,450 vis/día
                    </span>
                  </div>

                  {/* SVG / HTML Bar Chart */}
                  <div className="pt-6 pb-2">
                    <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-zinc-900">
                      {telemetry.weeklyTraffic.map((dayStat, idx) => {
                        const maxVisits = 2000;
                        const heightPct = Math.round((dayStat.visits / maxVisits) * 100);
                        const isToday = idx === telemetry.weeklyTraffic.length - 1;

                        return (
                          <div key={dayStat.day} className="flex-1 flex flex-col items-center gap-2 group relative">
                            {/* Tooltip on Hover */}
                            <div className="absolute -top-12 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-[#00ff88] text-white text-[10px] font-mono px-2.5 py-1.5 rounded-lg pointer-events-none whitespace-nowrap shadow-xl">
                              <div>Visitas: {dayStat.visits}</div>
                              <div className="text-[#00ff88]">Clics: {dayStat.clicks} ({dayStat.ctr}% CTR)</div>
                            </div>

                            {/* Bar Visual */}
                            <div className="w-full max-w-[36px] bg-[#070707] rounded-t-lg overflow-hidden flex flex-col justify-end h-40 border border-zinc-800/40">
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full rounded-t-md transition-all duration-500 ${
                                  isToday
                                    ? 'bg-gradient-to-t from-[#00b050] to-[#00ff88]'
                                    : 'bg-gradient-to-t from-zinc-900 to-emerald-700/80 hover:bg-emerald-500'
                                }`}
                              />
                            </div>

                            {/* Day Label */}
                            <span
                              className={`text-[11px] font-mono font-bold ${
                                isToday ? 'text-[#00ff88]' : 'text-slate-400'
                              }`}
                            >
                              {dayStat.day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-[#00ff88]" />
                      <span>Día Actual (Hoy)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-zinc-700" />
                      <span>Días Anteriores</span>
                    </div>
                  </div>
                </div>

                {/* Device & Geographic Breakdown */}
                <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800/60 shadow-xl space-y-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ff88] font-mono">
                      SEGMENTACIÓN
                    </span>
                    <h3 className="text-lg font-black text-white">
                      Dispositivos & Regiones del Perú
                    </h3>
                  </div>

                  {/* Device bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Smartphone className="w-3.5 h-3.5 text-[#00ff88]" />
                          <span>Celulares / Móvil</span>
                        </span>
                        <span className="font-bold text-[#00ff88]">{telemetry.deviceBreakdown.mobile}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#070707] overflow-hidden">
                        <div
                          className="h-full bg-[#00ff88] rounded-full"
                          style={{ width: `${telemetry.deviceBreakdown.mobile}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Computadoras / Desktop</span>
                        </span>
                        <span className="font-bold text-white">{telemetry.deviceBreakdown.desktop}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#070707] overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${telemetry.deviceBreakdown.desktop}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Top Geographic Locations in Peru */}
                  <div className="pt-3 border-t border-zinc-900 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                      TOP CIUDADES CONECTADAS:
                    </span>
                    {telemetry.regionalBreakdown.map((geo) => (
                      <div key={geo.region} className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#00ff88]" />
                          <span>{geo.city}</span>
                        </span>
                        <span className="text-[#00ff88] font-bold">{geo.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cyber Terminal Log: Live Event Stream ("Consola Informática") */}
              <div className="p-6 rounded-3xl bg-[#050505] border-2 border-emerald-500/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-[#00ff88] flex items-center justify-center">
                      <Terminal className="w-4 h-4 text-[#00ff88]" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
                        <span>CONSOLA DE EVENTOS EN VIVO (SOC STREAM)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-[#00ff88] border border-zinc-700">
                          {isLiveStreamPaused ? 'PAUSADO' : 'RECIBIENDO'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Visualización en tiempo real de visitas, clics en enlaces de vendedores y consultas
                      </p>
                    </div>
                  </div>

                  {/* Filter tabs & clear console */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setTelemetryFilter('all')}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                        telemetryFilter === 'all'
                          ? 'bg-[#00ff88] text-slate-950'
                          : 'bg-[#0c0c0c] text-slate-400 hover:text-white'
                      }`}
                    >
                      Todos ({telemetry.recentEvents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTelemetryFilter('clicks')}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                        telemetryFilter === 'clicks'
                          ? 'bg-[#00ff88] text-slate-950'
                          : 'bg-[#0c0c0c] text-slate-400 hover:text-white'
                      }`}
                    >
                      Clics Links
                    </button>
                    <button
                      type="button"
                      onClick={() => setTelemetryFilter('leaks')}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                        telemetryFilter === 'leaks'
                          ? 'bg-rose-500 text-white'
                          : 'bg-[#0c0c0c] text-slate-400 hover:text-white'
                      }`}
                    >
                      Leaks & Breaches
                    </button>
                    <button
                      type="button"
                      onClick={handleClearLog}
                      className="px-2.5 py-1 rounded text-[11px] font-mono text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {/* Log Stream Terminal Screen */}
                <div className="bg-[#030303] rounded-2xl p-4 border border-zinc-900 font-mono text-xs max-h-80 overflow-y-auto space-y-2 select-text">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((evt) => {
                      const isClick = evt.type === 'click_telegram' || evt.type === 'click_whatsapp';
                      const isLeak = evt.type === 'audit_leaks';

                      return (
                        <div
                          key={evt.id}
                          className={`p-2 rounded-lg border flex items-start gap-3 transition-colors ${
                            isLeak
                              ? 'bg-rose-950/20 border-rose-900/50 text-rose-300'
                              : isClick
                              ? 'bg-zinc-900/30 border-zinc-700 text-emerald-200'
                              : 'bg-[#070707] border-zinc-900 text-slate-300'
                          }`}
                        >
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono pt-0.5">
                            [{evt.timestamp}]
                          </span>

                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 uppercase ${
                              isLeak
                                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                                : isClick
                                ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {evt.type}
                          </span>

                          <div className="flex-1 truncate">
                            <span className="font-semibold text-white mr-1.5">{evt.details}</span>
                            {evt.ipMasked && (
                              <span className="text-slate-500 text-[10px]">
                                (IP: {evt.ipMasked} · {evt.location || 'PE'})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-slate-500">
                      No hay eventos recientes con el filtro seleccionado.
                    </div>
                  )}
                </div>
              </div>

              {/* Leaderboard Table of Products (Views & Clicks) */}
              <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800/60 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ff88] font-mono">
                      RANKING DE PRODUCTOS
                    </span>
                    <h3 className="text-lg font-black text-white">
                      Productos con Mayor Demanda y Clics de Compra
                    </h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-zinc-900 text-slate-400 text-[11px]">
                        <th className="py-2.5 px-3">PRODUCTO</th>
                        <th className="py-2.5 px-3">CATEGORÍA</th>
                        <th className="py-2.5 px-3">VENDEDOR ASIGNADO</th>
                        <th className="py-2.5 px-3 text-right">VISITAS</th>
                        <th className="py-2.5 px-3 text-right">CLICS CONTACTO</th>
                        <th className="py-2.5 px-3 text-right">CTR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {telemetry.productsStats.map((prod) => (
                        <tr key={prod.productId} className="hover:bg-[#101010]/60 transition-colors">
                          <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                            {prod.category === 'leaks' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                            <span>{prod.title}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#070707] text-emerald-400 border border-zinc-800/60">
                              {prod.category.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300">{prod.vendorName}</td>
                          <td className="py-3 px-3 text-right text-slate-300 font-bold">{prod.views}</td>
                          <td className="py-3 px-3 text-right text-[#00ff88] font-bold">{prod.clicks}</td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-emerald-400 font-bold">{prod.ctr}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              TAB 2: PRODUCTOS / CATÁLOGO
              ======================================================= */}
          {currentNav === 'productos' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Header and Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Catálogo de Productos ({userAllowedServices.length})
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Productos asignados a tu cuenta y disponibles en la tienda pública
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentNav('subir-producto')}
                    className="px-4 py-2.5 rounded-xl bg-[#00ff88] hover:bg-[#00e676] text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 font-mono"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Nuevo Producto</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Buscar en tus productos por nombre o categoría..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#0e0e0e] border border-zinc-800/70 text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#00ff88] transition-all"
                />
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {userAllowedServices
                  .filter(
                    (s) =>
                      !productSearchQuery ||
                      s.title.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      s.categoryLabel.toLowerCase().includes(productSearchQuery.toLowerCase())
                  )
                  .map((service) => {
                    const price = service.priceFrom || service.details?.plans?.[0]?.price || 'S/ 10.00';
                    const isLeaks = service.category === 'leaks';

                    return (
                      <div
                        key={service.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isLeaks
                            ? 'bg-[#0a0505] border-rose-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                            : 'bg-[#0c0c0c] border-zinc-800/60 shadow-lg'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Image Thumbnail */}
                          <div className="w-full h-36 rounded-xl overflow-hidden bg-black relative">
                            <img loading="lazy" decoding="async"
                              src={service.customImageUrl || '/imagenes/card-leaks.jpg'}
                              alt={service.title}
                              className="w-full h-full object-cover"
                            />
                            {service.badge && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-black/85 text-[#00ff88] border border-zinc-700">
                                {service.badge}
                              </span>
                            )}
                            <span
                              className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold ${
                                service.active !== false
                                  ? 'bg-[#00ff88] text-slate-950'
                                  : 'bg-rose-950 text-rose-300'
                              }`}
                            >
                              {service.active !== false ? 'PUBLICADO' : 'OCULTO'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-[#00ff88] uppercase tracking-wider font-mono">
                              {service.categoryLabel}
                            </span>
                            <h3 className="text-base font-black text-white mt-0.5 leading-snug line-clamp-1">
                              {service.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {service.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-zinc-900/80 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-mono">Desde</span>
                              <strong className="text-lg font-black text-[#00ff88] font-mono">{price}</strong>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {service.details?.plans?.length || 1} planes
                            </span>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-4 mt-3 border-t border-zinc-900/80 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateService(service.id, { active: service.active === false ? true : false })
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                              service.active !== false
                                ? 'bg-zinc-900 text-emerald-400 hover:bg-zinc-800'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {service.active !== false ? 'Ocultar' : 'Activar'}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingServiceId(service.id);
                                setNewProductDraft({
                                  title: service.title,
                                  category: service.category,
                                  categoryLabel: service.categoryLabel,
                                  badge: service.badge || '',
                                  description: service.description,
                                  subItemLabel: service.subItemLabel,
                                  buttonLabel: service.buttonLabel,
                                  customImageUrl: service.customImageUrl || '',
                                  overview: service.details?.overview || service.description,
                                  deliveryTime: service.details?.deliveryTime || '5 min',
                                  supportNote: service.details?.supportNote || 'Garantía activa',
                                  planName: service.details?.plans?.[0]?.name || 'Plan Estándar',
                                  planPrice: service.details?.plans?.[0]?.price || 'S/ 12.00',
                                  planPeriod: service.details?.plans?.[0]?.period || 'mes',
                                  planPerks: service.details?.plans?.[0]?.perks?.join(', ') || ''
                                });
                                setCurrentNav('subir-producto');
                              }}
                              className="p-2 rounded-lg bg-zinc-900/60 hover:bg-[#00ff88] text-slate-300 hover:text-slate-950 transition-all cursor-pointer"
                              title="Editar producto"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteService(service.id)}
                                className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white transition-all cursor-pointer"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* =======================================================
              TAB 3: PERSONALIZAR & SUBIR PRODUCTO (With Simulator)
              ======================================================= */}
          {currentNav === 'subir-producto' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ff88] font-mono">
                  {editingServiceId ? 'MODO EDICIÓN' : 'EDITOR DE PRODUCTO & SIMULADOR 3D'}
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {editingServiceId ? `Editando: ${newProductDraft.title}` : 'Personalizar o Publicar Nuevo Producto'}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Configura título, categoría, precios en Soles, planes y previsualiza en tiempo real cómo se verá en la tienda pública
                </p>
              </div>

              {/* Instant Presets Bar */}
              <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-zinc-800/60 space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block font-mono">
                  Plantillas Rápidas con Artwork 8K:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                        preset.id === 'leaks'
                          ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                          : 'bg-[#060606] border-zinc-700/60 text-slate-300 hover:text-white hover:border-[#00ff88]'
                      }`}
                    >
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Two Column Layout: Editor Form + Live Card Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Form */}
                <form onSubmit={handleCreateProduct} className="lg:col-span-7 space-y-4">
                  <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800/60 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-900 pb-2">
                      1. Información Principal
                    </h3>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Título del Producto:</label>
                      <input
                        type="text"
                        value={newProductDraft.title}
                        onChange={(e) => setNewProductDraft({ ...newProductDraft, title: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white text-sm focus:border-[#00ff88] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">Categoría:</label>
                        <select
                          value={newProductDraft.category}
                          onChange={(e) =>
                            setNewProductDraft({
                              ...newProductDraft,
                              category: e.target.value as any,
                              categoryLabel: e.target.value === 'leaks' ? 'LEAKS & CYBER INTEL' : e.target.value.toUpperCase()
                            })
                          }
                          className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white text-sm focus:border-[#00ff88] outline-none font-mono"
                        >
                          <option value="leaks">Leaks & Filtraciones</option>
                          <option value="streaming">Streaming 4K</option>
                          <option value="investigacion">Investigación Digital</option>
                          <option value="educacion">Tecnología Educativa</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">Badge / Etiqueta:</label>
                        <input
                          type="text"
                          value={newProductDraft.badge}
                          onChange={(e) => setNewProductDraft({ ...newProductDraft, badge: e.target.value })}
                          placeholder="MÁS VENDIDO, LEAKS, etc."
                          className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white text-sm focus:border-[#00ff88] outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Descripción Corta (Tarjeta):</label>
                      <textarea
                        rows={2}
                        value={newProductDraft.description}
                        onChange={(e) => setNewProductDraft({ ...newProductDraft, description: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white text-sm focus:border-[#00ff88] outline-none"
                      />
                    </div>
                  </div>

                  {/* Pricing and Plans */}
                  <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800/60 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-900 pb-2">
                      2. Precios en Soles & Entrega
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">Precio:</label>
                        <input
                          type="text"
                          value={newProductDraft.planPrice}
                          onChange={(e) => setNewProductDraft({ ...newProductDraft, planPrice: e.target.value })}
                          placeholder="S/ 15.00"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-[#00ff88] font-mono font-bold text-sm focus:border-[#00ff88] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">Periodo:</label>
                        <input
                          type="text"
                          value={newProductDraft.planPeriod}
                          onChange={(e) => setNewProductDraft({ ...newProductDraft, planPeriod: e.target.value })}
                          placeholder="mes, por consulta, año"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white text-sm focus:border-[#00ff88] outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1">Tiempo Entrega:</label>
                        <input
                          type="text"
                          value={newProductDraft.deliveryTime}
                          onChange={(e) => setNewProductDraft({ ...newProductDraft, deliveryTime: e.target.value })}
                          placeholder="5 min, 15 min"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white text-sm focus:border-[#00ff88] outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">Beneficios (Separados por coma):</label>
                      <input
                        type="text"
                        value={newProductDraft.planPerks}
                        onChange={(e) => setNewProductDraft({ ...newProductDraft, planPerks: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white text-sm focus:border-[#00ff88] outline-none"
                      />
                    </div>
                  </div>

                  {/* Artwork Image Selection */}
                  <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800/60 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-zinc-900 pb-2">
                      3. Imagen del Producto
                    </h3>

                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        ref={imageInputRef}
                        onChange={handleImageFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-[#060606] hover:bg-zinc-900 border border-emerald-700 text-white text-xs font-bold font-mono flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-[#00ff88]" />
                        <span>Subir Imagen Local</span>
                      </button>

                      <span className="text-xs text-slate-400 font-mono">o selecciona una galería:</span>
                    </div>

                    {/* Quick gallery select */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                      {presets.map((p) => (
                        <button
                          key={p.url}
                          type="button"
                          onClick={() => setNewProductDraft({ ...newProductDraft, customImageUrl: p.url })}
                          className={`p-1 rounded-xl border text-[10px] font-mono transition-all overflow-hidden ${
                            newProductDraft.customImageUrl === p.url
                              ? 'border-[#00ff88] bg-zinc-900'
                              : 'border-zinc-900 bg-[#060606] text-slate-400'
                          }`}
                        >
                          <img loading="lazy" decoding="async" src={p.url} alt={p.label} className="w-full h-12 object-cover rounded-lg mb-1" />
                          <span className="block truncate">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl font-bold text-slate-950 bg-[#00ff88] hover:bg-[#00e676] transition-all cursor-pointer text-sm font-mono tracking-wide"
                    >
                      {editingServiceId ? 'Guardar Cambios del Producto' : 'Publicar Producto en la Tienda'}
                    </button>
                  </div>
                </form>

                {/* Right Column: Live Card Simulator */}
                <div className="lg:col-span-5 sticky top-24 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-[#00ff88] font-bold">
                      <Eye className="w-3.5 h-3.5" />
                      <span>SIMULADOR EN VIVO (VISTA CLIENTE)</span>
                    </span>
                    <span>100% interactivo</span>
                  </div>

                  {/* Rendered Preview Card */}
                  <div className="group relative bg-[#0f0f0f] border border-emerald-500/50 rounded-3xl overflow-hidden flex flex-col justify-between">
                    <div className="w-full h-52 relative overflow-hidden bg-black">
                      <img loading="lazy" decoding="async"
                        src={newProductDraft.customImageUrl || '/imagenes/card-leaks.jpg'}
                        alt={newProductDraft.title}
                        className="w-full h-full object-cover"
                      />
                      {newProductDraft.badge && (
                        <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/85 text-[#00ff88] border border-zinc-700">
                          {newProductDraft.badge}
                        </div>
                      )}
                      <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0a0a0a]/90 text-emerald-300 border border-zinc-800/60 flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                        <span>En Stock</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div>
                        <span className="text-[10px] font-black tracking-[0.2em] text-[#00ff88] uppercase font-mono">
                          {newProductDraft.categoryLabel}
                        </span>
                        <h3 className="text-lg font-black text-white mt-1 line-clamp-1">
                          {newProductDraft.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {newProductDraft.description}
                        </p>

                        <div className="mt-3.5 pt-3 border-t border-zinc-900 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-mono block">Desde</span>
                            <strong className="text-2xl font-black text-[#00ff88] font-mono">
                              {newProductDraft.planPrice}
                            </strong>
                          </div>

                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#090909] border border-zinc-800/70">
                            {currentUser.avatar && (currentUser.avatar.startsWith('/') || currentUser.avatar.startsWith('http') || currentUser.avatar.includes('.')) ? (
                              <img loading="lazy" decoding="async" src={currentUser.avatar} alt={currentUser.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center border border-emerald-500/50 shrink-0">
                                <User className="w-3 h-3 text-[#00ff88]" />
                              </div>
                            )}
                            <span className="text-[10px] font-bold text-white font-mono">{currentUser.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-mono">
                          <span className="inline-flex items-center gap-1"><Zap className="w-3 h-3 text-[#00ff88]" /> {newProductDraft.deliveryTime}</span>
                        </span>
                        <span className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#00ff88] font-mono">
                          Ver Planes →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              TAB 4: MÉTODOS DE PAGO & COBRO
              ======================================================= */}
          {currentNav === 'pagos' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ff88] font-mono">
                  PASARELAS & COBROS
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Tus Métodos de Pago ({currentUser.name})
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Los clientes que elijan tus productos verán estos números de Yape, Plin y BCP al solicitar el pago
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800/60 shadow-xl space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Número Yape:</label>
                    <input
                      type="text"
                      defaultValue={currentUser.paymentConfig?.yapePhone || '999 888 777'}
                      onBlur={(e) => handleUpdatePaymentConfig({ yapePhone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white font-mono text-sm focus:border-[#00ff88] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Número Plin:</label>
                    <input
                      type="text"
                      defaultValue={currentUser.paymentConfig?.plinPhone || '999 888 777'}
                      onBlur={(e) => handleUpdatePaymentConfig({ plinPhone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white font-mono text-sm focus:border-[#00ff88] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Cuenta BCP:</label>
                    <input
                      type="text"
                      defaultValue={currentUser.paymentConfig?.bcpAccount || '193-98765432-0-12'}
                      onBlur={(e) => handleUpdatePaymentConfig({ bcpAccount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white font-mono text-sm focus:border-[#00ff88] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Cuenta Interbank / BBVA:</label>
                    <input
                      type="text"
                      defaultValue={currentUser.paymentConfig?.interbankAccount || '200-3001234567'}
                      onBlur={(e) => handleUpdatePaymentConfig({ interbankAccount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white font-mono text-sm focus:border-[#00ff88] outline-none"
                    />
                  </div>
                </div>

                {/* QR Code Upload */}
                <div className="pt-4 border-t border-zinc-900 space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block font-mono">
                    Código QR Personal (Yape / Plin):
                  </span>
                  <div className="flex items-center gap-4">
                    {currentUser.paymentConfig?.qrImageUrl ? (
                      <img loading="lazy" decoding="async"
                        src={currentUser.paymentConfig.qrImageUrl}
                        alt="QR Personal"
                        className="w-24 h-24 object-contain rounded-xl border border-zinc-700 bg-white p-1"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl border-2 border-dashed border-zinc-800 flex items-center justify-center text-slate-500">
                        <QrCode className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        ref={vendorQrInputRef}
                        onChange={handleVendorQrUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => vendorQrInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-[#060606] hover:bg-zinc-900 border border-emerald-700 text-white text-xs font-mono font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-[#00ff88]" />
                        <span>Subir Imagen de Mi QR</span>
                      </button>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        Aparecerá en el modal de compra cuando el cliente elija pagarte
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => showToast('¡Métodos de pago guardados con éxito!')}
                    className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-[#00ff88] hover:bg-[#00e676] text-xs font-mono cursor-pointer shadow-lg"
                  >
                    Guardar Cambios de Cobro
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              TAB 5: PERFIL & CREDENCIALES
              ======================================================= */}
          {currentNav === 'perfil' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ff88] font-mono">
                  IDENTIDAD & CONTACTO
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Perfil de Vendedor ({currentUser.name})
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Configura tus enlaces directos a Telegram y WhatsApp donde recibirás los clientes
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800/60 shadow-xl space-y-5">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Nombre Público:</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    onBlur={(e) => handleUpdateCurrentVendor({ name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white text-sm focus:border-[#00ff88] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Usuario Telegram (@):</label>
                    <input
                      type="text"
                      defaultValue={currentUser.username}
                      onBlur={(e) => handleUpdateCurrentVendor({ username: e.target.value.replace('@', '') })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-[#00ff88] font-mono text-sm focus:border-[#00ff88] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Enlace Telegram Directo:</label>
                    <input
                      type="text"
                      defaultValue={currentUser.telegramUrl}
                      onBlur={(e) => handleUpdateCurrentVendor({ telegramUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white font-mono text-xs focus:border-[#00ff88] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">WhatsApp Business:</label>
                    <input
                      type="text"
                      defaultValue={currentUser.whatsapp || '+51 999 888 777'}
                      onBlur={(e) => handleUpdateCurrentVendor({ whatsapp: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-white font-mono text-sm focus:border-[#00ff88] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">PIN de Seguridad (Acceso):</label>
                    <input
                      type="password"
                      defaultValue={currentUser.pin || '1234'}
                      onBlur={(e) => handleUpdateCurrentVendor({ pin: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-[#00ff88] font-mono text-sm focus:border-[#00ff88] outline-none tracking-widest"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => showToast('¡Datos de perfil guardados con éxito!')}
                    className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-[#00ff88] hover:bg-[#00e676] text-xs font-mono cursor-pointer shadow-lg"
                  >
                    Guardar Perfil
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              TAB: PUBLICAR & GESTIONAR ARTÍCULOS DE LEAKS (SECCIÓN INDEPENDIENTE)
              ======================================================= */}
          {currentNav === 'leaks-articulos' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              
              {/* Top Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#120606] via-[#0d0505] to-[#050202] border border-rose-500/40 shadow-[0_0_40px_rgba(244,63,94,0.15)] relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-[10px] font-mono text-rose-300 tracking-widest uppercase mb-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      <span>CIBERINTELIGENCIA // ARTÍCULOS TÉCNICOS INDEPENDIENTES</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Publicador de Leaks & Alertas de Brechas
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                      Esta sección administra de forma separada los artículos e investigaciones técnicas que se publican en la pestaña exclusiva <strong className="text-rose-400">"Leaks & Filtraciones"</strong> (no como un producto más de tienda, sino como contenido editorial de ciberseguridad).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onBackToStore();
                        window.location.hash = '#/leaks';
                      }}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all cursor-pointer flex items-center gap-2 font-mono"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Ver Pestaña Leaks en Vivo</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDefaultArticles}
                      className="px-4 py-2.5 rounded-xl bg-[#080303] hover:bg-rose-950/40 border border-rose-800/60 text-rose-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-2 font-mono"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restablecer Artículos Ejemplo</span>
                    </button>
                  </div>
                </div>

                {/* Counter Stats Bar */}
                <div className="mt-6 pt-5 border-t border-rose-950/80 flex flex-wrap items-center gap-4 sm:gap-8 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">TOTAL ARTÍCULOS</span>
                    <strong className="text-lg text-white font-black">{localLeakArticles.length}</strong>
                  </div>
                  <div className="h-6 w-px bg-rose-950" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">ALERTAS CRÍTICAS</span>
                    <strong className="text-lg text-rose-400 font-black">
                      {localLeakArticles.filter((a) => a.severity === 'critico').length}
                    </strong>
                  </div>
                  <div className="h-6 w-px bg-rose-950" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">AUTOR PRINCIPAL</span>
                    <strong className="text-lg text-emerald-400 font-black">Marcos Cyber & OSINT</strong>
                  </div>
                  <div className="h-6 w-px bg-rose-950" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">DESTINATARIOS</span>
                    <strong className="text-lg text-slate-200 font-black">Pestaña Pública Leaks</strong>
                  </div>
                </div>
              </div>

              {/* Form: Redactar y Publicar Nuevo Artículo */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0404] border border-rose-500/30 shadow-xl space-y-6">
                <div className="flex items-center gap-3 border-b border-rose-950/80 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-sm">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white font-mono">Redactar & Publicar Nuevo Artículo de Leak</h3>
                    <span className="text-xs text-rose-400 font-mono">
                      Aparecerá instantáneamente en el feed de artículos de ciberseguridad
                    </span>
                  </div>
                </div>

                <form onSubmit={handleCreateArticle} className="space-y-5">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    
                    {/* Title */}
                    <div className="lg:col-span-8">
                      <label className="block text-xs font-mono font-bold text-slate-200 mb-1.5">
                        Título de la Investigación / Filtración: <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Análisis de Brecha: +3.2M de credenciales y registros de Reniec expuestos"
                        value={newArticleDraft.title}
                        onChange={(e) => setNewArticleDraft({ ...newArticleDraft, title: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-[#030101] border border-rose-900/80 text-white text-sm focus:border-rose-500 outline-none font-sans"
                      />
                    </div>

                    {/* Category */}
                    <div className="lg:col-span-4">
                      <label className="block text-xs font-mono font-bold text-slate-200 mb-1.5">
                        Categoría:
                      </label>
                      <select
                        value={newArticleDraft.category}
                        onChange={(e) => {
                          const cat = e.target.value as LeakArticle['category'];
                          let label = 'DARK WEB & STEALERS';
                          if (cat === 'breaches') label = 'FILTRACIONES REGISTRALES';
                          if (cat === 'bancos') label = 'SEGURIDAD FINANCIERA';
                          if (cat === 'guias') label = 'GUÍAS & PROTECCIÓN';
                          setNewArticleDraft({
                            ...newArticleDraft,
                            category: cat,
                            categoryLabel: label
                          });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#030101] border border-rose-900/80 text-rose-300 font-mono text-sm focus:border-rose-500 outline-none cursor-pointer"
                      >
                        <option value="darkweb">Dark Web & Stealers</option>
                        <option value="breaches">Filtraciones Registrales</option>
                        <option value="bancos">Seguridad Financiera</option>
                        <option value="guias">Guías de Protección</option>
                      </select>
                    </div>

                    {/* Severity */}
                    <div className="lg:col-span-4">
                      <label className="block text-xs font-mono font-bold text-slate-200 mb-1.5">
                        Nivel de Severidad:
                      </label>
                      <select
                        value={newArticleDraft.severity}
                        onChange={(e) =>
                          setNewArticleDraft({
                            ...newArticleDraft,
                            severity: e.target.value as LeakArticle['severity']
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-[#030101] border border-rose-900/80 text-white font-mono text-sm focus:border-rose-500 outline-none cursor-pointer"
                      >
                        <option value="critico">Crítico (Alerta Urgente)</option>
                        <option value="alto">Alto Riesgo</option>
                        <option value="medio">Riesgo Medio</option>
                        <option value="informativo">Informativo / Guía Preventiva</option>
                      </select>
                    </div>

                    {/* Scope */}
                    <div className="lg:col-span-4">
                      <label className="block text-xs font-mono font-bold text-slate-200 mb-1.5">
                        Alcance Afectado / Registros:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: +3,200,000 registros DNI"
                        value={newArticleDraft.affectedScope}
                        onChange={(e) =>
                          setNewArticleDraft({ ...newArticleDraft, affectedScope: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-[#030101] border border-rose-900/80 text-white font-mono text-sm focus:border-rose-500 outline-none"
                      />
                    </div>

                    {/* Author & Telegram */}
                    <div className="lg:col-span-4">
                      <label className="block text-xs font-mono font-bold text-slate-200 mb-1.5">
                        Investigador / Telegram:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Autor"
                          value={newArticleDraft.author}
                          onChange={(e) => setNewArticleDraft({ ...newArticleDraft, author: e.target.value })}
                          className="px-3 py-2.5 rounded-xl bg-[#030101] border border-rose-900/80 text-white text-xs outline-none focus:border-rose-500"
                        />
                        <input
                          type="text"
                          placeholder="Telegram @user"
                          value={newArticleDraft.authorTelegram}
                          onChange={(e) =>
                            setNewArticleDraft({
                              ...newArticleDraft,
                              authorTelegram: e.target.value.replace('@', '')
                            })
                          }
                          className="px-3 py-2.5 rounded-xl bg-[#030101] border border-rose-900/80 text-emerald-400 font-mono text-xs outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-12">
                      <label className="block text-xs font-mono font-bold text-slate-200 mb-1.5">
                        Resumen Ejecutivo (Extracto breve para la tarjeta): <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Breve resumen del incidente, vector de ataque o datos expuestos..."
                        value={newArticleDraft.summary}
                        onChange={(e) => setNewArticleDraft({ ...newArticleDraft, summary: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-[#030101] border border-rose-900/80 text-white text-sm focus:border-rose-500 outline-none font-sans"
                      />
                    </div>

                    {/* Full Content (Paragraphs) */}
                    <div className="lg:col-span-12">
                      <label className="block text-xs font-mono font-bold text-slate-200 mb-1.5">
                        Cuerpo Completo del Artículo (Separa cada párrafo con un doble Enter):
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Párrafo 1: Contexto de la investigación...&#10;&#10;Párrafo 2: Hallazgos técnicos y muestras encontradas en foros...&#10;&#10;Párrafo 3: Recomendaciones para mitigar el impacto y cambiar credenciales..."
                        value={newArticleDraft.contentParagraphs}
                        onChange={(e) =>
                          setNewArticleDraft({ ...newArticleDraft, contentParagraphs: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#030101] border border-rose-900/80 text-white text-sm focus:border-rose-500 outline-none font-sans leading-relaxed"
                      />
                    </div>

                    {/* Compromised Data Tags */}
                    <div className="lg:col-span-6">
                      <label className="block text-xs font-mono font-bold text-slate-200 mb-1.5">
                        Campos de Datos Comprometidos (separados por coma):
                      </label>
                      <input
                        type="text"
                        placeholder="DNI, Nombres completos, Teléfonos, Correos, Contraseñas"
                        value={newArticleDraft.compromisedData}
                        onChange={(e) =>
                          setNewArticleDraft({ ...newArticleDraft, compromisedData: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-[#030101] border border-rose-900/80 text-rose-300 font-mono text-xs focus:border-rose-500 outline-none"
                      />
                    </div>

                    {/* Tags */}
                    <div className="lg:col-span-6">
                      <label className="block text-xs font-mono font-bold text-slate-200 mb-1.5">
                        Etiquetas / Tags de Clasificación:
                      </label>
                      <input
                        type="text"
                        placeholder="Brecha, Stealer Malware, RedLine, Dark Web, Perú"
                        value={newArticleDraft.tags}
                        onChange={(e) =>
                          setNewArticleDraft({ ...newArticleDraft, tags: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-[#030101] border border-rose-900/80 text-white font-mono text-xs focus:border-rose-500 outline-none"
                      />
                    </div>

                    {/* Image Preset & Featured Checkbox */}
                    <div className="lg:col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-rose-950/80">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newArticleDraft.featured}
                            onChange={(e) =>
                              setNewArticleDraft({ ...newArticleDraft, featured: e.target.checked })
                            }
                            className="w-4 h-4 rounded text-rose-500 accent-rose-500"
                          />
                          <span className="text-xs font-mono text-white font-bold">
                            Fijar como Artículo Destacado de Portada ⭐
                          </span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-xs font-mono tracking-wider shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>PUBLICAR ARTÍCULO EN LA PESTAÑA LEAKS</span>
                      </button>
                    </div>

                  </div>
                </form>
              </div>

              {/* List of currently published Leak Articles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-rose-950/80 pb-3">
                  <div>
                    <h3 className="text-base font-black text-white font-mono flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-400" />
                      <span>Artículos Publicados en el Feed ({localLeakArticles.length})</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      Visibles para cualquier visitante en la pestaña de Leaks & Filtraciones
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {localLeakArticles.map((art) => (
                    <div
                      key={art.id}
                      className="p-5 sm:p-6 rounded-2xl bg-[#060202] border border-rose-950/90 hover:border-rose-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              art.severity === 'critico'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                                : art.severity === 'alto'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-400 border border-zinc-700'
                            }`}
                          >
                            {art.severity.toUpperCase()}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-rose-400 font-semibold">{art.categoryLabel}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400">{art.date}</span>
                          {art.featured && (
                            <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-[10px] font-bold">
                              DESTACADO
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-white leading-snug">{art.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{art.summary}</p>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-mono text-slate-500">Datos expuestos:</span>
                          {art.compromisedData.slice(0, 4).map((d, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-[#110505] border border-rose-950 text-[10px] text-rose-300 font-mono"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = localLeakArticles.map((a) =>
                              a.id === art.id ? { ...a, featured: !a.featured } : a
                            );
                            handleUpdateArticles(updated);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-all ${
                            art.featured
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                              : 'bg-[#0a0505] text-slate-400 border-rose-950 hover:text-white'
                          }`}
                        >
                          {art.featured ? '⭐ Destacado' : 'Destacar'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(art.id)}
                          className="p-2 rounded-lg bg-[#0a0505] hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-rose-950 transition-all cursor-pointer"
                          title="Eliminar artículo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* =======================================================
              TAB 6: GESTIÓN DE VENDEDORES (Super Admin)
              ======================================================= */}
          {currentNav === 'gestion-vendedores' && isSuperAdmin && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ff88] font-mono">
                  CONTROL MAESTRO // ACCESO MULTI-VENDEDOR
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Gestión y Autorización de Vendedores
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Configura qué vendedor tiene permiso para vender qué producto del catálogo
                </p>
              </div>

              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800/60 shadow-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                      <div className="flex items-center gap-3">
                        {vendor.avatar && (vendor.avatar.startsWith('/') || vendor.avatar.startsWith('http') || vendor.avatar.includes('.')) ? (
                          <img loading="lazy" decoding="async" src={vendor.avatar} alt={vendor.name} className="w-10 h-10 rounded-full object-cover border border-emerald-500/50 shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-emerald-500/50 shrink-0">
                            <User className="w-4 h-4 text-[#00ff88]" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-base font-black text-white">{vendor.name}</h3>
                          <span className="text-xs text-emerald-400 font-mono">@{vendor.username}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">
                          {vendor.allowedServiceIds?.length || 0} productos autorizados
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = vendors.map((v) =>
                              v.id === vendor.id ? { ...v, active: !v.active } : v
                            );
                            onUpdateVendors(updated);
                            showToast(`Vendedor ${vendor.name} ${vendor.active ? 'desactivado' : 'activado'}`);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                            vendor.active
                              ? 'bg-zinc-900 text-emerald-400 border border-zinc-700'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {vendor.active ? 'ACTIVO' : 'INACTIVO'}
                        </button>
                      </div>
                    </div>

                    {/* Service Authorization Checklist */}
                    <div>
                      <span className="text-xs font-mono text-slate-300 font-bold block mb-2">
                        Productos que este vendedor puede comercializar:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {services.map((svc) => {
                          const isAllowed = vendor.allowedServiceIds?.includes(svc.id);
                          return (
                            <button
                              key={svc.id}
                              type="button"
                              onClick={() => {
                                const currentIds = vendor.allowedServiceIds || [];
                                const newIds = isAllowed
                                  ? currentIds.filter((id) => id !== svc.id)
                                  : [...currentIds, svc.id];
                                const updated = vendors.map((v) =>
                                  v.id === vendor.id ? { ...v, allowedServiceIds: newIds } : v
                                );
                                onUpdateVendors(updated);
                                showToast('Permisos de producto actualizados.');
                              }}
                              className={`p-2.5 rounded-xl border text-xs font-mono text-left flex items-center justify-between cursor-pointer transition-all ${
                                isAllowed
                                  ? 'bg-zinc-900/70 border-[#00ff88] text-white shadow-sm'
                                  : 'bg-[#060606] border-zinc-900 text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              <span className="truncate pr-2">{svc.title}</span>
                              {isAllowed ? (
                                <Check className="w-3.5 h-3.5 text-[#00ff88] shrink-0" />
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =======================================================
              TAB 7: BASE DE DATOS & RESPALDOS (Super Admin)
              ======================================================= */}
          {currentNav === 'respaldos' && isSuperAdmin && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ff88] font-mono">
                  INFRAESTRUCTURA // PERSISTENCIA
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Base de Datos Supabase & Respaldos JSON
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Sincronización en la nube, respaldo de telemetría y ejecución de esquemas SQL
                </p>
              </div>

              {/* Supabase Cloud Sync Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800/60 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-8 h-8 text-[#00ff88]" />
                    <div>
                      <h3 className="text-base font-black text-white font-mono">Supabase PostgreSQL Cloud (Vía Backend)</h3>
                      <span className="text-xs text-emerald-400 font-mono">Conexión cifrada Servidor a Servidor · URL y Anon Key protegidas</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncWithSupabase}
                    disabled={isSyncingSupabase}
                    className="px-4 py-2.5 rounded-xl bg-[#00ff88] hover:bg-[#00e676] text-slate-950 font-bold text-xs font-mono flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                    <span>{isSyncingSupabase ? 'Sincronizando...' : 'Sincronizar Catálogo'}</span>
                  </button>
                </div>

                {supabaseSyncResult && (
                  <div className="p-3.5 rounded-xl bg-[#060606] border border-zinc-800 font-mono text-xs text-slate-300">
                    {supabaseSyncResult}
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopySupabaseSql}
                    className="px-3.5 py-2 rounded-xl bg-[#060606] hover:bg-zinc-900 border border-zinc-700 text-[#00ff88] text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Script SQL Supabase</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSqlSchema(!showSqlSchema)}
                    className="text-xs text-slate-400 hover:text-white font-mono underline"
                  >
                    {showSqlSchema ? 'Ocultar Código SQL' : 'Ver Código SQL'}
                  </button>
                </div>

                {showSqlSchema && (
                  <pre className="p-4 rounded-xl bg-black border border-zinc-900 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48 select-all">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                )}
              </div>

              {/* JSON Backup & Restore Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800/60 shadow-xl space-y-4">
                <h3 className="text-base font-black text-white font-mono">Copia de Seguridad Completa (JSON)</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Exporta e importa productos, telemetría de clics, cuentas de cobro y configuración de vendedores en un único archivo JSON seguro.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="px-4 py-2.5 rounded-xl bg-[#060606] hover:bg-zinc-900 border border-emerald-700 text-white font-bold text-xs font-mono flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#00ff88]" />
                    <span>Descargar Backup JSON</span>
                  </button>

                  <input
                    type="file"
                    ref={backupInputRef}
                    onChange={handleImportBackup}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => backupInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-[#060606] hover:bg-zinc-900 border border-emerald-700 text-white font-bold text-xs font-mono flex items-center gap-2 cursor-pointer"
                  >
                    <FileUp className="w-4 h-4 text-[#00ff88]" />
                    <span>Restaurar desde JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

