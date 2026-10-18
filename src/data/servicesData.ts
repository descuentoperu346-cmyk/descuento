export interface ServicePlan {
  name: string;
  price: string;
  period: string;
  perks: string[];
  popular?: boolean;
}

export interface ServiceItem {
  id: string;
  vendorId?: string;
  assignedVendorIds?: string[];
  category: 'streaming' | 'leaks' | 'investigacion' | 'educacion';
  categoryLabel: string;
  title: string;
  description: string;
  subItemLabel: string;
  buttonLabel: string;
  visualType: 'streaming' | 'leaks' | 'investigacion' | 'educacion';
  customImageUrl?: string;
  badge?: string;
  priceFrom?: string;
  rating?: number;
  stockStatus?: 'in_stock' | 'preorder' | 'few_left';
  popular?: boolean;
  active?: boolean;
  details: {
    overview: string;
    features: string[];
    plans?: ServicePlan[];
    requirements?: string[];
    deliveryTime: string;
    supportNote: string;
  };
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'netflix-4k',
    vendorId: 'vendedor-whisky',
    assignedVendorIds: ['vendedor-whisky', 'vendedor-nano', 'vendedor-central'],
    category: 'streaming',
    categoryLabel: 'STREAMING 4K',
    title: 'Netflix Premium 4K UHD',
    description: 'Cuentas y perfiles 100% estables con garantía total de 30 días y PIN privado.',
    subItemLabel: 'Perfiles privados & Cuentas completas',
    buttonLabel: 'Ver opciones →',
    visualType: 'streaming',
    customImageUrl: '/imagenes/card-netflix.webp',
    badge: 'MÁS VENDIDO',
    priceFrom: 'S/ 12.00',
    rating: 5.0,
    stockStatus: 'in_stock',
    popular: true,
    active: true,
    details: {
      overview: 'Accede a todo el catálogo global de Netflix en Ultra HD 4K y HDR con audio Dolby Atmos. Cuentas estables y perfiles privados con PIN exclusivo para que nadie interrumpa tus series ni modifique tu historial.',
      features: [
        'Calidad Ultra HD 4K + HDR garantizada',
        'Perfil propio con PIN de seguridad de 4 dígitos',
        'Compatible con Smart TV, celulares, PC y consolas',
        'Garantía total de reposición durante todo el mes',
        'Activación inmediata tras confirmación de pago'
      ],
      plans: [
        {
          name: 'Perfil Privado con PIN (1 Mes)',
          price: 'S/ 12.00',
          period: 'mes',
          perks: ['1 Pantalla privada', 'Calidad 4K UHD', 'Garantía 30 días', 'Descargas activas'],
          popular: true
        },
        {
          name: 'Cuenta Completa 5 Pantallas (1 Mes)',
          price: 'S/ 38.00',
          period: 'mes',
          perks: ['5 Pantallas simultáneas', 'Control total', 'Tus propios perfiles', 'Sin restricciones']
        },
        {
          name: 'Combo Trimestral Perfil Privado (3 Meses)',
          price: 'S/ 32.00',
          period: '3 meses',
          perks: ['Ahorro máximo', 'Mismo perfil continuo', 'Soporte prioritario']
        }
      ],
      deliveryTime: 'Entrega en 3 a 5 minutos',
      supportNote: 'Garantía 24/7 de reemplazo inmediato durante todo el periodo adquirido.'
    }
  },
  {
    id: 'spotify-premium',
    vendorId: 'vendedor-abby',
    assignedVendorIds: ['vendedor-abby', 'vendedor-whisky', 'vendedor-central'],
    category: 'streaming',
    categoryLabel: 'MÚSICA HIFI',
    title: 'Spotify Premium Individual & Duo',
    description: 'Música ilimitada sin anuncios a tu propio correo o cuenta nueva con descargas.',
    subItemLabel: 'A tu cuenta propia o nueva',
    buttonLabel: 'Ver opciones →',
    visualType: 'streaming',
    customImageUrl: '/imagenes/card-spotify.webp',
    badge: 'AUDIO HIFI',
    priceFrom: 'S/ 8.00',
    rating: 4.9,
    stockStatus: 'in_stock',
    popular: true,
    active: true,
    details: {
      overview: 'Escucha millones de canciones y podcasts sin publicidad, con calidad de audio HiFi Lossless y descargas ilimitadas para reproducir sin conexión a internet.',
      features: [
        'Cero interrupciones publicitarias',
        'Descarga de música en calidad 320kbps',
        'Activación limpia a tu correo personal sin perder tus playlists',
        'Sincronización con Spotify Connect para parlantes y autos'
      ],
      plans: [
        {
          name: 'Renovación a tu Cuenta (1 Mes)',
          price: 'S/ 8.00',
          period: 'mes',
          perks: ['A tu propio correo', 'Conserva tus playlists', 'Garantía de reposición'],
          popular: true
        },
        {
          name: 'Plan 3 Meses Garantizado',
          price: 'S/ 22.00',
          period: '3 meses',
          perks: ['3 meses continuos', 'Audio máxima calidad', 'Soporte garantizado']
        },
        {
          name: 'Plan Familiar (6 Meses)',
          price: 'S/ 42.00',
          period: '6 meses',
          perks: ['Hasta 6 miembros', 'Ahorro superior', 'Garantía extendida']
        }
      ],
      deliveryTime: 'Entrega en 5 minutos',
      supportNote: 'Conservas todas tus canciones guardadas, playlists y seguidores.'
    }
  },
  {
    id: 'disney-combo',
    vendorId: 'vendedor-nano',
    assignedVendorIds: ['vendedor-nano', 'vendedor-tino', 'vendedor-central'],
    category: 'streaming',
    categoryLabel: 'CINE & DEPORTES',
    title: 'Disney+ Premium & ESPN Combo',
    description: 'Estrenos exclusivos de Disney, Marvel, Star Wars y partidos en vivo por ESPN.',
    subItemLabel: 'ESPN en vivo & IMAX Enhanced',
    buttonLabel: 'Ver opciones →',
    visualType: 'streaming',
    customImageUrl: '/imagenes/card-disney.webp',
    badge: 'ESTRENOS & ESPN',
    priceFrom: 'S/ 10.00',
    rating: 4.9,
    stockStatus: 'in_stock',
    popular: true,
    active: true,
    details: {
      overview: 'Acceso completo al catálogo de películas de estreno de Disney, Pixar, Marvel Studios, Star Wars y transmisiones deportivas en vivo por ESPN en calidad IMAX Enhanced y 4K HDR.',
      features: [
        'Catálogo cinematográfico completo Disney + Star',
        'Transmisión en vivo de fútbol internacional por ESPN',
        'Perfil privado con avatar personalizable',
        'Audio Dolby Atmos y descargas activas'
      ],
      plans: [
        {
          name: 'Perfil Privado (1 Mes)',
          price: 'S/ 10.00',
          period: 'mes',
          perks: ['1 Pantalla privada', 'Calidad 4K HDR', 'ESPN en vivo'],
          popular: true
        },
        {
          name: 'Cuenta Completa 4 Pantallas (1 Mes)',
          price: 'S/ 28.00',
          period: 'mes',
          perks: ['4 Pantallas simultáneas', 'Creación de perfiles', 'Control parental']
        }
      ],
      deliveryTime: 'Entrega en 5 a 10 minutos',
      supportNote: 'Activación directa con garantía de reemplazo inmediato.'
    }
  },
  {
    id: 'chatgpt-plus',
    vendorId: 'vendedor-nano',
    assignedVendorIds: ['vendedor-nano', 'vendedor-whisky', 'vendedor-central'],
    category: 'educacion',
    categoryLabel: 'INTELIGENCIA ARTIFICIAL',
    title: 'ChatGPT Plus OpenAI GPT-4o & Canvas',
    description: 'Acceso a GPT-4o con DALL-E 3, análisis avanzado de documentos PDF y Canvas.',
    subItemLabel: 'GPT-4o + DALL-E 3 + Canvas',
    buttonLabel: 'Ver accesos →',
    visualType: 'educacion',
    customImageUrl: '/imagenes/card-chatgpt.jpg',
    badge: 'IA GENERATIVA',
    priceFrom: 'S/ 18.00',
    rating: 5.0,
    stockStatus: 'in_stock',
    popular: true,
    active: true,
    details: {
      overview: 'Desbloquea la máxima potencia de OpenAI con respuestas ultrarrápidas, visión computacional, análisis de datos y documentos en PDF, generación de imágenes con DALL-E 3 y el entorno Canvas para código y redacción interactiva.',
      features: [
        'Modelo GPT-4o de última generación',
        'Análisis de datos, hojas de cálculo y documentos PDF',
        'Generador de imágenes artísticas DALL-E 3',
        'Acceso a miles de GPTs personalizados de la tienda oficial',
        'Canvas para edición colaborativa de código y textos'
      ],
      plans: [
        {
          name: 'Acceso Compartido Premium (1 Mes)',
          price: 'S/ 18.00',
          period: 'mes',
          perks: ['GPT-4o ilimitado', 'Análisis de datos', 'DALL-E 3', 'Garantía 30 días'],
          popular: true
        },
        {
          name: 'Cuenta Exclusiva Personal (1 Mes)',
          price: 'S/ 65.00',
          period: 'mes',
          perks: ['Uso personal 100%', 'Historial privado', 'Tus propios GPTs', 'Voz avanzada']
        }
      ],
      deliveryTime: 'Credenciales en 5 minutos',
      supportNote: 'Garantía total durante todo el mes con soporte y recambio inmediato.'
    }
  },
  {
    id: 'osint-dossier',
    vendorId: 'vendedor-tino',
    assignedVendorIds: ['vendedor-tino', 'vendedor-nano', 'vendedor-central'],
    category: 'investigacion',
    categoryLabel: 'INTELIGENCIA DIGITAL',
    title: 'Investigación OSINT & Dossier Forense',
    description: 'Análisis de fuentes públicas, trazabilidad de datos y consolidación de reportes.',
    subItemLabel: 'Reportes confidenciales en PDF',
    buttonLabel: 'Consultar servicio →',
    visualType: 'investigacion',
    customImageUrl: '/imagenes/card-investigacion.png',
    badge: 'INTEL & OSINT',
    priceFrom: 'S/ 15.00',
    rating: 4.9,
    stockStatus: 'in_stock',
    popular: true,
    active: true,
    details: {
      overview: 'Servicios de análisis de datos e inteligencia de fuentes abiertas (OSINT) para validación de antecedentes, trazabilidad de registros públicos, números telefónicos, correos y huella digital.',
      features: [
        'Consolidación de antecedentes en fuentes de acceso público',
        'Validación de datos registrales, vehiculares y comerciales',
        'Análisis de huella digital y exposición de seguridad',
        'Reportes en PDF confidenciales y estructurados'
      ],
      plans: [
        {
          name: 'Búsqueda Focalizada (Alias/Teléfono)',
          price: 'S/ 15.00',
          period: 'por consulta',
          perks: ['Búsqueda en registros públicos', 'Ficha consolidada', 'Entrega digital rápida'],
          popular: true
        },
        {
          name: 'Dossier OSINT Integral',
          price: 'S/ 45.00',
          period: 'por informe',
          perks: ['Mapeo de presencia digital', 'Trazabilidad de números y correos', 'Resumen ejecutivo en PDF']
        },
        {
          name: 'Auditoría de Exposición y Filtraciones',
          price: 'S/ 80.00',
          period: 'auditoría completa',
          perks: ['Detección de credenciales vulneradas', 'Recomendaciones de saneamiento', 'Soporte personalizado']
        }
      ],
      deliveryTime: 'Reportes entregados en 15 a 45 minutos',
      supportNote: 'Tratamiento 100% confidencial con eliminación segura de registros post-entrega.'
    }
  },
  {
    id: 'laboratorio-rat',
    vendorId: 'vendedor-tino',
    assignedVendorIds: ['vendedor-tino', 'vendedor-central'],
    category: 'educacion',
    categoryLabel: 'CIBERSEGURIDAD ÉTICA',
    title: 'Laboratorios RAT & Red Team Educativo',
    description: 'Máquinas virtuales y guías para aprender telemetría, sockets y administración ética.',
    subItemLabel: 'Máquinas virtuales & Guías',
    buttonLabel: 'Ver temario →',
    visualType: 'educacion',
    customImageUrl: '/imagenes/card-educacion.png',
    badge: 'PENTESTING ÉTICO',
    priceFrom: 'S/ 25.00',
    rating: 4.8,
    stockStatus: 'in_stock',
    popular: false,
    active: true,
    details: {
      overview: 'Laboratorios de aprendizaje y entrenamiento práctico sobre herramientas de administración remota (RAT), telemetría, auditoría de redes y ciberseguridad en máquinas virtuales aisladas.',
      features: [
        'Práctica guiada en entornos de laboratorio controlados',
        'Conceptos de administración remota ética y auditoría',
        'Análisis de tráfico de red y sockets cliente-servidor',
        'Material educativo paso a paso con scripts de prueba'
      ],
      plans: [
        {
          name: 'Acceso a Laboratorio Básico',
          price: 'S/ 25.00',
          period: 'acceso permanente',
          perks: ['Guías paso a paso en PDF/Video', 'Máquina virtual preconfigurada', 'Soporte para instalación'],
          popular: true
        },
        {
          name: 'Pack Avanzado Ciberseguridad & RAT 2026',
          price: 'S/ 60.00',
          period: 'pack completo',
          perks: ['Arquitectura cliente-servidor', 'Monitoreo de procesos y telemetría', 'Entornos Windows & Linux', 'Comunidad de consultas']
        }
      ],
      deliveryTime: 'Acceso y credenciales inmediatas tras confirmación',
      supportNote: 'Asistencia técnica personalizada para configuración del entorno virtual.'
    }
  },
  {
    id: 'canva-pro',
    vendorId: 'vendedor-abby',
    assignedVendorIds: ['vendedor-abby', 'vendedor-whisky', 'vendedor-central'],
    category: 'educacion',
    categoryLabel: 'DISEÑO DIGITAL',
    title: 'Canva Pro Anual + Brand Kit',
    description: 'Diseño gráfico ilimitado, removedor de fondos con IA y millones de recursos premium.',
    subItemLabel: 'Activación a tu correo personal',
    buttonLabel: 'Ver licencia →',
    visualType: 'educacion',
    customImageUrl: '/imagenes/card-canva.jpg',
    badge: 'DISEÑO ILIMITADO',
    priceFrom: 'S/ 25.00',
    rating: 5.0,
    stockStatus: 'in_stock',
    popular: true,
    active: true,
    details: {
      overview: 'Convierte tu cuenta de Canva en Canva Pro con acceso a más de 100 millones de fotos, videos, fuentes y herramientas mágicas de inteligencia artificial para diseño profesional.',
      features: [
        'Quitafondos instantáneo con un solo clic',
        'Kits de marcas y fuentes tipográficas ilimitadas',
        'Almacenamiento en la nube de 1 TB',
        'Redimensionado mágico para todas las redes sociales'
      ],
      plans: [
        {
          name: 'Licencia 1 Año a tu Correo',
          price: 'S/ 25.00',
          period: 'año',
          perks: ['A tu propio correo', 'Garantía 365 días', 'Sin perder diseños'],
          popular: true
        },
        {
          name: 'Licencia Permanente Educativa',
          price: 'S/ 39.00',
          period: 'permanente',
          perks: ['Acceso de por vida', 'Herramientas mágicas IA', 'Soporte directo']
        }
      ],
      deliveryTime: 'Activación en 5 minutos',
      supportNote: 'Invitación oficial enviada directamente a tu correo de Canva.'
    }
  },
  {
    id: 'windows-office',
    vendorId: 'vendedor-abby',
    assignedVendorIds: ['vendedor-abby', 'vendedor-central'],
    category: 'educacion',
    categoryLabel: 'SOFTWARE ORIGINAL',
    title: 'Windows 11 Pro + Office 365 Original',
    description: 'Claves de activación digital permanente para Windows 11 Pro y suites Office oficiales.',
    subItemLabel: 'Activación digital en línea',
    buttonLabel: 'Ver licencias →',
    visualType: 'educacion',
    customImageUrl: '/imagenes/card-windows.jpg',
    badge: 'LICENCIA OEM DIGITAL',
    priceFrom: 'S/ 22.00',
    rating: 5.0,
    stockStatus: 'in_stock',
    popular: true,
    active: true,
    details: {
      overview: 'Licencias originales OEM con activación directa en los servidores de Microsoft. Actualizaciones de por vida y soporte técnico para instalación en tu equipo.',
      features: [
        'Licencia digital permanente (Retail/OEM)',
        'Activación en línea inmediata con Microsoft',
        'Descarga de instaladores oficiales',
        'Garantía total de activación'
      ],
      plans: [
        {
          name: 'Windows 11 Pro (1 PC)',
          price: 'S/ 22.00',
          period: 'de por vida',
          perks: ['Clave digital 25 caracteres', 'Activación permanente', 'Soporte de instalación'],
          popular: true
        },
        {
          name: 'Combo Win 11 Pro + Office 365 (5 Dispositivos)',
          price: 'S/ 48.00',
          period: 'combo completo',
          perks: ['Windows 11 + Office 365', 'Word, Excel, PowerPoint', '1 TB en OneDrive', '5 Dispositivos simultáneos']
        }
      ],
      deliveryTime: 'Envío de clave en 5 minutos',
      supportNote: 'Guía paso a paso y asistencia remota garantizada.'
    }
  }
];

export const TELEGRAM_USERNAME = 'DESCUENTOSPER2';
export const TELEGRAM_URL = 'https://t.me/descuentosper2';

export const SERVICES_STORAGE_KEY = 'dp_services_data_v4';

export function getStoredServices(): ServiceItem[] {
  try {
    const saved = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored services, using default data', e);
  }
  return SERVICES_DATA;
}

export function saveStoredServices(services: ServiceItem[]): void {
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  } catch (e) {
    console.error('Error saving services to localStorage', e);
  }
}
