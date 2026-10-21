import { ServiceItem } from '../data/servicesData';
import { Vendor } from '../data/vendorsData';

/**
 * Cliente API seguro para el frontend.
 * Todas las peticiones van a los endpoints del servidor propio (/api/...)
 * El navegador NUNCA recibe ni conoce la URL ni la anon key de Supabase.
 */

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: 'dev' | 'admin' | 'vendor';
  allowedCategories?: string[];
  allowedServiceIds?: string[];
  csrfToken?: string;
}

/**
 * Consulta de productos al backend propio
 */
export async function fetchProductsApi(): Promise<ServiceItem[] | null> {
  try {
    const res = await fetch('/api/productos', {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success && Array.isArray(json.products) ? json.products : null;
  } catch {
    return null;
  }
}

/**
 * Guardar o actualizar producto mediante el backend propio
 */
export async function saveProductApi(product: Partial<ServiceItem>): Promise<{ success: boolean; message?: string; product?: any }> {
  try {
    const res = await fetch('/api/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(product)
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.error || 'Error al guardar el producto.' };
    }
    return { success: true, message: json.message, product: json.product };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error de conexión con el backend.' };
  }
}

/**
 * Eliminar producto mediante el backend propio
 */
export async function deleteProductApi(productId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/productos/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.error || 'Error al eliminar el producto.' };
    }
    return { success: true, message: json.message };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error de conexión con el backend.' };
  }
}

/**
 * Consulta de vendedores al backend propio (omite PINs para público)
 */
export async function fetchVendorsApi(): Promise<Vendor[] | null> {
  try {
    const res = await fetch('/api/vendedores', {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success && Array.isArray(json.vendors) ? json.vendors : null;
  } catch {
    return null;
  }
}

/**
 * Actualizar datos de un vendedor en el backend
 */
export async function updateVendorApi(vendorId: string, updates: Partial<Vendor>): Promise<{ success: boolean; message?: string; vendor?: any }> {
  try {
    const res = await fetch(`/api/vendedores/${encodeURIComponent(vendorId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.error || 'Error al actualizar el vendedor.' };
    }
    return { success: true, message: json.message, vendor: json.vendor };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error de conexión con el backend.' };
  }
}

/**
 * Sincronización masiva de catálogo hacia Supabase mediante el backend
 */
export async function syncCatalogApi(services: ServiceItem[], vendors: Vendor[]): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ services, vendors })
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.error || 'Fallo en la sincronización del servidor.' };
    }
    return { success: true, message: json.message || 'Sincronizado con éxito.' };
  } catch (err: any) {
    return { success: false, message: `Error de red con el backend: ${err?.message || 'Desconocido'}` };
  }
}

/**
 * Inicio de sesión seguro en el backend con cookie HttpOnly opaca
 */
export async function loginApi(username: string, pin: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, pin })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Credenciales no válidas.' };
    }
    return { success: true, user: json.user };
  } catch (err: any) {
    return { success: false, error: 'No se pudo conectar con el servidor de autenticación.' };
  }
}

/**
 * Cierre de sesión en el backend
 */
export async function logoutApi(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // ignore
  }
}

/**
 * Obtener estado de sesión actual desde el backend
 */
export async function checkSessionApi(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success && json.authenticated ? json.user : null;
  } catch {
    return null;
  }
}
