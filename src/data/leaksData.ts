export interface LeakArticle {
  id: string;
  title: string;
  slug: string;
  category: 'filtraciones' | 'ciberseguridad' | 'investigaciones' | 'guias' | 'breaches' | 'darkweb' | 'bancos';
  categoryLabel: string;
  severity: 'critico' | 'alto' | 'medio' | 'informativo';
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  authorTelegram: string;
  imageUrl: string;
  summary: string;
  content: string[];
  compromisedData: string[];
  affectedScope: string;
  tags: string[];
  featured?: boolean;
}

export const INITIAL_LEAKS_ARTICLES: LeakArticle[] = [
  // 1. Featured Lead Hero Article
  {
    id: 'leak-hero-db',
    title: 'Qué hacer cuando se expone una base de datos',
    slug: 'que-hacer-cuando-se-expone-una-base-de-datos',
    category: 'investigaciones',
    categoryLabel: 'ANÁLISIS',
    severity: 'alto',
    date: '14 Octubre, 2026',
    readTime: '7 min de lectura',
    author: 'Tin9o (@Tin9o)',
    authorRole: 'Especialista en Inteligencia OSINT & Brechas',
    authorTelegram: 'Tin9o',
    imageUrl: '/imagenes/banner-filtraciones.png',
    summary: 'Protocolo inmediato y exhaustivo de respuesta ante incidentes de exfiltración de bases de datos masivas: verificación de integridad, contención de credenciales y auditoría de accesos no autorizados.',
    affectedScope: 'Bases de datos SQL/NoSQL & credenciales expuestas',
    compromisedData: [
      'Usuarios y contraseñas hasheadas/planas',
      'DNI y datos personales sensibles',
      'Historial de transacciones y compras',
      'Tokens de API y llaves de servicio'
    ],
    tags: ['#BaseDeDatos', '#DataBreach', '#ForenseDigital', '#RespuestaAIncidentes', '#OSINT'],
    featured: true,
    content: [
      'Cuando una base de datos corporativa o de un servicio en línea queda expuesta en internet —ya sea por un error en la configuración de permisos (como buckets S3 públicos o clústeres de Elasticsearch desprotegidos) o por una inyección SQL maliciosa— el tiempo de reacción es el factor más determinante para mitigar el impacto.',
      'El primer paso consiste en validar la veracidad y frescura de la filtración. En los foros de la dark web abundan los "combos" reciclados de filtraciones antiguas combinadas bajo nuevos nombres comerciales. Mediante técnicas OSINT y cotejo de marcas de tiempo (timestamps), es posible determinar si la fuga corresponde a eventos recientes o a listas consolidadas del pasado.',
      'El segundo paso innegociable es la revocación forzosa de sesiones activas y la rotación inmediata de secretos y llaves de servicio (API keys, certificados SSL y credenciales de base de datos). Los atacantes suelen buscar tokens de acceso con privilegios elevados para garantizar persistencia silenciosa en la infraestructura.',
      'Para los usuarios finales afectados, la recomendación principal es cambiar de inmediato las contraseñas en todos los servicios donde se haya utilizado la misma combinación de correo y clave, activar autenticación de dos factores (2FA) mediante aplicaciones TOTP (evitando SMS) y monitorizar posibles intentos de suplantación o phishing dirigido.'
    ]
  },

  // 2. Últimas publicaciones - 1
  {
    id: 'leak-fake-alert',
    title: 'Cómo reconocer una alerta falsa',
    slug: 'como-reconocer-una-alerta-falsa',
    category: 'guias',
    categoryLabel: 'GUÍA',
    severity: 'medio',
    date: '13 Octubre, 2026',
    readTime: '4 min',
    author: 'Redacción DP',
    authorRole: 'Ciberseguridad & Prevención',
    authorTelegram: 'DESCUENTOSPER2',
    imageUrl: '/imagenes/banner-phishing.png',
    summary: 'Identifica las tácticas de alarmismo psicológico y phishing con supuestas alertas rojas que buscan forzar clics desesperados o la descarga de troyanos.',
    affectedScope: 'Navegación web y notificaciones push fraudulentas',
    compromisedData: [
      'Ingeniería social de alta urgencia',
      'Ventanas emergentes falsas con logos de antivirus',
      'Phishing para captura de credenciales'
    ],
    tags: ['#FakeAlert', '#Scam', '#Phishing', '#EducacionDigital'],
    featured: false,
    content: [
      'Las alertas falsas son uno de los vectores más comunes de engaño digital. Suelen presentarse como ventanas emergentes en el navegador con sirenas animadas, logos apócrifos de antivirus reconocidos o avisos judiciales que aseguran que tu equipo ha sido infectado con decenas de virus.',
      'El objetivo detrás de estas pantallas es generar angustia y apresurar a la víctima para que llame a números de soporte falsos, compre licencias fraudulentas o instale programas de control remoto tipo AnyDesk o TeamViewer que entregan el control total del equipo al estafador.',
      'Cómo identificar una alerta falsa: (1) Revisa la barra de direcciones; si la alerta aparece en una página web desconocida y no desde la aplicación nativa de tu antivirus instalado, es 100% falsa. (2) Desconfía de temporizadores regresivos que amenazan con bloquear tu disco duro. (3) Nunca llames a números telefónicos incluidos en mensajes emergentes.'
    ]
  },

  // 3. Últimas publicaciones - 2
  {
    id: 'leak-report-reveal',
    title: 'Qué revela un reporte de filtración',
    slug: 'que-revela-un-reporte-de-filtracion',
    category: 'filtraciones',
    categoryLabel: 'ANÁLISIS',
    severity: 'alto',
    date: '12 Octubre, 2026',
    readTime: '6 min',
    author: 'Tin9o (@Tin9o)',
    authorRole: 'Especialista en Inteligencia OSINT & Brechas',
    authorTelegram: 'Tin9o',
    imageUrl: '/imagenes/card-investigacion.png',
    summary: 'Aprende a interpretar hashes criptográficos, metadatos de exfiltración, volcados SQL y campos comprometidos para medir el verdadero alcance de una filtración.',
    affectedScope: 'Auditoría y análisis técnico de volcados de datos',
    compromisedData: [
      'Hashes MD5 / SHA-256 / bcrypt',
      'Metadatos de esquemas relacionales y volcados SQL',
      'Patrones de contraseñas y diccionarios de ataque'
    ],
    tags: ['#ThreatIntel', '#DumpAnalysis', '#OSINT', '#Forense'],
    featured: false,
    content: [
      'Cuando una muestra de datos filtrados es publicada en comunidades de ciberseguridad, los analistas recurren a un proceso metódico de triaje para determinar su autenticidad y severidad real.',
      'Un reporte técnico de filtración no solo detalla la cantidad de filas comprometidas, sino el algoritmo de cifrado o hashing utilizado para proteger las contraseñas (por ejemplo, MD5 o SHA-1 ya vulnerados, frente a implementaciones robustas como Argon2 o bcrypt con sal).',
      'Asimismo, el análisis de las tablas y campos expuestos revela si la fuga involucra datos transaccionales críticos (códigos CVV de tarjetas, tokens de sesión, firmas digitales) o datos estáticos de consulta pública como padrones o nombres de usuario.',
      'Comprender este reporte permite a las empresas y usuarios desplegar planes de contingencia proporcionados sin caer en el pánico ni desestimar riesgos reales de robo de identidad.'
    ]
  },

  // 4. Últimas publicaciones - 3
  {
    id: 'leak-three-steps',
    title: 'Tres pasos para reforzar tus cuentas',
    slug: 'tres-pasos-para-reforzar-tus-cuentas',
    category: 'ciberseguridad',
    categoryLabel: 'PROTECCIÓN',
    severity: 'informativo',
    date: '11 Octubre, 2026',
    readTime: '5 min',
    author: 'Redacción DP',
    authorRole: 'Seguridad Digital & Soporte',
    authorTelegram: 'DESCUENTOSPER2',
    imageUrl: '/imagenes/banner-protege.png',
    summary: 'Estrategias fundamentales de blindaje personal: autenticación robusta, llaves físicas o apps autenticadoras, y compartimentación estricta de identidades.',
    affectedScope: 'Cuentas personales y corporativas',
    compromisedData: [
      'Guía técnica de blindaje y hardening',
      'Estrategia de contraseñas maestras',
      'Eliminación de puntos únicos de falla'
    ],
    tags: ['#Hardening', '#2FA', '#ContraseñasSeguras', '#Privacidad'],
    featured: false,
    content: [
      'Proteger tus cuentas no requiere conocimientos avanzados de ingeniería de sistemas, sino hábitos consistentes de higiene digital basados en tres pilares esenciales.',
      'Paso 1: Adopta un gestor de contraseñas de código abierto o auditado (como Bitwarden o KeePass). Genera contraseñas aleatorias de más de 16 caracteres para cada servicio y nunca reutilices la contraseña de tu correo principal.',
      'Paso 2: Elimina la autenticación por SMS y migra a 2FA basado en aplicaciones (como Aegis, Google Authenticator o llaves de hardware YubiKey). El SMS es vulnerable a clonaciones de chip (SIM swapping) e interceptación de red.',
      'Paso 3: Compartimenta tu identidad. Utiliza una dirección de correo exclusiva para banca y servicios financieros, otra para trabajo y una tercera para suscripciones, compras y registros en foros casuales.'
    ]
  },

  // 5. Explora la revista - 1
  {
    id: 'leak-understand-exposure',
    title: 'Entender una exposición de datos',
    slug: 'entender-una-exposicion-de-datos',
    category: 'filtraciones',
    categoryLabel: 'FILTRACIONES',
    severity: 'alto',
    date: '10 Octubre, 2026',
    readTime: '5 min de lectura',
    author: 'Tin9o (@Tin9o)',
    authorRole: 'Investigador de Brechas & Amenazas',
    authorTelegram: 'Tin9o',
    imageUrl: '/imagenes/leak-stack-folders.jpg',
    summary: 'Diferencias clave entre una fuga por mala configuración de servidores en la nube y un ataque dirigido de intrusión o ransomware.',
    affectedScope: 'Almacenamiento en la nube y repositorios desprotegidos',
    compromisedData: [
      'Archivos de copia de respaldo (.tar.gz, .sql)',
      'Directorios .git y .env expuestos públicamente',
      'Registros de servidores web no autenticados'
    ],
    tags: ['#ExposicionDeDatos', '#CloudSecurity', '#Auditoria', '#Infosec'],
    featured: false,
    content: [
      'En los medios suele emplearse el término "hackeo" de forma indiscriminada, pero existe una distinción técnica crítica entre una exposición involuntaria de datos y una brecha por intrusión activa.',
      'Una exposición de datos ocurre frecuentemente cuando un servidor de desarrollo, una base de datos de respaldo o un bucket en Amazon S3 queda accesible para cualquiera con una conexión a internet por no requerir contraseña ni autenticación.',
      'Herramientas automatizadas de escaneo indexan estos servicios en cuestión de horas. Los actores maliciosos no necesitan romper ninguna defensa cibernética; simplemente descargan los directorios expuestos.',
      'Prevenir este escenario exige auditorías continuas de puertos expuestos, políticas de mínimo privilegio en nubes corporativas y cifrado de datos en reposo y en tránsito.'
    ]
  },

  // 6. Explora la revista - 2
  {
    id: 'leak-suspicious-email',
    title: 'Señales de un correo sospechoso',
    slug: 'senales-de-un-correo-sospechoso',
    category: 'ciberseguridad',
    categoryLabel: 'CIBERSEGURIDAD',
    severity: 'medio',
    date: '09 Octubre, 2026',
    readTime: '6 min de lectura',
    author: 'Redacción DP',
    authorRole: 'Especialista Anti-Phishing',
    authorTelegram: 'DESCUENTOSPER2',
    imageUrl: '/imagenes/banner-escudo.png',
    summary: 'Encabezados fraudulentos, spoofing de dominios bancarios y lenguaje de coacción psicológica: radiografía de una campaña de phishing moderna.',
    affectedScope: 'Bandejas de correo corporativo y personal',
    compromisedData: [
      'Credenciales de correo electrónico',
      'Archivos adjuntos maliciosos (ISO, ZIP, PDF)',
      'Enlaces señuelo a plataformas clonadas'
    ],
    tags: ['#Phishing', '#EmailSecurity', '#IngenieriaSocial', '#Ciberdefensa'],
    featured: false,
    content: [
      'El phishing sigue siendo el punto de entrada de más del 80% de los ciberataques contra personas y organizaciones. Aunque los filtros antispam modernos bloquean millones de mensajes cada día, las campañas dirigidas utilizan técnicas cada vez más sofisticadas.',
      'Entre las principales señales de alarma se encuentran: discrepancias entre el nombre visible del remitente y la dirección real del correo electrónico en el encabezado, solicitudes urgentes de pago o verificación bajo amenaza de bloqueo inmediato, y enlaces que redirigen a dominios tipográficamente similares (typosquatting).',
      'Adicionalmente, el adjunto de archivos comprimidos (.zip, .7z) o imágenes de disco (.iso) suele ocultar ejecutables maliciosos o troyanos tipo stealer listos para capturar contraseñas al primer clic.',
      'Regla de oro: Si recibes una notificación de tu banco o proveedor de servicios solicitando verificar tus datos, nunca hagas clic en el enlace del correo; accede siempre escribiendo manualmente la dirección web oficial en tu navegador.'
    ]
  },

  // 7. Explora la revista - 3
  {
    id: 'leak-protect-identity',
    title: 'Protege tu identidad digital',
    slug: 'protege-tu-identidad-digital',
    category: 'guias',
    categoryLabel: 'GUÍAS',
    severity: 'informativo',
    date: '08 Octubre, 2026',
    readTime: '5 min de lectura',
    author: 'Tin9o (@Tin9o)',
    authorRole: 'Protección & Privacidad OSINT',
    authorTelegram: 'Tin9o',
    imageUrl: '/imagenes/llama-investigacion.png',
    summary: 'Pasos para auditar tu huella digital, eliminar perfiles olvidados y reducir las probabilidades de suplantación de identidad en línea.',
    affectedScope: 'Huella digital y privacidad personal',
    compromisedData: [
      'Números de DNI y documentos de identidad',
      'Correos secundarios y contraseñas olvidadas',
      'Números de teléfono históricos y direcciones'
    ],
    tags: ['#Privacidad', '#IdentidadDigital', '#OSINT', '#ProteccionDeDatos'],
    featured: false,
    content: [
      'Cada servicio en el que te registraste en los últimos diez años almacena una porción de tu vida digital. Muchas de esas plataformas quedan en el abandono por parte de sus desarrolladores, convirtiéndose en blancos fáciles para filtraciones masivas.',
      'Auditar tu huella digital consiste en rastrear en qué plataformas tu correo electrónico figura en brechas conocidas (utilizando monitores reconocidos como Have I Been Pwned) y proceder a dar de baja aquellas cuentas que ya no utilizas.',
      'Asimismo, minimiza la información pública que compartes en redes sociales: fechas exactas de cumpleaños, números telefónicos y ubicaciones en tiempo real son insumos que los atacantes recopilan para responder preguntas de seguridad bancaria o personalizar ataques de ingeniería social.',
      'Tu identidad digital es tu activo más valioso en la era conectada; protegerla de manera preventiva es mucho más sencillo y económico que resolver un caso de fraude o suplantación consumado.'
    ]
  }
];

export const LEAKS_ARTICLES_STORAGE_KEY = 'dp_leaks_articles_v3';

export function getStoredLeakArticles(): LeakArticle[] {
  try {
    const raw = localStorage.getItem(LEAKS_ARTICLES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored leak articles, using initial data', e);
  }
  return INITIAL_LEAKS_ARTICLES;
}

export function saveStoredLeakArticles(articles: LeakArticle[]): void {
  try {
    localStorage.setItem(LEAKS_ARTICLES_STORAGE_KEY, JSON.stringify(articles));
  } catch (e) {
    console.error('Error saving leak articles to localStorage', e);
  }
}
