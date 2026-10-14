import { ServiceItem } from '../data/servicesData';
import { Vendor } from '../data/vendorsData';
import {
  fetchProductsApi,
  fetchVendorsApi,
  syncCatalogApi
} from './api';

/**
 * Cliente seguro de backend.
 * Las credenciales de Supabase (URL y Anon Key) se mantienen 100% privadas
 * en el servidor Node.js y no se envían al navegador.
 */
export const SUPABASE_URL = 'Servidor Backend Seguro (https://descuentosperu.pe/api)';

/**
 * SQL Schema de referencia para el administrador
 */
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- TABLAS PARA DESCUENTOS PERÚ EN SUPABASE POSTGRESQL
-- Ejecutar en el SQL Editor del panel de Supabase
-- ========================================================

-- 1. Tabla de Productos y Servicios del Catálogo
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  vendor_id TEXT,
  assigned_vendor_ids TEXT[],
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sub_item_label TEXT,
  button_label TEXT DEFAULT 'Ver opciones →',
  visual_type TEXT DEFAULT 'streaming',
  custom_image_url TEXT,
  badge TEXT,
  price_from TEXT,
  rating NUMERIC DEFAULT 5.0,
  stock_status TEXT DEFAULT 'in_stock',
  popular BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  details JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Vendedores y Cuentas de Cobro
CREATE TABLE IF NOT EXISTS public.vendors (
  id TEXT PRIMARY KEY,
  role TEXT DEFAULT 'vendor',
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  telegram_url TEXT NOT NULL,
  whatsapp TEXT,
  avatar TEXT DEFAULT '👤',
  pin TEXT DEFAULT '1234',
  active BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 5.0,
  sales_count INTEGER DEFAULT 0,
  payment_methods TEXT[],
  payment_config JSONB DEFAULT '{}'::jsonb,
  allowed_categories TEXT[],
  allowed_service_ids TEXT[],
  custom_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura de productos" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Lectura de vendedores" ON public.vendors
  FOR SELECT USING (true);
`;

/**
 * Sincroniza servicios delegando la llamada al backend seguro
 */
export async function syncServicesToSupabase(services: ServiceItem[]): Promise<{ success: boolean; message: string }> {
  return syncCatalogApi(services, []);
}

/**
 * Consulta servicios delegando la llamada al backend seguro
 */
export async function fetchServicesFromSupabase(): Promise<ServiceItem[] | null> {
  return fetchProductsApi();
}

/**
 * Sincroniza vendedores delegando la llamada al backend seguro
 */
export async function syncVendorsToSupabase(vendors: Vendor[]): Promise<{ success: boolean; message: string }> {
  return syncCatalogApi([], vendors);
}

/**
 * Consulta vendedores delegando la llamada al backend seguro
 */
export async function fetchVendorsFromSupabase(): Promise<Vendor[] | null> {
  return fetchVendorsApi();
}
