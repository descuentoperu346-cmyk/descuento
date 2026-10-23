import {
  LayoutDashboard,
  Package,
  Plus,
  CreditCard,
  ShieldAlert,
  Activity,
  Users,
  Database,
  UserCheck,
  UsersRound,
  ReceiptText,
  Contact,
  BellRing,
  ChartNoAxesColumn,
  Trash2,
  History,
  DatabaseBackup,
  PiggyBank,
  LifeBuoy,
  MessageSquareText,
  BookOpen,
  type LucideIcon
} from 'lucide-react';

export type PanelNavId =
  | 'resumen'
  | 'ventas'
  | 'clientes'
  | 'renovaciones'
  | 'garantias'
  | 'mensajes'
  | 'reportes'
  | 'ganancias'
  | 'productos'
  | 'subir-producto'
  | 'pagos'
  | 'leaks-articulos'
  | 'telemetria'
  | 'gestion-vendedores'
  | 'respaldos'
  | 'reclamaciones'
  | 'equipo'
  | 'papelera'
  | 'historial'
  | 'copia-bd'
  | 'perfil';

export interface NavItem {
  id: PanelNavId;
  label: string;
  icon: LucideIcon;
  /** Número que se muestra a la derecha (p. ej. cantidad de productos) */
  count?: number;
  /** Etiqueta corta (p. ej. "Ejemplo") */
  tag?: string;
}

export interface NavGroup {
  key: string;
  title?: string;
  items: NavItem[];
}

interface BuildNavOptions {
  products: number;
  articles: number;
  /** Ventas, clientes y reportes (solo con la base de datos conectada) */
  salesEnabled: boolean;
  /** Suscripciones que vencen pronto (se muestra como número en el menú) */
  renewalsDue: number;
  /** Casos de garantía y soporte sin resolver (se muestra como número en el menú) */
  supportPending: number;
  /** Hojas del Libro de Reclamaciones sin responder (se muestra como número en el menú) */
  complaintsPending: number;
  isSuperAdmin: boolean;
  isDev: boolean;
}

/** Menú del panel agrupado por tarea. Lo que no corresponde al rol de la sesión no aparece. */
export function buildNav({ products, articles, salesEnabled, renewalsDue, supportPending, complaintsPending, isSuperAdmin, isDev }: BuildNavOptions): NavGroup[] {
  const groups: NavGroup[] = [
    { key: 'inicio', items: [{ id: 'resumen', label: 'Resumen', icon: LayoutDashboard }] },
    ...(salesEnabled
      ? [
          {
            key: 'ventas',
            title: 'Ventas',
            items: [
              { id: 'ventas' as const, label: 'Ventas', icon: ReceiptText },
              { id: 'clientes' as const, label: 'Clientes', icon: Contact },
              { id: 'renovaciones' as const, label: 'Renovaciones', icon: BellRing, ...(renewalsDue > 0 ? { count: renewalsDue } : {}) },
              { id: 'garantias' as const, label: 'Garantías y soporte', icon: LifeBuoy, ...(supportPending > 0 ? { count: supportPending } : {}) },
              { id: 'mensajes' as const, label: 'Mensajes listos', icon: MessageSquareText }
            ]
          }
        ]
      : []),
    {
      key: 'catalogo',
      title: 'Catálogo',
      items: [
        { id: 'productos', label: 'Productos', icon: Package, count: products },
        { id: 'subir-producto', label: 'Crear o editar producto', icon: Plus },
        { id: 'pagos', label: 'Métodos de pago', icon: CreditCard },
        // La papelera vive en la base de datos: solo existe cuando el panel trabaja con ella
        ...(salesEnabled ? [{ id: 'papelera' as const, label: 'Papelera', icon: Trash2 }] : [])
      ]
    },
    {
      key: 'contenido',
      title: 'Contenido',
      items: [{ id: 'leaks-articulos', label: 'Artículos Leaks', icon: ShieldAlert, count: articles }]
    },
    {
      key: 'analisis',
      title: 'Análisis',
      items: [
        ...(salesEnabled
          ? [
              { id: 'reportes' as const, label: 'Reportes', icon: ChartNoAxesColumn },
              { id: 'ganancias' as const, label: 'Ganancias', icon: PiggyBank }
            ]
          : []),
        { id: 'telemetria', label: 'Tráfico y clics', icon: Activity }
      ]
    }
  ];

  if (isSuperAdmin) {
    groups.push({
      key: 'admin',
      title: 'Administración',
      items: [
        { id: 'gestion-vendedores', label: 'Tiendas y vendedores', icon: Users },
        // El Libro vive en la base de datos: solo existe cuando el panel trabaja con ella
        ...(salesEnabled ? [{ id: 'reclamaciones' as const, label: 'Libro de reclamaciones', icon: BookOpen, ...(complaintsPending > 0 ? { count: complaintsPending } : {}) }] : []),
        { id: 'respaldos', label: 'Base de datos y copias', icon: Database }
      ]
    });
  }
  if (isDev) {
    groups.push({
      key: 'dev',
      title: 'Desarrollador',
      items: [
        { id: 'equipo', label: 'Equipo y compradores', icon: UsersRound },
        { id: 'historial', label: 'Historial de cambios', icon: History },
        { id: 'copia-bd', label: 'Copia de la base de datos', icon: DatabaseBackup }
      ]
    });
  }
  groups.push({ key: 'cuenta', title: 'Cuenta', items: [{ id: 'perfil', label: 'Mi perfil y datos', icon: UserCheck }] });
  return groups;
}

/** Títulos de sección para el buscador y las migas de pan. */
export const NAV_TITLES: Record<PanelNavId, string> = {
  resumen: 'Resumen',
  ventas: 'Ventas',
  clientes: 'Clientes',
  renovaciones: 'Renovaciones',
  garantias: 'Garantías y soporte',
  mensajes: 'Mensajes listos',
  reportes: 'Reportes',
  ganancias: 'Ganancias',
  productos: 'Productos',
  'subir-producto': 'Crear o editar producto',
  pagos: 'Métodos de pago',
  'leaks-articulos': 'Artículos Leaks',
  telemetria: 'Tráfico y clics',
  'gestion-vendedores': 'Tiendas y vendedores',
  respaldos: 'Base de datos y copias',
  reclamaciones: 'Libro de reclamaciones',
  equipo: 'Equipo y compradores',
  papelera: 'Papelera',
  historial: 'Historial de cambios',
  'copia-bd': 'Copia de la base de datos',
  perfil: 'Mi perfil y datos'
};
