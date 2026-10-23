import React, { useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
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
import type { AuthUser } from '../lib/api';
import { panelLogin, panelCheckSession, panelLogout, PANEL_AUTH_MODE } from '../lib/panelAuth';
import { CONTENT_URL, publicHeaders } from '../lib/contentEnv';
import { useRemoteStatus } from '../lib/remoteStatus';
import { PasswordChange } from '../components/PasswordChange';
import { TeamBuyersTab } from '../components/TeamBuyersTab';
import { isStaffAdmin, roleLabel, type StaffRole } from '../lib/roles';
import { setAdminHint } from '../lib/adminHint';
import { PanelLogin } from '../components/PanelLogin';
import { PanelHeader, type SaveState } from '../components/panel/PanelHeader';
import { PanelSidebar } from '../components/panel/PanelSidebar';
import { CommandPalette, type PaletteItem } from '../components/panel/CommandPalette';
import { DashboardHome } from '../components/panel/DashboardHome';
import { ProductsTable, type ProductSalesStat } from '../components/panel/ProductsTable';
import { ProductEditor } from '../components/panel/ProductEditor';
import { PaymentsPage } from '../components/panel/PaymentsPage';
import { ArticlesPage } from '../components/panel/ArticlesPage';
import { TrafficPage } from '../components/panel/TrafficPage';
import { PRODUCT_PRESETS } from '../components/panel/productPresets';
import { ConfirmDialog } from '../components/panel/Dialog';
import { buildNav, type PanelNavId } from '../components/panel/panelNav';
import type { ProductFilter } from '../components/panel/panelHealth';
import { ensureSalesLoaded, resetSales, useSales } from '../lib/salesStore';
import { deleteNote, probeTrash, useTrashReady } from '../lib/vaultApi';
import { ensureSupportLoaded, resetSupport, useSupport } from '../lib/supportStore';
import { resetCosts } from '../lib/costsStore';
import { isPending as isCasePending } from '../lib/supportLogic';
import { ensureComplaintsLoaded, resetComplaints, useComplaints } from '../lib/complaintsStore';
import { isPending as isComplaintPending } from '../lib/complaintsLogic';
import { latestSubscriptions, money, subscriptionInfo } from '../lib/salesMath';
import type { SaleDraft, SalesCtx, SalesIntent } from '../components/panel/sales/shared';

// Ventas, clientes, renovaciones y reportes se descargan solo cuando se abren
const SalesPage = lazy(() => import('../components/panel/sales/SalesPage'));
const CustomersPage = lazy(() => import('../components/panel/sales/CustomersPage'));
const RenewalsPage = lazy(() => import('../components/panel/sales/RenewalsPage'));
const ReportsPage = lazy(() => import('../components/panel/sales/ReportsPage'));
const GainsPage = lazy(() => import('../components/panel/sales/GainsPage'));
const SupportPage = lazy(() => import('../components/panel/sales/SupportPage'));
const MessagesPage = lazy(() => import('../components/panel/sales/MessagesPage'));
const ComplaintsAdminPage = lazy(() => import('../components/panel/ComplaintsAdminPage'));
const TrashPage = lazy(() => import('../components/panel/TrashPage'));
const HistoryPage = lazy(() => import('../components/panel/HistoryPage'));
const BackupPage = lazy(() => import('../components/panel/BackupPage'));
const PanelPageFallback: React.FC = () => (
  <div className="mx-auto max-w-7xl py-16 text-center text-sm text-zinc-400" role="status" aria-busy="true">
    Cargando…
  </div>
);

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
  /** Se llama al iniciar sesión (o restaurarla) para recargar el contenido con la cuenta del staff */
  onStaffSession?: () => void | Promise<void>;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onBackToStore,
  vendors,
  onUpdateVendors,
  services,
  onUpdateServices,
  paymentMethods,
  onUpdatePaymentMethods,
  leakArticles = [],
  onUpdateLeakArticles,
  onStaffSession
}) => {
  // Tienda de la cuenta que entró (sale de su fila en la tabla staff; no se puede cambiar de perfil)
  const [currentUserId, setCurrentUserId] = useState<string>('vendedor-central');

  // Sesión: la fuente de verdad es la cookie del servidor (se consulta al abrir el panel)
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const isAuthenticated = sessionUser !== null;

  // Sección abierta del panel (se empieza por el Resumen)
  const [currentNav, setCurrentNav] = useState<PanelNavId>('resumen');

  // Menú lateral (contraído o no), menú en celular, buscador rápido (Ctrl+K) y filtro con el que se abre la lista de productos
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dp-panel-sidebar') === 'collapsed';
    } catch {
      return false;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);
  const [productFilter, setProductFilter] = useState<{ value: ProductFilter; seq: number }>({ value: 'all', seq: 0 });
  const [saveShown, setSaveShown] = useState<SaveState>('idle');
  // Ventas y clientes: solo existen cuando el panel trabaja con la base de datos
  const salesEnabled = PANEL_AUTH_MODE === 'supabase';
  const salesState = useSales();
  const [salesIntent, setSalesIntent] = useState<SalesIntent>(null);

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

  const handleUpdateArticles = (updated: LeakArticle[], message = 'Artículos de Leaks actualizados.') => {
    setLocalLeakArticles(updated);
    saveStoredLeakArticles(updated);
    if (onUpdateLeakArticles) {
      onUpdateLeakArticles(updated);
    }
    showToast(message);
  };

  // Producto que se edita (null = producto nuevo) y si se abrió como copia
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editorCopy, setEditorCopy] = useState<boolean>(false);
  // El editor avisa si tiene cambios sin guardar; antes de salir de él se pregunta
  const editorDirty = useRef<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [deleteRequest, setDeleteRequest] = useState<string[] | null>(null);

  // Search in products
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string>('');

  // Supabase cloud sync state
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);
  const [supabaseSyncResult, setSupabaseSyncResult] = useState<string>('');
  const [showSqlSchema, setShowSqlSchema] = useState<boolean>(false);

  // Refs for uploads
  const backupInputRef = useRef<HTMLInputElement | null>(null);

  const [newFeatureText, setNewFeatureText] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const currentUser = vendors.find((v) => v.id === currentUserId) || vendors[0];
  // DEV y ADMIN gestionan todas las tiendas (igual que la base de datos); el vendedor solo la suya
  const isSuperAdmin = isStaffAdmin(sessionUser?.role);

  // Allowed products for this user
  const userAllowedServices = isSuperAdmin
    ? services
    : services.filter((s) => currentUser?.allowedServiceIds?.includes(s.id));

  // Al abrir el panel se pregunta al servidor si hay una sesión vigente
  useEffect(() => {
    let cancelled = false;
    panelCheckSession().then((user) => {
      if (cancelled) return;
      if (user) {
        setSessionUser(user);
        onStaffSession?.();
        setAdminHint(isStaffAdmin(user.role));
        if (user.id && user.id !== 'admin-master') setCurrentUserId(user.id);
      } else {
        setAdminHint(false);
      }
      setAuthChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Estado real del servidor, medido con /api/health
  const [serverStatus, setServerStatus] = useState<{ ok: boolean; ms: number | null }>({ ok: false, ms: null });
  useEffect(() => {
    if (!isAuthenticated) return;
    let stop = false;
    const ping = async () => {
      const t0 = performance.now();
      try {
        if (PANEL_AUTH_MODE === 'supabase') {
          const res = await fetch(`${CONTENT_URL}/rest/v1/leaks?select=id&limit=1`, { cache: 'no-store', headers: publicHeaders() });
          if (!stop) setServerStatus({ ok: res.ok, ms: Math.round(performance.now() - t0) });
        } else {
          const res = await fetch('/api/health', { cache: 'no-store', headers: { Accept: 'application/json' } });
          const json = await res.json();
          if (!stop) setServerStatus({ ok: res.ok && json.status === 'ok', ms: Math.round(performance.now() - t0) });
        }
      } catch {
        if (!stop) setServerStatus({ ok: false, ms: null });
      }
    };
    ping();
    const timer = setInterval(ping, 30000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [isAuthenticated]);

  // Resultado del último guardado en la base de datos: se muestra como aviso y en la barra de estado
  const remoteStatus = useRemoteStatus();
  useEffect(() => {
    if (remoteStatus.state === 'saved' || remoteStatus.state === 'error') showToast(remoteStatus.message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteStatus.at]);

  // Inicio de sesión contra el servidor. Devuelve el mensaje de error, o null si entró.
  const handleLogin = async (username: string, pin: string, captchaToken?: string): Promise<string | null> => {
    const res = await panelLogin(username, pin, captchaToken);
    if (!res.success || !res.user) {
      return res.error || 'Usuario o clave incorrectos.';
    }
    setSessionUser(res.user);
    onStaffSession?.();
    setAdminHint(isStaffAdmin(res.user.role));
    if (res.user.id && res.user.id !== 'admin-master') setCurrentUserId(res.user.id);
    showToast(`¡Conexión establecida! Bienvenido, ${res.user.name}`);
    return null;
  };

  const handleLogout = async () => {
    await panelLogout();
    setAdminHint(false);
    setSessionUser(null);
    // La próxima persona que entre empieza en el Resumen, no en la sección que dejó abierta quien salió
    setCurrentNav('resumen');
    setEditingServiceId(null);
    setPaletteOpen(false);
    setMobileMenuOpen(false);
    setSalesIntent(null);
    resetSales(); // lo que vio una persona no debe quedar a la vista de la siguiente
  };

  // Cambiar de perfil (tienda) para trabajar en ella: solo el rol DEV. Al volver a entrar se empieza en la tienda propia.
  const canSwitchStore = sessionUser?.role === 'dev';
  const handleSwitchUser = (vendorId: string) => {
    if (!canSwitchStore) return;
    setCurrentUserId(vendorId);
    setEditingServiceId(null);
    setCurrentNav('resumen');
    showToast(`Ahora trabajas en: ${vendors.find((v) => v.id === vendorId)?.name}`);
  };

  // Rol real de la cuenta de cada tienda (lo lee solo el DEV): para que la lista de perfiles diga DEV / ADMIN / VENDEDOR
  const [roleByStore, setRoleByStore] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!canSwitchStore || PANEL_AUTH_MODE !== 'supabase') return;
    let cancelled = false;
    void import('../lib/supabaseBrowser')
      .then((m) => m.readTeamAndBuyers())
      .then((res) => {
        if (cancelled) return;
        const rank = { dev: 3, admin: 2, vendor: 1 } as const;
        const map: Record<string, StaffRole> = {};
        for (const t of res.team) {
          if (t.vendorId && (!map[t.vendorId] || rank[t.role] > rank[map[t.vendorId]])) map[t.vendorId] = t.role;
        }
        setRoleByStore(Object.fromEntries(Object.entries(map).map(([id, r]) => [id, roleLabel(r)])));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [canSwitchStore]);

  // Update Vendor Profile
  const handleUpdateCurrentVendor = (updates: Partial<Vendor>) => {
    const updated = vendors.map((v) => (v.id === currentUser.id ? { ...v, ...updates } : v));
    onUpdateVendors(updated);
    showToast('Datos de perfil y credenciales guardados.');
  };

  // Guarda los datos de cobro de la tienda activa (celulares, cuentas, QR) y las etiquetas "aceptamos…" que ve el cliente
  const handleSaveVendorPayments = (paymentConfig: VendorPaymentConfig, labels: string[]) => {
    onUpdateVendors(vendors.map((v) => (v.id === currentUser.id ? { ...v, paymentConfig, paymentMethods: labels } : v)));
    showToast('Métodos de pago guardados.');
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

  // ---------- Panel: navegación, edición, acciones en bloque y buscador rápido ----------
  // Si el editor de producto tiene cambios sin guardar, antes de irse a otra pantalla se pregunta
  const guardLeaving = (go: () => void) => {
    if (editorDirty.current && (currentNav === 'subir-producto' || currentNav === 'leaks-articulos')) setPendingAction(() => go);
    else go();
  };

  // Abre una sección. Para empezar un producto nuevo se abre 'subir-producto' sin producto elegido.
  const navigateTo = (id: PanelNavId, filter: ProductFilter = 'all') =>
    guardLeaving(() => {
      if (id === 'productos') setProductFilter((p) => ({ value: filter, seq: p.seq + 1 }));
      setEditingServiceId(null);
      setEditorCopy(false);
      setCurrentNav(id);
      window.scrollTo({ top: 0 });
    });

  const startEditService = (service: ServiceItem, copy = false) =>
    guardLeaving(() => {
      setEditingServiceId(service.id);
      setEditorCopy(copy);
      setCurrentNav('subir-producto');
      window.scrollTo({ top: 0 });
    });

  // Guarda un producto del editor: si ya existía se actualiza en su lugar; si es nuevo se agrega y se asigna a la tienda
  const handleSaveProduct = (service: ServiceItem, isNew: boolean) => {
    if (isNew) {
      onUpdateServices([service, ...services]);
      // Se autoriza a la tienda y a Central para vender el producto nuevo
      onUpdateVendors(
        vendors.map((v) => (v.id === currentUser.id || v.id === 'vendedor-central' ? { ...v, allowedServiceIds: Array.from(new Set([...v.allowedServiceIds, service.id])) } : v))
      );
      showToast(`Producto "${service.title}" creado y asignado a tu tienda.`);
    } else {
      onUpdateServices(services.map((s) => (s.id === service.id ? service : s)));
      showToast(`Cambios guardados en "${service.title}".`);
    }
    editorDirty.current = false;
    setEditingServiceId(null);
    setEditorCopy(false);
    setCurrentNav('productos');
    window.scrollTo({ top: 0 });
  };

  // Un solo guardado para varios productos: así los cambios no se pisan entre sí
  const handleBulkUpdateServices = (ids: string[], updates: Partial<ServiceItem>) => {
    if (!ids.length) return;
    const set = new Set(ids);
    onUpdateServices(services.map((s) => (set.has(s.id) ? { ...s, ...updates } : s)));
    showToast(ids.length === 1 ? 'Producto actualizado.' : `${ids.length} productos actualizados.`);
  };

  const performDeleteServices = (ids: string[]) => {
    if (!ids.length) return;
    if (services.length - ids.length < 1) {
      showToast('Debe quedar al menos un producto en la tienda.');
      return;
    }
    const set = new Set(ids);
    onUpdateServices(services.filter((s) => !set.has(s.id)));
    editorDirty.current = false;
    if (currentNav === 'subir-producto') {
      setEditingServiceId(null);
      setEditorCopy(false);
      setCurrentNav('productos');
    }
    showToast(`${ids.length === 1 ? 'Producto eliminado.' : `${ids.length} productos eliminados.`}${trashReady ? ' Está en la Papelera.' : ''}`);
  };

  // Desde la lista se pregunta antes de borrar (el editor ya tiene su propia pregunta)
  const handleDeleteServices = (ids: string[]) => {
    if (!ids.length) return;
    if (services.length - ids.length < 1) {
      showToast('Debe quedar al menos un producto en la tienda.');
      return;
    }
    setDeleteRequest(ids);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((c) => {
      try {
        localStorage.setItem('dp-panel-sidebar', c ? 'open' : 'collapsed');
      } catch {
        /* sin almacenamiento: el menú igual funciona */
      }
      return !c;
    });
  };

  // Ctrl+K (o ⌘K) abre y cierra el buscador rápido
  useEffect(() => {
    if (!isAuthenticated) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAuthenticated]);

  // "Guardado" se muestra unos segundos y luego vuelve a mostrarse el estado de la conexión
  useEffect(() => {
    setSaveShown(remoteStatus.state);
    if (remoteStatus.state === 'idle' || remoteStatus.state === 'saving') return;
    const t = setTimeout(() => setSaveShown('idle'), remoteStatus.state === 'error' ? 8000 : 3500);
    return () => clearTimeout(t);
  }, [remoteStatus.state, remoteStatus.at]);

  // Ventas: se cargan al entrar y se olvidan al salir (aunque la sesión termine por otra vía)
  useEffect(() => {
    if (!salesEnabled) return;
    if (isAuthenticated) {
      void ensureSalesLoaded();
      void ensureSupportLoaded(); // para el número de casos pendientes del menú
    } else {
      resetSales();
      resetSupport();
      resetCosts();
    }
  }, [salesEnabled, isAuthenticated]);
  const supportState = useSupport();

  // Libro de Reclamaciones: solo lo ve la administración. Se carga al entrar (para el número del menú) y se olvida al salir.
  useEffect(() => {
    if (!salesEnabled) return;
    if (isAuthenticated && isSuperAdmin) void ensureComplaintsLoaded();
    else resetComplaints();
  }, [salesEnabled, isAuthenticated, isSuperAdmin]);
  const complaintsState = useComplaints();

  // Papelera: se comprueba una vez al entrar si ya está instalada, para que los avisos de "eliminar" digan la verdad
  const trashReady = useTrashReady();
  useEffect(() => {
    if (salesEnabled && isAuthenticated) void probeTrash();
  }, [salesEnabled, isAuthenticated]);
  // Después de restaurar algo (papelera o copia) se vuelve a leer el contenido para que aparezca sin recargar la página
  const reloadAfterRestore = async (table?: string) => {
    await onStaffSession?.();
    if (!table || table === 'sales' || table === 'customers') await ensureSalesLoaded(true);
  };

  const isDevSession = sessionUser?.role === 'dev' && PANEL_AUTH_MODE === 'supabase';
  const salesScoped = salesState.status === 'ready' ? (isSuperAdmin ? salesState.sales : salesState.sales.filter((s) => s.vendorId === currentUser?.id)) : [];
  const renewalsDue = salesEnabled ? latestSubscriptions(salesScoped).filter((s) => subscriptionInfo(s)?.state === 'expiring').length : 0;
  // Unidades e ingresos por producto (solo ventas pagadas); null si las ventas no están disponibles
  const salesByProduct = useMemo<Map<string, ProductSalesStat> | null>(() => {
    if (!salesEnabled || salesState.status !== 'ready') return null;
    const map = new Map<string, ProductSalesStat>();
    for (const s of salesScoped) {
      if (s.status !== 'paid' || !s.productId) continue;
      const cur = map.get(s.productId) || { units: 0, revenue: 0 };
      map.set(s.productId, { units: cur.units + 1, revenue: Math.round((cur.revenue + s.amount) * 100) / 100 });
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesEnabled, salesState.status, salesState.status === 'ready' ? salesState.sales : null, isSuperAdmin, currentUser?.id]);
  const supportPending =
    salesEnabled && supportState.status === 'ready' ? supportState.cases.filter((c) => isCasePending(c) && (isSuperAdmin || c.vendorId === currentUser?.id)).length : 0;
  const complaintsPending = salesEnabled && isSuperAdmin && complaintsState.status === 'ready' ? complaintsState.items.filter(isComplaintPending).length : 0;
  const navGroups = buildNav({ products: userAllowedServices.length, articles: localLeakArticles.length, salesEnabled, renewalsDue, supportPending, complaintsPending, isSuperAdmin, isDev: isDevSession });

  const openNewSale = (draft?: SaleDraft) => {
    setSalesIntent({ kind: 'new-sale', draft, seq: Date.now() });
    setEditingServiceId(null);
    setCurrentNav('ventas');
    window.scrollTo({ top: 0 });
  };
  const openCustomer = (id: string) => {
    setSalesIntent({ kind: 'customer', id, seq: Date.now() });
    setEditingServiceId(null);
    setCurrentNav('clientes');
    window.scrollTo({ top: 0 });
  };
  const salesCtx: SalesCtx = {
    vendors,
    currentVendor: currentUser,
    isSuperAdmin,
    isStaffAdmin: isStaffAdmin(sessionUser?.role),
    services: userAllowedServices,
    paymentMethods,
    onToast: showToast
  };

  // Los resultados del buscador solo se arman mientras está abierto
  const paletteItems: PaletteItem[] = paletteOpen
    ? [
        ...navGroups.flatMap((g) =>
          g.items.map((it) => ({ id: `nav-${it.id}`, group: 'Ir a', label: it.label, icon: it.icon, run: () => navigateTo(it.id) }))
        ),
        { id: 'act-nuevo', group: 'Acciones', label: 'Crear un producto nuevo', icon: Plus, keywords: 'agregar añadir subir nuevo producto', run: () => navigateTo('subir-producto') },
        ...(salesEnabled
          ? [{ id: 'act-venta', group: 'Acciones', label: 'Registrar una venta', icon: Plus, keywords: 'venta vender cobrar cliente nueva anotar', run: () => openNewSale() }]
          : []),
        { id: 'act-tienda', group: 'Acciones', label: 'Ver la tienda pública', icon: ShoppingBag, keywords: 'web clientes', run: onBackToStore },
        { id: 'act-salir', group: 'Acciones', label: 'Cerrar sesión', icon: LogOut, keywords: 'salir', run: handleLogout },
        ...userAllowedServices.map((s) => ({
          id: `prod-${s.id}`,
          group: 'Productos',
          label: s.title,
          hint: 'Editar producto',
          icon: Package,
          keywords: `${s.categoryLabel} ${s.badge || ''}`,
          run: () => startEditService(s)
        })),
        ...(canSwitchStore
          ? vendors.map((v) => ({
              id: `tienda-${v.id}`,
              group: 'Perfiles',
              label: `Trabajar en ${v.name}`,
              hint: `@${v.username}`,
              icon: Users,
              keywords: 'cambiar perfil tienda vendedor',
              run: () => handleSwitchUser(v.id)
            }))
          : []),
        ...(salesEnabled && salesState.status === 'ready'
          ? salesState.customers
              .filter((c) => isSuperAdmin || c.vendorId === currentUser?.id)
              .slice(0, 300)
              .map((c) => ({
                id: `cli-${c.id}`,
                group: 'Clientes',
                label: c.name,
                hint: [c.telegram, c.whatsapp].filter(Boolean).join(' · ') || 'Ver ficha',
                icon: Users,
                keywords: `cliente ${c.email || ''}`,
                run: () => openCustomer(c.id)
              }))
          : []),
        ...localLeakArticles.map((a) => ({
          id: `leak-${a.id}`,
          group: 'Artículos',
          label: a.title,
          hint: a.categoryLabel,
          icon: ShieldAlert,
          keywords: 'leak revista artículo',
          run: () => navigateTo('leaks-articulos')
        }))
      ]
    : [];

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
      version: '4.0',
      timestamp: new Date().toISOString(),
      vendors,
      services,
      paymentMethods
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `descuentos-peru-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad descargada.');
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
          showToast('¡Copia de seguridad importada con éxito!');
        } catch {
          alert('Archivo de respaldo no válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  // ==========================================
  // VISTA: ACCESO (usuario + clave contra el servidor)
  // ==========================================
  if (!authChecked) {
    return <div className="min-h-screen bg-[#050505]" aria-busy="true" />;
  }
  if (!isAuthenticated) {
    return <PanelLogin onLogin={handleLogin} onBackToStore={onBackToStore} mode={PANEL_AUTH_MODE} />;
  }

  // ==========================================
  // VISTA: PANEL COMPLETO
  // ==========================================
  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col font-sans selection:bg-[#00ff88] selection:text-black">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed top-16 right-3 sm:right-5 z-[70] max-w-[calc(100vw-1.5rem)] flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111114]/95 border border-emerald-400/50 text-white text-[13px] font-medium shadow-2xl backdrop-blur-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00ff88]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />

      <ConfirmDialog
        open={pendingAction !== null}
        title="Tienes cambios sin guardar"
        message="Si te vas a otra pantalla, lo que cambiaste se pierde."
        confirmLabel="Salir sin guardar"
        danger
        onConfirm={() => {
          const go = pendingAction;
          editorDirty.current = false;
          setPendingAction(null);
          go?.();
        }}
        onCancel={() => setPendingAction(null)}
      />
      <ConfirmDialog
        open={deleteRequest !== null}
        title={deleteRequest && deleteRequest.length > 1 ? `¿Eliminar ${deleteRequest.length} productos?` : '¿Eliminar este producto?'}
        message={
          deleteRequest && deleteRequest.length === 1
            ? `“${services.find((s) => s.id === deleteRequest[0])?.title ?? ''}” dejará de verse en la tienda. ${deleteNote(trashReady)}`
            : `Dejarán de verse en la tienda. ${deleteNote(trashReady)}`
        }
        confirmLabel="Eliminar"
        danger
        onConfirm={() => {
          if (deleteRequest) performDeleteServices(deleteRequest);
          setDeleteRequest(null);
        }}
        onCancel={() => setDeleteRequest(null)}
      />

      <button
        type="button"
        onClick={() => document.getElementById('contenido-panel')?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-lg focus:bg-[#00ff88] focus:px-3 focus:py-2 focus:text-xs focus:font-bold focus:text-zinc-950"
      >
        Saltar al contenido
      </button>

      <PanelHeader
        userName={sessionUser?.name || currentUser.name}
        username={sessionUser?.username || currentUser.username}
        avatar={vendors.find((v) => v.id === sessionUser?.id)?.avatar || currentUser.avatar}
        roleText={roleLabel(sessionUser?.role)}
        vendors={vendors}
        currentVendorId={currentUser.id}
        roleByStore={roleByStore}
        canSwitchStore={canSwitchStore}
        onSwitchStore={handleSwitchUser}
        onOpenSearch={() => setPaletteOpen(true)}
        onOpenMenu={() => setMobileMenuOpen(true)}
        onBackToStore={onBackToStore}
        onLogout={handleLogout}
        onOpenProfile={() => navigateTo('perfil')}
        connection={{ ok: serverStatus.ok, ms: serverStatus.ms, label: PANEL_AUTH_MODE === 'supabase' ? 'Base de datos' : 'Servidor' }}
        saveState={saveShown}
      />

      <div className="flex min-w-0 flex-1 flex-col md:flex-row">
        <PanelSidebar
          groups={navGroups}
          current={currentNav}
          onNavigate={navigateTo}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebar}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* MAIN APPLICATION VIEW AREA */}
        <main id="contenido-panel" tabIndex={-1} className="min-w-0 flex-1 bg-[#09090b] p-4 outline-none sm:p-6 lg:p-8">
          
          {/* =======================================================
              TAB 1: TELEMETRÍA, TRÁFICO EN VIVO & CLICS (User Requested)
              ======================================================= */}
          {currentNav === 'telemetria' && (
            <TrafficPage
              vendors={vendors}
              services={userAllowedServices}
              isSuperAdmin={isSuperAdmin}
              isStaffAdmin={isStaffAdmin(sessionUser?.role)}
              currentVendorId={currentUser.id}
              dbMode={PANEL_AUTH_MODE === 'supabase'}
            />
          )}

          {/* =======================================================
              TAB 2: PRODUCTOS / CATÁLOGO
              ======================================================= */}
          {currentNav === 'resumen' && (
            <DashboardHome
              userName={sessionUser?.name || currentUser.name}
              services={userAllowedServices}
              vendors={vendors}
              currentVendor={currentUser}
              paymentMethods={paymentMethods}
              leakArticles={localLeakArticles}
              serverOk={serverStatus.ok}
              isSuperAdmin={isSuperAdmin}
              showBuyers={isDevSession}
              onNavigate={navigateTo}
              onNewProduct={() => navigateTo('subir-producto')}
              onOpenStore={onBackToStore}
              onSwitchStore={canSwitchStore ? handleSwitchUser : undefined}
              salesEnabled={salesEnabled}
              sales={salesState}
              onNewSale={() => openNewSale()}
            />
          )}

          {salesEnabled && currentNav === 'ventas' && (
            <Suspense fallback={<PanelPageFallback />}>
              <SalesPage ctx={salesCtx} intent={salesIntent} onIntentHandled={() => setSalesIntent(null)} />
            </Suspense>
          )}
          {salesEnabled && currentNav === 'clientes' && (
            <Suspense fallback={<PanelPageFallback />}>
              <CustomersPage ctx={salesCtx} intent={salesIntent} onIntentHandled={() => setSalesIntent(null)} />
            </Suspense>
          )}
          {salesEnabled && currentNav === 'renovaciones' && (
            <Suspense fallback={<PanelPageFallback />}>
              <RenewalsPage ctx={salesCtx} />
            </Suspense>
          )}
          {salesEnabled && currentNav === 'reportes' && (
            <Suspense fallback={<PanelPageFallback />}>
              <ReportsPage ctx={salesCtx} />
            </Suspense>
          )}
          {salesEnabled && currentNav === 'ganancias' && (
            <Suspense fallback={<PanelPageFallback />}>
              <GainsPage ctx={salesCtx} />
            </Suspense>
          )}
          {salesEnabled && currentNav === 'garantias' && (
            <Suspense fallback={<PanelPageFallback />}>
              <SupportPage ctx={salesCtx} />
            </Suspense>
          )}
          {salesEnabled && currentNav === 'mensajes' && (
            <Suspense fallback={<PanelPageFallback />}>
              <MessagesPage ctx={salesCtx} />
            </Suspense>
          )}
          {salesEnabled && isSuperAdmin && currentNav === 'reclamaciones' && (
            <Suspense fallback={<PanelPageFallback />}>
              <ComplaintsAdminPage onToast={showToast} />
            </Suspense>
          )}

          {currentNav === 'productos' && (
            <ProductsTable
              key={productFilter.seq}
              services={userAllowedServices}
              vendors={vendors}
              showStores={isSuperAdmin}
              canDelete={isSuperAdmin}
              initialFilter={productFilter.value}
              salesByProduct={salesByProduct}
              formatMoney={money}
              onNew={() => navigateTo('subir-producto')}
              onEdit={(s) => startEditService(s)}
              onDuplicate={(s) => startEditService(s, true)}
              onBulkUpdate={handleBulkUpdateServices}
              onDelete={handleDeleteServices}
            />
          )}

          {/* =======================================================
              TAB 3: PERSONALIZAR & SUBIR PRODUCTO (With Simulator)
              ======================================================= */}
          {currentNav === 'subir-producto' && (
            <ProductEditor
              key={`${editingServiceId ?? 'nuevo'}-${editorCopy ? 'copia' : 'edicion'}`}
              product={editingServiceId ? services.find((s) => s.id === editingServiceId) || null : null}
              startAsCopy={editorCopy}
              presets={PRODUCT_PRESETS}
              gallery={presets}
              ownerVendorId={currentUser.id}
              assignedVendorIds={[currentUser.id, 'vendedor-central']}
              existingTitles={services.map((s) => s.title)}
              canDelete={isSuperAdmin}
              onSave={handleSaveProduct}
              onCancel={() => {
                editorDirty.current = false;
                navigateTo('productos');
              }}
              onDelete={(id) => performDeleteServices([id])}
              onDirtyChange={(d) => {
                editorDirty.current = d;
              }}
            />
          )}

          {/* =======================================================
              TAB 4: MÉTODOS DE PAGO & COBRO
              ======================================================= */}
          {currentNav === 'pagos' && (
            <PaymentsPage
              vendor={currentUser}
              isSuperAdmin={isSuperAdmin}
              paymentMethods={paymentMethods}
              onSaveVendor={handleSaveVendorPayments}
              onUpdateMethods={onUpdatePaymentMethods}
              onToast={showToast}
            />
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

                  {PANEL_AUTH_MODE === 'supabase' ? (
                    <PasswordChange onDone={showToast} />
                  ) : (
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">PIN de Seguridad (Acceso):</label>
                      <input
                        type="password"
                        defaultValue={currentUser.pin || '1234'}
                        onBlur={(e) => handleUpdateCurrentVendor({ pin: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#060606] border border-zinc-800/80 text-[#00ff88] font-mono text-sm focus:border-[#00ff88] outline-none tracking-widest"
                      />
                    </div>
                  )}
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
            <ArticlesPage
              articles={localLeakArticles}
              authorName={sessionUser?.name || currentUser.name}
              authorTelegram={currentUser.username || ''}
              dbMode={PANEL_AUTH_MODE === 'supabase'}
              onUpdate={handleUpdateArticles}
              onViewPublic={() => {
                onBackToStore();
                window.location.hash = '#/leaks';
              }}
              onReset={() => handleUpdateArticles(INITIAL_LEAKS_ARTICLES, 'Artículos de ejemplo restaurados.')}
              onDirtyChange={(d) => {
                editorDirty.current = d;
              }}
            />
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
          {currentNav === 'equipo' && sessionUser?.role === 'dev' && PANEL_AUTH_MODE === 'supabase' && <TeamBuyersTab />}

          {salesEnabled && currentNav === 'papelera' && (
            <Suspense fallback={<PanelPageFallback />}>
              <TrashPage dbMode={salesEnabled} isStaffAdmin={isStaffAdmin(sessionUser?.role)} vendors={vendors} onRestored={(table) => reloadAfterRestore(table)} onToast={showToast} />
            </Suspense>
          )}
          {isDevSession && currentNav === 'historial' && (
            <Suspense fallback={<PanelPageFallback />}>
              <HistoryPage dbMode={salesEnabled} />
            </Suspense>
          )}
          {isDevSession && currentNav === 'copia-bd' && (
            <Suspense fallback={<PanelPageFallback />}>
              <BackupPage dbMode={salesEnabled} onRestored={() => reloadAfterRestore()} onToast={showToast} />
            </Suspense>
          )}

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

              {/* Base de datos: con Supabase conectado no hace falta sincronizar a mano */}
              {PANEL_AUTH_MODE === 'supabase' ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0a0a] border border-emerald-500/30 shadow-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <Database className="w-8 h-8 text-[#00ff88]" />
                    <div>
                      <h3 className="text-base font-black text-white font-mono">Base de datos conectada (Supabase)</h3>
                      <span className={`text-xs font-mono ${serverStatus.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {serverStatus.ok ? `En línea · ${serverStatus.ms} ms` : 'Sin conexión'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300 font-mono">
                    Productos, vendedores, métodos de pago y leaks se guardan automáticamente al editarlos, y las imágenes van a Storage.
                    No hace falta sincronizar a mano. Las cuentas del panel y los permisos se administran en Supabase (Authentication y tabla staff).
                  </p>
                </div>
              ) : (
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

              )}

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

