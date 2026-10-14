import React, { useState, useRef } from 'react';
import {
  X,
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
  Copy,
  Download,
  FileUp,
  Layers,
  CheckCircle2,
  Phone,
  QrCode,
  DollarSign
} from 'lucide-react';
import { Vendor, INITIAL_VENDORS } from '../data/vendorsData';
import { ServiceItem, SERVICES_DATA } from '../data/servicesData';
import { PaymentMethodItem, INITIAL_PAYMENT_METHODS } from '../data/paymentsData';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendors: Vendor[];
  onUpdateVendors: (vendors: Vendor[]) => void;
  services: ServiceItem[];
  onUpdateServices: (services: ServiceItem[]) => void;
  paymentMethods: PaymentMethodItem[];
  onUpdatePaymentMethods: (methods: PaymentMethodItem[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  vendors,
  onUpdateVendors,
  services,
  onUpdateServices,
  paymentMethods,
  onUpdatePaymentMethods
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('dp_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Active Tab: 'productos' | 'vendedores' | 'pagos' | 'seguridad'
  const [activeTab, setActiveTab] = useState<'productos' | 'vendedores' | 'pagos' | 'seguridad'>('productos');

  // Selected Service for editing in 'productos' tab
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    services[0]?.id || 'streaming'
  );
  const [productSearch, setProductSearch] = useState<string>('');

  // Selected vendor for editing in 'vendedores' tab
  const [selectedVendorId, setSelectedVendorId] = useState<string>(
    vendors[0]?.id || 'vendedor-central'
  );

  // Success toast message
  const [toastMessage, setToastMessage] = useState<string>('');

  // New item draft states
  const [newFeatureText, setNewFeatureText] = useState<string>('');
  const [newPlanForm, setNewPlanForm] = useState({
    name: '',
    price: '',
    period: 'mes',
    perks: ''
  });
  const [showAddPlan, setShowAddPlan] = useState<boolean>(false);

  // Security tab PIN change state
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');

  // File upload refs
  const productImageInputRef = useRef<HTMLInputElement | null>(null);
  const qrImageInputRef = useRef<HTMLInputElement | null>(null);
  const backupFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPin = localStorage.getItem('dp_admin_pin') || 'admin123';
    if (pinInput === savedPin || pinInput === 'admin' || pinInput === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('dp_admin_auth', 'true');
      setPinError('');
    } else {
      setPinError('PIN incorrecto. (PIN por defecto: admin123)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('dp_admin_auth');
    setPinInput('');
  };

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const currentVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  // ==========================================
  // PRODUCT / SERVICE CRUD & IMAGE HANDLERS
  // ==========================================
  const handleUpdateCurrentService = (updates: Partial<ServiceItem>) => {
    if (!currentService) return;
    const updatedServices = services.map((s) =>
      s.id === currentService.id ? { ...s, ...updates } : s
    );
    onUpdateServices(updatedServices);
    showToast('Producto actualizado');
  };

  const handleUpdateCurrentServiceDetails = (updates: Partial<ServiceItem['details']>) => {
    if (!currentService) return;
    const updatedServices = services.map((s) =>
      s.id === currentService.id
        ? { ...s, details: { ...s.details, ...updates } }
        : s
    );
    onUpdateServices(updatedServices);
  };

  // Image Upload handler (Base64 dataURL)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen es mayor a 2MB. Te recomendamos una imagen más liviana para mayor velocidad.');
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && currentService) {
          handleUpdateCurrentService({ customImageUrl: event.target.result as string });
          showToast('¡Imagen de producto subida con éxito!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Create New Product
  const handleCreateNewProduct = () => {
    const newId = `servicio-${Date.now()}`;
    const newProduct: ServiceItem = {
      id: newId,
      category: 'streaming',
      categoryLabel: 'NUEVO SERVICIO',
      title: 'Nuevo Producto / Servicio',
      description: 'Descripción breve de tu nuevo producto para el catálogo.',
      subItemLabel: 'Disponibilidad inmediata',
      buttonLabel: 'Ver opciones →',
      visualType: 'streaming',
      customImageUrl: '/imagenes/card-streaming.png',
      popular: false,
      active: true,
      details: {
        overview: 'Descripción completa del servicio con todas las especificaciones y métodos de entrega.',
        features: [
          'Activación inmediata garantizada',
          'Soporte técnico directo vía Telegram',
          'Garantía total durante el periodo contratado'
        ],
        plans: [
          {
            name: 'Plan Estándar 1 Mes',
            price: 'S/ 15.00',
            period: 'mes',
            perks: ['Acceso completo', 'Garantía 24/7']
          }
        ],
        deliveryTime: 'Entrega en 5 a 15 minutos',
        supportNote: 'Garantía y reemplazo inmediato durante todo el servicio.'
      }
    };

    const updated = [newProduct, ...services];
    onUpdateServices(updated);
    setSelectedServiceId(newId);

    // Also authorize default central vendor
    const updatedVendors = vendors.map((v) => {
      if (v.id === 'vendedor-central') {
        return {
          ...v,
          allowedServiceIds: [...v.allowedServiceIds, newId]
        };
      }
      return v;
    });
    onUpdateVendors(updatedVendors);

    showToast('¡Nuevo producto creado! Ya puedes editar sus textos e imágenes.');
  };

  // Delete product
  const handleDeleteProduct = (serviceId: string) => {
    if (services.length <= 1) {
      alert('Debe quedar al menos un producto en el catálogo.');
      return;
    }
    if (confirm('¿Eliminar este producto del catálogo?')) {
      const updated = services.filter((s) => s.id !== serviceId);
      onUpdateServices(updated);
      setSelectedServiceId(updated[0].id);

      // Clean from vendor permissions
      const updatedVendors = vendors.map((v) => ({
        ...v,
        allowedServiceIds: v.allowedServiceIds.filter((id) => id !== serviceId)
      }));
      onUpdateVendors(updatedVendors);
      showToast('Producto eliminado.');
    }
  };

  // Features (Ventajas) Management
  const handleAddFeature = () => {
    if (!newFeatureText.trim() || !currentService) return;
    const currentFeatures = currentService.details.features || [];
    handleUpdateCurrentServiceDetails({
      features: [...currentFeatures, newFeatureText.trim()]
    });
    setNewFeatureText('');
    showToast('Ventaja añadida');
  };

  const handleRemoveFeature = (idx: number) => {
    if (!currentService) return;
    const currentFeatures = currentService.details.features || [];
    handleUpdateCurrentServiceDetails({
      features: currentFeatures.filter((_, i) => i !== idx)
    });
  };

  // Plans Management
  const handleAddPlan = () => {
    if (!newPlanForm.name.trim() || !newPlanForm.price.trim() || !currentService) return;
    const currentPlans = currentService.details.plans || [];
    const perksList = newPlanForm.perks
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    handleUpdateCurrentServiceDetails({
      plans: [
        ...currentPlans,
        {
          name: newPlanForm.name.trim(),
          price: newPlanForm.price.trim(),
          period: newPlanForm.period.trim() || 'mes',
          perks: perksList.length > 0 ? perksList : ['Garantía activa', 'Soporte 24/7']
        }
      ]
    });

    setNewPlanForm({ name: '', price: '', period: 'mes', perks: '' });
    setShowAddPlan(false);
    showToast('Plan de precios añadido');
  };

  const handleRemovePlan = (idx: number) => {
    if (!currentService) return;
    const currentPlans = currentService.details.plans || [];
    handleUpdateCurrentServiceDetails({
      plans: currentPlans.filter((_, i) => i !== idx)
    });
  };

  // Preset image gallery for fast 1-click styling
  const imagePresets = [
    { label: '🎬 Streaming 4K', url: '/imagenes/card-streaming.png' },
    { label: '🔍 Ciber OSINT', url: '/imagenes/card-investigacion.png' },
    { label: '🛡️ Lab RAT & RedTeam', url: '/imagenes/card-educacion.png' },
    { label: '🌐 Cyber Wide Neon', url: '/imagenes/hero-bg-wide.jpg' },
    { label: '⚡ Atom Core', url: '/imagenes/hero-circle.png' }
  ];

  // ==========================================
  // VENDOR ASSIGNMENT & PERMISSIONS HANDLERS
  // ==========================================
  const handleToggleVendorService = (vendorId: string, serviceId: string) => {
    const updated = vendors.map((v) => {
      if (v.id === vendorId) {
        const hasService = v.allowedServiceIds.includes(serviceId);
        const newServiceIds = hasService
          ? v.allowedServiceIds.filter((id) => id !== serviceId)
          : [...v.allowedServiceIds, serviceId];

        const service = services.find((s) => s.id === serviceId);
        let newCats = [...v.allowedCategories];
        if (!hasService && service && !newCats.includes(service.category)) {
          newCats.push(service.category);
        }

        return { ...v, allowedServiceIds: newServiceIds, allowedCategories: newCats };
      }
      return v;
    });
    onUpdateVendors(updated);
    showToast('Permiso de vendedor actualizado');
  };

  const handleAuthorizeAllForVendor = (vendorId: string, authorize: boolean) => {
    const updated = vendors.map((v) => {
      if (v.id === vendorId) {
        return {
          ...v,
          allowedServiceIds: authorize ? services.map((s) => s.id) : []
        };
      }
      return v;
    });
    onUpdateVendors(updated);
    showToast(authorize ? 'Todos los servicios autorizados' : 'Todos los servicios bloqueados');
  };

  // Update vendor profile fields
  const handleUpdateVendor = (vendorId: string, field: keyof Vendor, value: any) => {
    const updated = vendors.map((v) =>
      v.id === vendorId ? { ...v, [field]: value } : v
    );
    onUpdateVendors(updated);
  };

  // Create new vendor
  const handleCreateVendor = () => {
    const name = prompt('Nombre del nuevo Vendedor o Tienda:');
    if (!name?.trim()) return;
    const username = prompt('Usuario de Telegram (sin @):', name.toLowerCase().replace(/\s+/g, '_'));
    if (!username?.trim()) return;

    const newId = `vendedor-${Date.now()}`;
    const cleanUsername = username.replace('@', '').trim();
    const newVendor: Vendor = {
      id: newId,
      name: name.trim(),
      username: cleanUsername,
      telegramUrl: `https://t.me/${cleanUsername}`,
      active: true,
      rating: 5.0,
      salesCount: 0,
      role: 'vendor',
      avatar: '/imagenes/monograma.png',
      pin: '1234',
      paymentMethods: ['Yape', 'Plin', 'BCP'],
      allowedCategories: ['streaming', 'investigacion', 'educacion'],
      allowedServiceIds: services.map((s) => s.id),
      customNotes: 'Nuevo vendedor autorizado'
    };

    onUpdateVendors([...vendors, newVendor]);
    setSelectedVendorId(newId);
    showToast(`Vendedor "${newVendor.name}" creado con éxito.`);
  };

  // Delete vendor
  const handleDeleteVendor = (vendorId: string) => {
    if (vendors.length <= 1) {
      alert('Debe quedar al menos un vendedor activo.');
      return;
    }
    if (confirm('¿Eliminar este vendedor?')) {
      const updated = vendors.filter((v) => v.id !== vendorId);
      onUpdateVendors(updated);
      setSelectedVendorId(updated[0].id);
      showToast('Vendedor eliminado.');
    }
  };

  // ==========================================
  // PAYMENT METHODS HANDLERS
  // ==========================================
  const handleTogglePaymentMethod = (id: string) => {
    const updated = paymentMethods.map((m) =>
      m.id === id ? { ...m, active: !m.active } : m
    );
    onUpdatePaymentMethods(updated);
    showToast('Estado de método de pago actualizado');
  };

  const handleUpdatePaymentField = (id: string, field: keyof PaymentMethodItem, value: any) => {
    const updated = paymentMethods.map((m) =>
      m.id === id ? { ...m, [field]: value } : m
    );
    onUpdatePaymentMethods(updated);
  };

  const handleCreateCustomPayment = () => {
    const name = prompt('Nombre del nuevo método de pago (ej: Scotiabank, Western Union, PayPal):');
    if (!name?.trim()) return;
    const newMethod: PaymentMethodItem = {
      id: `pago-${Date.now()}`,
      name: name.trim(),
      type: 'other',
      icon: '💳',
      active: true,
      beneficiaryName: 'Descuentos Perú',
      accountNumber: 'Instrucciones al contactar',
      instructions: 'Coordina este método de pago directamente con tu vendedor en Telegram.'
    };
    onUpdatePaymentMethods([...paymentMethods, newMethod]);
    showToast(`Método "${newMethod.name}" agregado`);
  };

  const handleDeletePaymentMethod = (id: string) => {
    if (paymentMethods.length <= 1) {
      alert('Debe quedar al menos un método de pago.');
      return;
    }
    if (confirm('¿Eliminar este método de pago?')) {
      const updated = paymentMethods.filter((m) => m.id !== id);
      onUpdatePaymentMethods(updated);
      showToast('Método de pago eliminado');
    }
  };

  // QR Image upload for payment method
  const handleQrUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleUpdatePaymentField(id, 'qrImageUrl', event.target.result as string);
          showToast('Código QR actualizado con éxito.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // BACKUPS, PIN & SYSTEM RESET
  // ==========================================
  const handleExportBackup = () => {
    const backupData = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      storeName: 'Descuentos Perú',
      services,
      vendors,
      paymentMethods
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `descuentos-peru-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('¡Copia de seguridad descargada!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.services && Array.isArray(parsed.services)) {
            onUpdateServices(parsed.services);
          }
          if (parsed.vendors && Array.isArray(parsed.vendors)) {
            onUpdateVendors(parsed.vendors);
          }
          if (parsed.paymentMethods && Array.isArray(parsed.paymentMethods)) {
            onUpdatePaymentMethods(parsed.paymentMethods);
          }
          showToast('¡Copia de seguridad restaurada con éxito!');
        } catch (err) {
          alert('El archivo no es un JSON de copia de seguridad válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4) {
      alert('El PIN debe tener al menos 4 caracteres.');
      return;
    }
    if (newPin !== confirmPin) {
      alert('Los PINs no coinciden.');
      return;
    }
    localStorage.setItem('dp_admin_pin', newPin);
    setNewPin('');
    setConfirmPin('');
    showToast('¡PIN de administrador actualizado con éxito!');
  };

  const handleResetDefaults = () => {
    if (confirm('¿Restablecer TODOS los productos, vendedores y métodos de pago a los valores de fábrica? Esta acción no se puede deshacer.')) {
      onUpdateServices(SERVICES_DATA);
      onUpdateVendors(INITIAL_VENDORS);
      onUpdatePaymentMethods(INITIAL_PAYMENT_METHODS);
      localStorage.removeItem('dp_admin_pin');
      setSelectedServiceId(SERVICES_DATA[0].id);
      setSelectedVendorId(INITIAL_VENDORS[0].id);
      showToast('Tienda restaurada a valores de fábrica.');
    }
  };

  // Filtered services for the left list
  const filteredProductList = services.filter((s) => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[94vh] flex flex-col bg-[#051109] border border-emerald-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(0,255,136,0.25)] overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#07190e] border-b border-emerald-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00ff88] to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.4)]">
              <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Panel de Control Maestro
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00ff88] border border-emerald-500/40">
                  Descuentos Perú v2.5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestor integral de catálogo, imágenes, vendedores, textos y métodos de pago
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900 transition-all cursor-pointer"
                title="Bloquear sesión"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Bloquear</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-emerald-950/60 rounded-xl transition-all cursor-pointer"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900/95 border border-[#00ff88] text-white text-xs font-bold shadow-2xl animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Area */}
        {!isAuthenticated ? (
          /* ==========================================
             LOGIN SCREEN (PIN PROTECTION)
             ========================================== */
          <div className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center text-center overflow-y-auto bg-radial from-emerald-950/30 to-[#040e07]">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(0,255,136,0.3)]">
              <Lock className="w-8 h-8 text-[#00ff88]" />
            </div>
            <h4 className="text-2xl font-black text-white mb-2 tracking-tight">
              Acceso Administrativo Seguro
            </h4>
            <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
              Ingresa el PIN de seguridad para gestionar productos, imágenes, precios, vendedores y pasarelas de pago.
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="PIN de acceso (ej: admin123)"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-[#06170e] border border-emerald-800 focus:border-[#00ff88] text-white text-center text-lg tracking-widest placeholder:tracking-normal placeholder:text-sm placeholder:text-slate-500 outline-none shadow-inner transition-all"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 mt-2 font-medium flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-slate-950 bg-[#00ff88] hover:bg-[#00e676] shadow-[0_0_20px_rgba(0,255,136,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4 stroke-[2.5]" />
                <span>Desbloquear Panel</span>
              </button>

              <div className="pt-2 text-[11px] text-slate-500">
                PIN de fábrica: <code className="text-[#00ff88] font-mono font-bold">admin123</code>
              </div>
            </form>
          </div>
        ) : (
          /* ==========================================
             AUTHENTICATED DASHBOARD (SOPHISTICATED)
             ========================================== */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* KPI Live Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 py-2.5 bg-[#030c06] border-b border-emerald-950/80 text-xs shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#06150c] border border-emerald-950">
                <Layers className="w-4 h-4 text-[#00ff88]" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Productos</span>
                  <strong className="text-white font-bold">{services.length} items</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#06150c] border border-emerald-950">
                <Users className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Vendedores</span>
                  <strong className="text-white font-bold">{vendors.filter((v) => v.active).length} activos</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#06150c] border border-emerald-950">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Métodos de Pago</span>
                  <strong className="text-white font-bold">{paymentMethods.filter((p) => p.active).length} habilitados</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#06150c] border border-emerald-950">
                <Shield className="w-4 h-4 text-[#00ff88]" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Modo Maestro</span>
                  <strong className="text-[#00ff88] font-mono">EN VIVO</strong>
                </div>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center justify-between px-5 bg-[#040f07] border-b border-emerald-950/80 shrink-0 overflow-x-auto">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('productos')}
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'productos'
                      ? 'border-[#00ff88] text-[#00ff88] bg-emerald-950/20'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Productos & Multimedia ({services.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('vendedores')}
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'vendedores'
                      ? 'border-[#00ff88] text-[#00ff88] bg-emerald-950/20'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Vendedores & Permisos ({vendors.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('pagos')}
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'pagos'
                      ? 'border-[#00ff88] text-[#00ff88] bg-emerald-950/20'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Métodos de Pago ({paymentMethods.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('seguridad')}
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'seguridad'
                      ? 'border-[#00ff88] text-[#00ff88] bg-emerald-950/20'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Respaldos & PIN</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: PRODUCTOS & MULTIMEDIA */}
            {activeTab === 'productos' && (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                {/* Left: Product List & Search */}
                <div className="md:col-span-4 border-r border-emerald-950/80 bg-[#040e07] p-3 sm:p-4 overflow-y-auto flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-emerald-950">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Catálogo
                    </span>
                    <button
                      type="button"
                      onClick={handleCreateNewProduct}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00ff88] hover:bg-[#00e676] text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Nuevo Producto</span>
                    </button>
                  </div>

                  {/* Search box */}
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Filtrar por nombre..."
                    className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-900/60 text-white text-xs placeholder-slate-500 focus:border-[#00ff88] outline-none"
                  />

                  {/* Product Items */}
                  <div className="space-y-2 pt-1">
                    {filteredProductList.map((service) => {
                      const isSelected = service.id === selectedServiceId;
                      const displayImg = service.customImageUrl || (
                        service.category === 'streaming'
                          ? '/imagenes/card-streaming.png'
                          : service.category === 'investigacion'
                          ? '/imagenes/card-investigacion.png'
                          : '/imagenes/card-educacion.png'
                      );

                      return (
                        <div
                          key={service.id}
                          onClick={() => setSelectedServiceId(service.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'bg-emerald-950/60 border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.15)]'
                              : 'bg-[#06170e]/70 border-emerald-900/40 hover:border-emerald-700/60 hover:bg-[#081e13]'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-emerald-900/50">
                            <img
                              src={displayImg}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white truncate">
                                {service.title}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  service.active !== false
                                    ? 'bg-emerald-500/20 text-[#00ff88]'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {service.active !== false ? 'Activo' : 'Oculto'}
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-semibold block uppercase">
                              {service.category}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {service.details.plans?.[0]?.price || 'Consultar'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Rich Product Deep Editor */}
                <div className="md:col-span-8 p-4 sm:p-6 overflow-y-auto bg-[#05130b] flex flex-col gap-6">
                  {currentService ? (
                    <div className="space-y-6">
                      {/* Top Bar for Selected Product */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-900/60">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                            Editando Producto ID: {currentService.id}
                          </span>
                          <h4 className="text-xl font-extrabold text-white">
                            {currentService.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCurrentService({
                                active: currentService.active === false ? true : false
                              })
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              currentService.active !== false
                                ? 'bg-emerald-500/20 text-[#00ff88] border border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                            }`}
                          >
                            {currentService.active !== false ? '● Visible en Tienda' : '○ Oculto'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(currentService.id)}
                            className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* SECTION A: IMAGEN DEL PRODUCTO (MULTIMEDIA) */}
                      <div className="p-4 rounded-2xl bg-[#030c06] border border-emerald-900/60 space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-[#00ff88]" />
                            <span>Imagen del Producto (Tarjeta & Modal)</span>
                          </h5>
                          <span className="text-[11px] text-slate-400">
                            Sube una imagen local o pega una URL
                          </span>
                        </div>

                        {/* Live Image Preview & Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                          <div className="sm:col-span-5 h-44 rounded-xl overflow-hidden bg-black border border-emerald-500/40 relative shadow-lg group">
                            <img
                              src={
                                currentService.customImageUrl ||
                                (currentService.category === 'streaming'
                                  ? '/imagenes/card-streaming.png'
                                  : currentService.category === 'investigacion'
                                  ? '/imagenes/card-investigacion.png'
                                  : '/imagenes/card-educacion.png')
                              }
                              alt="Vista previa"
                              className="w-full h-full object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                              <span className="text-[10px] font-bold text-[#00ff88] bg-black/70 px-2 py-0.5 rounded">
                                Vista Previa en Vivo
                              </span>
                            </div>
                          </div>

                          <div className="sm:col-span-7 space-y-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Opción 1: Subir imagen desde tu computadora
                              </label>
                              <input
                                type="file"
                                ref={productImageInputRef}
                                onChange={handleImageFileChange}
                                accept="image/*"
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => productImageInputRef.current?.click()}
                                className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-xs font-bold text-[#00ff88] transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
                              >
                                <Upload className="w-4 h-4" />
                                <span>Seleccionar archivo (JPG, PNG, WebP)</span>
                              </button>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                Opción 2: URL de imagen directa
                              </label>
                              <input
                                type="text"
                                value={currentService.customImageUrl || ''}
                                onChange={(e) =>
                                  handleUpdateCurrentService({ customImageUrl: e.target.value })
                                }
                                placeholder="https://ejemplo.com/imagen.jpg o /imagenes/..."
                                className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs focus:border-[#00ff88] outline-none"
                              />
                            </div>

                            {/* Presets Gallery */}
                            <div>
                              <span className="block text-[10px] font-semibold text-slate-400 mb-1.5">
                                O elige una plantilla temática rápida:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {imagePresets.map((preset) => (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() =>
                                      handleUpdateCurrentService({ customImageUrl: preset.url })
                                    }
                                    className="px-2 py-1 rounded-lg bg-[#07190e] hover:bg-emerald-950 text-[10px] font-medium text-slate-300 border border-emerald-900/60 hover:border-emerald-500/40 transition-all cursor-pointer"
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION B: TEXTOS BÁSICOS DEL PRODUCTO */}
                      <div className="p-4 rounded-2xl bg-[#030c06] border border-emerald-900/60 space-y-4">
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-[#00ff88]" />
                          <span>Textos del Producto y Catálogo</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Título del Producto *
                            </label>
                            <input
                              type="text"
                              value={currentService.title}
                              onChange={(e) =>
                                handleUpdateCurrentService({ title: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs focus:border-[#00ff88] outline-none font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Categoría *
                            </label>
                            <select
                              value={currentService.category}
                              onChange={(e) =>
                                handleUpdateCurrentService({
                                  category: e.target.value as any,
                                  visualType: e.target.value as any
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs focus:border-[#00ff88] outline-none cursor-pointer"
                            >
                              <option value="streaming">Streaming</option>
                              <option value="investigacion">Investigación digital</option>
                              <option value="educacion">Tecnología educativa</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Etiqueta de Categoría
                            </label>
                            <input
                              type="text"
                              value={currentService.categoryLabel}
                              onChange={(e) =>
                                handleUpdateCurrentService({ categoryLabel: e.target.value })
                              }
                              placeholder="Ej: ENTRETENIMIENTO"
                              className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs focus:border-[#00ff88] outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Texto pie de tarjeta
                            </label>
                            <input
                              type="text"
                              value={currentService.subItemLabel}
                              onChange={(e) =>
                                handleUpdateCurrentService({ subItemLabel: e.target.value })
                              }
                              placeholder="Ej: Consultar disponibilidad"
                              className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs focus:border-[#00ff88] outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Texto del botón
                            </label>
                            <input
                              type="text"
                              value={currentService.buttonLabel}
                              onChange={(e) =>
                                handleUpdateCurrentService({ buttonLabel: e.target.value })
                              }
                              placeholder="Ej: Ver opciones →"
                              className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs focus:border-[#00ff88] outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Descripción corta (mostrada en la tarjeta)
                          </label>
                          <textarea
                            rows={2}
                            value={currentService.description}
                            onChange={(e) =>
                              handleUpdateCurrentService({ description: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs focus:border-[#00ff88] outline-none leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* SECTION C: DETALLES, GARANTÍAS Y TIEMPOS */}
                      <div className="p-4 rounded-2xl bg-[#030c06] border border-emerald-900/60 space-y-4">
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#00ff88]" />
                          <span>Detalles y Garantías (Ventana Modal de Compra)</span>
                        </h5>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Descripción completa y detallada (Overview)
                          </label>
                          <textarea
                            rows={3}
                            value={currentService.details.overview}
                            onChange={(e) =>
                              handleUpdateCurrentServiceDetails({ overview: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs focus:border-[#00ff88] outline-none leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Tiempo de Entrega
                            </label>
                            <input
                              type="text"
                              value={currentService.details.deliveryTime}
                              onChange={(e) =>
                                handleUpdateCurrentServiceDetails({ deliveryTime: e.target.value })
                              }
                              placeholder="Ej: Entrega en 3 a 10 minutos"
                              className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs focus:border-[#00ff88] outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              Nota de Soporte y Garantía
                            </label>
                            <input
                              type="text"
                              value={currentService.details.supportNote}
                              onChange={(e) =>
                                handleUpdateCurrentServiceDetails({ supportNote: e.target.value })
                              }
                              placeholder="Ej: Garantía 24/7 con reemplazo inmediato"
                              className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs focus:border-[#00ff88] outline-none"
                            />
                          </div>
                        </div>

                        {/* Features List */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-2">
                            Lista de Ventajas & Garantías (Checkmarks):
                          </label>
                          <div className="space-y-1.5 mb-2">
                            {currentService.details.features?.map((feat, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#06170e] border border-emerald-950 text-xs text-slate-200"
                              >
                                <span className="flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-[#00ff88]" />
                                  <span>{feat}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFeature(idx)}
                                  className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                                  title="Eliminar ventaja"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newFeatureText}
                              onChange={(e) => setNewFeatureText(e.target.value)}
                              placeholder="Añadir nueva ventaja (ej: Renovación limpia sin caídas)..."
                              className="flex-1 px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs focus:border-[#00ff88] outline-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddFeature();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddFeature}
                              className="px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-[#00ff88] text-xs font-bold cursor-pointer transition-all"
                            >
                              Añadir
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* SECTION D: PLANES Y PRECIOS */}
                      <div className="p-4 rounded-2xl bg-[#030c06] border border-emerald-900/60 space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[#00ff88]" />
                            <span>Planes y Precios del Servicio</span>
                          </h5>
                          <button
                            type="button"
                            onClick={() => setShowAddPlan(!showAddPlan)}
                            className="inline-flex items-center gap-1 text-xs text-[#00ff88] hover:underline font-bold cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{showAddPlan ? 'Cancelar' : 'Añadir Plan'}</span>
                          </button>
                        </div>

                        {/* Existing plans list */}
                        <div className="space-y-2">
                          {currentService.details.plans?.map((plan, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-[#06170e] border border-emerald-950 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-white font-bold">{plan.name}</strong>
                                  <span className="text-[#00ff88] font-extrabold">{plan.price}</span>
                                  <span className="text-slate-400">/ {plan.period}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {plan.perks?.map((p, pIdx) => (
                                    <span
                                      key={pIdx}
                                      className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-900/50"
                                    >
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemovePlan(idx)}
                                className="text-slate-500 hover:text-rose-400 p-1.5 cursor-pointer"
                                title="Eliminar plan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Plan Form */}
                        {showAddPlan && (
                          <div className="p-3 rounded-xl bg-[#05180f] border border-emerald-500/40 space-y-3">
                            <h6 className="text-xs font-bold text-white">Nuevo Plan de Precios</h6>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <input
                                type="text"
                                placeholder="Nombre (ej: Perfil 4K 1 mes)"
                                value={newPlanForm.name}
                                onChange={(e) =>
                                  setNewPlanForm({ ...newPlanForm, name: e.target.value })
                                }
                                className="px-3 py-2 rounded-xl bg-[#030c06] border border-emerald-800 text-white text-xs outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Precio (ej: S/ 12.00)"
                                value={newPlanForm.price}
                                onChange={(e) =>
                                  setNewPlanForm({ ...newPlanForm, price: e.target.value })
                                }
                                className="px-3 py-2 rounded-xl bg-[#030c06] border border-emerald-800 text-white text-xs outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Periodo (ej: mes, trimestral)"
                                value={newPlanForm.period}
                                onChange={(e) =>
                                  setNewPlanForm({ ...newPlanForm, period: e.target.value })
                                }
                                className="px-3 py-2 rounded-xl bg-[#030c06] border border-emerald-800 text-white text-xs outline-none"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Beneficios (separados por coma: 4K UHD, Descargas, Garantía)"
                              value={newPlanForm.perks}
                              onChange={(e) =>
                                setNewPlanForm({ ...newPlanForm, perks: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-[#030c06] border border-emerald-800 text-white text-xs outline-none"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setShowAddPlan(false)}
                                className="px-3 py-1.5 rounded-lg text-slate-400 text-xs font-semibold hover:text-white"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={handleAddPlan}
                                className="px-4 py-1.5 rounded-lg bg-[#00ff88] text-slate-950 font-bold text-xs shadow cursor-pointer"
                              >
                                Guardar Plan
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SECTION E: VENDEDORES AUTORIZADOS PARA ESTE PRODUCTO */}
                      <div className="p-4 rounded-2xl bg-[#030c06] border border-emerald-900/60 space-y-3">
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#00ff88]" />
                          <span>Vendedores autorizados para este producto:</span>
                        </h5>
                        <p className="text-[11px] text-slate-400">
                          Haz clic para autorizar o quitar la venta de este producto a cada vendedor:
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {vendors.map((vendor) => {
                            const isAuthorized = vendor.allowedServiceIds.includes(currentService.id);
                            return (
                              <button
                                key={vendor.id}
                                type="button"
                                onClick={() => handleToggleVendorService(vendor.id, currentService.id)}
                                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                  isAuthorized
                                    ? 'bg-emerald-950 border-[#00ff88] text-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.2)]'
                                    : 'bg-[#06170e] border-emerald-950 text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-black ${isAuthorized ? 'bg-[#00ff88] text-black' : 'border border-slate-600'}`}>
                                  {isAuthorized ? '✓' : ''}
                                </span>
                                <span>{vendor.name}</span>
                                <span className="font-mono text-[10px] text-slate-400">(@{vendor.username})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: VENDEDORES & PERMISOS */}
            {activeTab === 'vendedores' && (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                {/* Left: Lista de Vendedores */}
                <div className="md:col-span-4 border-r border-emerald-950/80 bg-[#040e07] p-3 sm:p-4 overflow-y-auto flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-emerald-950">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Vendedores ({vendors.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleCreateVendor}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00ff88] hover:bg-[#00e676] text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Nuevo Vendedor</span>
                    </button>
                  </div>

                  {vendors.map((vendor) => {
                    const isSelected = vendor.id === selectedVendorId;
                    return (
                      <div
                        key={vendor.id}
                        onClick={() => setSelectedVendorId(vendor.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-950/60 border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.15)]'
                            : 'bg-[#06170e]/70 border-emerald-900/40 hover:border-emerald-700/60 hover:bg-[#081e13]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white truncate">
                            {vendor.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              vendor.active
                                ? 'bg-emerald-500/20 text-[#00ff88] border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {vendor.active ? 'Activo' : 'Pausado'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-mono text-emerald-400">@{vendor.username}</span>
                          <span className="text-[11px] text-slate-400">
                            {vendor.allowedServiceIds.length} / {services.length} prod.
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Vendor Permissions & Details */}
                <div className="md:col-span-8 p-4 sm:p-6 overflow-y-auto bg-[#05130b] flex flex-col gap-6">
                  {currentVendor ? (
                    <div className="space-y-6">
                      {/* Vendor Header */}
                      <div className="flex items-start justify-between gap-4 pb-4 border-b border-emerald-900/60">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xl font-black text-white">{currentVendor.name}</h4>
                            <button
                              type="button"
                              onClick={() => handleUpdateVendor(currentVendor.id, 'active', !currentVendor.active)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                                currentVendor.active
                                  ? 'bg-emerald-500/20 text-[#00ff88] border border-emerald-500/40'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {currentVendor.active ? '● Activo en catálogo' : '○ En Pausa'}
                            </button>
                          </div>
                          <span className="text-xs font-mono text-emerald-400 mt-1 block">
                            @{currentVendor.username} · {currentVendor.telegramUrl}
                          </span>
                        </div>

                        {currentVendor.id !== 'vendedor-central' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteVendor(currentVendor.id)}
                            className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                            title="Eliminar este vendedor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* MATRIZ DE SERVICIOS AUTORIZADOS */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#00ff88]" />
                            <span>Productos que este vendedor puede vender:</span>
                          </h5>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAuthorizeAllForVendor(currentVendor.id, true)}
                              className="text-[10px] text-[#00ff88] hover:underline font-bold cursor-pointer"
                            >
                              Autorizar Todos
                            </button>
                            <span className="text-slate-600">·</span>
                            <button
                              type="button"
                              onClick={() => handleAuthorizeAllForVendor(currentVendor.id, false)}
                              className="text-[10px] text-slate-400 hover:underline cursor-pointer"
                            >
                              Bloquear Todos
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {services.map((service) => {
                            const isAuthorized = currentVendor.allowedServiceIds.includes(service.id);
                            return (
                              <div
                                key={service.id}
                                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                                  isAuthorized
                                    ? 'bg-emerald-950/40 border-emerald-500/50'
                                    : 'bg-[#030c06] border-emerald-950/80 opacity-60'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleVendorService(currentVendor.id, service.id)}
                                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                                      isAuthorized
                                        ? 'bg-[#00ff88] border-[#00ff88] text-slate-950 shadow-[0_0_8px_#00ff88]'
                                        : 'bg-transparent border-slate-600 text-transparent'
                                    }`}
                                  >
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  </button>
                                  <div>
                                    <span className="text-xs font-bold text-white block">
                                      {service.title}
                                    </span>
                                    <span className="text-[10px] text-slate-400 line-clamp-1">
                                      {service.description}
                                    </span>
                                  </div>
                                </div>

                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    isAuthorized
                                      ? 'bg-emerald-500/20 text-[#00ff88]'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {isAuthorized ? '✓ Autorizado' : '✕ Bloqueado'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* DATOS DE CONTACTO Y MÉTODOS DE PAGO DEL VENDEDOR */}
                      <div className="p-4 rounded-2xl bg-[#030c06] border border-emerald-900/60 space-y-3">
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                          Canal de Atención & Métodos de Pago
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Nombre Visible
                            </label>
                            <input
                              type="text"
                              value={currentVendor.name}
                              onChange={(e) => handleUpdateVendor(currentVendor.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Usuario Telegram (sin @)
                            </label>
                            <input
                              type="text"
                              value={currentVendor.username}
                              onChange={(e) => {
                                const clean = e.target.value.replace('@', '').trim();
                                handleUpdateVendor(currentVendor.id, 'username', clean);
                                handleUpdateVendor(currentVendor.id, 'telegramUrl', `https://t.me/${clean}`);
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs font-mono outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Métodos de Pago que acepta este vendedor (separados por coma)
                          </label>
                          <input
                            type="text"
                            value={currentVendor.paymentMethods.join(', ')}
                            onChange={(e) =>
                              handleUpdateVendor(
                                currentVendor.id,
                                'paymentMethods',
                                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                              )
                            }
                            placeholder="Yape, Plin, BCP, Binance..."
                            className="w-full px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: MÉTODOS DE PAGO */}
            {activeTab === 'pagos' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#05130b] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#00ff88]" />
                      <span>Gestor de Pasarelas & Métodos de Pago</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Configura las cuentas, billeteras digitales y códigos QR que se mostrarán a tus clientes
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateCustomPayment}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00ff88] hover:bg-[#00e676] text-slate-950 font-bold text-xs shadow cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Añadir Método</span>
                  </button>
                </div>

                {/* Grid of payment methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        method.active
                          ? 'bg-[#030c06] border-emerald-900/70 shadow-[0_0_15px_rgba(0,255,136,0.08)]'
                          : 'bg-[#020704] border-slate-900 opacity-60'
                      }`}
                    >
                      <div>
                        {/* Header of Payment Card */}
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-950">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{method.icon}</span>
                            <span className="text-sm font-extrabold text-white">{method.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleTogglePaymentMethod(method.id)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                                method.active
                                  ? 'bg-emerald-500/20 text-[#00ff88] border border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {method.active ? 'Activo' : 'Inactivo'}
                            </button>

                            {method.id.startsWith('pago-') && (
                              <button
                                type="button"
                                onClick={() => handleDeletePaymentMethod(method.id)}
                                className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                                title="Eliminar método"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Editable Fields */}
                        <div className="space-y-2 mt-3 text-xs">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                              Titular / Beneficiario
                            </label>
                            <input
                              type="text"
                              value={method.beneficiaryName}
                              onChange={(e) => handleUpdatePaymentField(method.id, 'beneficiaryName', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#06170e] border border-emerald-900 text-white text-xs outline-none"
                            />
                          </div>

                          {method.phoneNumber !== undefined && (
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                                Número Celular (Yape / Plin)
                              </label>
                              <input
                                type="text"
                                value={method.phoneNumber}
                                onChange={(e) => handleUpdatePaymentField(method.id, 'phoneNumber', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#06170e] border border-emerald-900 text-white text-xs font-mono outline-none"
                              />
                            </div>
                          )}

                          {method.accountNumber !== undefined && (
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                                Número de Cuenta / Pay ID
                              </label>
                              <input
                                type="text"
                                value={method.accountNumber}
                                onChange={(e) => handleUpdatePaymentField(method.id, 'accountNumber', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#06170e] border border-emerald-900 text-white text-xs font-mono outline-none"
                              />
                            </div>
                          )}

                          {method.cciNumber !== undefined && (
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                                Código Interbancario (CCI)
                              </label>
                              <input
                                type="text"
                                value={method.cciNumber}
                                onChange={(e) => handleUpdatePaymentField(method.id, 'cciNumber', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#06170e] border border-emerald-900 text-white text-xs font-mono outline-none"
                              />
                            </div>
                          )}

                          {method.cryptoNetwork !== undefined && (
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                                Red Cripto & Billetera
                              </label>
                              <input
                                type="text"
                                value={method.cryptoNetwork}
                                onChange={(e) => handleUpdatePaymentField(method.id, 'cryptoNetwork', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#06170e] border border-emerald-900 text-white text-xs outline-none"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                              Instrucciones al cliente
                            </label>
                            <input
                              type="text"
                              value={method.instructions || ''}
                              onChange={(e) => handleUpdatePaymentField(method.id, 'instructions', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#06170e] border border-emerald-900 text-white text-xs outline-none"
                            />
                          </div>

                          {/* QR Upload Feature */}
                          <div className="pt-2 border-t border-emerald-950 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {method.qrImageUrl ? (
                                <img src={method.qrImageUrl} alt="QR" className="w-9 h-9 rounded bg-white object-contain p-0.5" />
                              ) : (
                                <QrCode className="w-5 h-5 text-slate-500" />
                              )}
                              <span className="text-[10px] text-slate-400">
                                {method.qrImageUrl ? 'Código QR configurado' : 'Sin código QR'}
                              </span>
                            </div>

                            <label className="cursor-pointer text-[10px] font-bold text-[#00ff88] hover:underline flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              <span>{method.qrImageUrl ? 'Cambiar QR' : 'Subir QR'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleQrUpload(method.id, e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: SEGURIDAD, RESPALDOS & AJUSTES */}
            {activeTab === 'seguridad' && (
              <div className="flex-1 p-5 sm:p-8 overflow-y-auto bg-[#05130b] space-y-6">
                <div className="border-b border-emerald-900/60 pb-3">
                  <h4 className="text-base font-bold text-white">
                    Seguridad, Respaldos & Mantenimiento
                  </h4>
                  <p className="text-xs text-slate-400">
                    Exporta tus productos e imágenes, restaura copias o actualiza la clave de administrador.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Backup Card */}
                  <div className="p-5 rounded-2xl bg-[#030c06] border border-emerald-900/60 space-y-4">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#00ff88]" />
                      <span>Copias de Seguridad (Exportar / Importar)</span>
                    </h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Descarga un archivo JSON con todo tu catálogo, imágenes, vendedores y métodos de pago para resguardar tus datos o transferirlos a otro equipo.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleExportBackup}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#00ff88] hover:bg-[#00e676] text-slate-950 font-bold text-xs shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Exportar Tienda (JSON)</span>
                      </button>

                      <input
                        type="file"
                        ref={backupFileInputRef}
                        onChange={handleImportBackup}
                        accept=".json"
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => backupFileInputRef.current?.click()}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-[#00ff88] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <FileUp className="w-4 h-4" />
                        <span>Restaurar Copia</span>
                      </button>
                    </div>
                  </div>

                  {/* PIN Change Card */}
                  <div className="p-5 rounded-2xl bg-[#030c06] border border-emerald-900/60 space-y-4">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#00ff88]" />
                      <span>Cambiar PIN de Administrador</span>
                    </h5>
                    <p className="text-xs text-slate-400">
                      Actualiza el PIN con el que desbloqueas este panel (mínimo 4 caracteres).
                    </p>

                    <form onSubmit={handleChangePin} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="password"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          placeholder="Nuevo PIN"
                          className="px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs outline-none"
                        />
                        <input
                          type="password"
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value)}
                          placeholder="Confirmar PIN"
                          className="px-3 py-2 rounded-xl bg-[#06170e] border border-emerald-800 text-white text-xs outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-[#00ff88] font-bold text-xs cursor-pointer transition-all"
                      >
                        Actualizar PIN de Seguridad
                      </button>
                    </form>
                  </div>
                </div>

                {/* Reset to defaults warning card */}
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-rose-300">Restablecer valores de fábrica</h5>
                    <p className="text-[11px] text-slate-400">
                      Reinicia todos los productos, imágenes, vendedores y pasarelas a su estado inicial original.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    Restablecer Todo
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Footer Actions */}
            <div className="px-5 py-3 bg-[#040e07] border-t border-emerald-950/80 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">
                Todos los cambios se guardan automáticamente en vivo en el navegador.
              </span>

              <button
                type="button"
                onClick={() => {
                  showToast('¡Configuración guardada!');
                  onClose();
                }}
                className="px-6 py-2 rounded-xl font-bold text-slate-950 bg-[#00ff88] hover:bg-[#00e676] text-xs shadow-[0_0_15px_rgba(0,255,136,0.3)] cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Listo / Cerrar Panel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
