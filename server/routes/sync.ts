import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../session';
import { serverSupabase } from '../supabase';

export const syncRouter = Router();

/**
 * POST /api/sync
 * Sincroniza productos y/o vendedores hacia Supabase desde el Servidor.
 * Requiere sesión autenticada.
 */
syncRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.sessionUser!;
    const { services, vendors } = req.body || {};

    let syncedServicesCount = 0;
    let syncedVendorsCount = 0;

    // 1. Sincronización de Servicios
    if (Array.isArray(services) && services.length > 0) {
      const formattedServices = services.map((s: any) => ({
        id: s.id,
        vendor_id: s.vendorId || user.userId,
        assigned_vendor_ids: s.assignedVendorIds || [user.userId],
        category: s.category,
        category_label: s.categoryLabel || 'SERVICIO DIGITAL',
        title: s.title,
        description: s.description || '',
        sub_item_label: s.subItemLabel || null,
        button_label: s.buttonLabel || 'Ver opciones →',
        visual_type: s.visualType || s.category,
        custom_image_url: s.customImageUrl || null,
        badge: s.badge || null,
        price_from: s.priceFrom || null,
        rating: s.rating || 5.0,
        stock_status: s.stockStatus || 'in_stock',
        popular: !!s.popular,
        active: s.active !== false,
        details: s.details || {},
        updated_at: new Date().toISOString()
      }));

      const { error: sError } = await serverSupabase
        .from('products')
        .upsert(formattedServices, { onConflict: 'id' });

      if (sError) {
        res.status(400).json({
          success: false,
          error: `Error al sincronizar productos en Supabase: ${sError.message}. Asegúrate de haber ejecutado el esquema SQL.`
        });
        return;
      }
      syncedServicesCount = formattedServices.length;
    }

    // 2. Sincronización de Vendedores (Solo Admin)
    if (Array.isArray(vendors) && vendors.length > 0) {
      if (user.role === 'admin') {
        const formattedVendors = vendors.map((v: any) => ({
          id: v.id,
          role: v.role || 'vendor',
          name: v.name,
          username: v.username,
          telegram_url: v.telegramUrl,
          whatsapp: v.whatsapp || null,
          avatar: v.avatar || '👤',
          pin: v.pin || '1234',
          active: v.active !== false,
          rating: v.rating || 5.0,
          sales_count: v.salesCount || 0,
          payment_methods: v.paymentMethods || [],
          payment_config: v.paymentConfig || {},
          allowed_categories: v.allowedCategories || [],
          allowed_service_ids: v.allowedServiceIds || [],
          custom_notes: v.customNotes || null,
          updated_at: new Date().toISOString()
        }));

        const { error: vError } = await serverSupabase
          .from('vendors')
          .upsert(formattedVendors, { onConflict: 'id' });

        if (vError) {
          res.status(400).json({
            success: false,
            error: `Error al sincronizar vendedores en Supabase: ${vError.message}`
          });
          return;
        }
        syncedVendorsCount = formattedVendors.length;
      }
    }

    res.json({
      success: true,
      message: `¡Sincronización completada! (${syncedServicesCount} productos, ${syncedVendorsCount} vendedores actualizados en Supabase Cloud desde el Servidor).`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Error interno en el servidor durante la sincronización.'
    });
  }
});
