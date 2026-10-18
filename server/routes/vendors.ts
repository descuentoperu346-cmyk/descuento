import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../session';
import { serverSupabase } from '../supabase';
import { getCached, setCached, setCacheHeaders } from '../cache';

export const vendorsRouter = Router();

/**
 * GET /api/vendedores
 * Devuelve la lista de vendedores autorizados.
 * Para público: omite estrictamente PINs y notas privadas de seguridad.
 */
vendorsRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.sessionUser && req.sessionUser.role === 'admin';

    setCacheHeaders(res, !isAdmin);
    if (!isAdmin) {
      const cached = getCached<unknown>('vendors:public');
      if (cached) {
        res.json(cached);
        return;
      }
    }

    const { data, error } = await serverSupabase.from('vendors').select('*');

    if (error) {
      res.status(200).json({
        success: true,
        source: 'fallback',
        vendors: []
      });
      return;
    }

    const formatted = (data || []).map((d: any) => {
      const publicData = {
        id: d.id,
        role: d.role,
        name: d.name,
        username: d.username,
        telegramUrl: d.telegram_url,
        whatsapp: d.whatsapp,
        avatar: d.avatar,
        active: d.active !== false,
        rating: d.rating || 5.0,
        salesCount: d.sales_count || 0,
        paymentMethods: d.payment_methods || [],
        paymentConfig: d.payment_config || {},
        allowedCategories: d.allowed_categories || [],
        allowedServiceIds: d.allowed_service_ids || []
      };

      // Si es el Administrador, se permiten campos adicionales de gestión
      if (isAdmin) {
        return {
          ...publicData,
          pin: d.pin,
          customNotes: d.custom_notes
        };
      }

      return publicData;
    });

    const body = { success: true, source: 'supabase', vendors: formatted };
    if (!isAdmin) setCached('vendors:public', body);
    res.json(body);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Error al consultar vendedores desde el servidor.'
    });
  }
});

/**
 * PUT /api/vendedores/:id
 * Actualiza la información de un vendedor.
 * Requiere que sea el propio vendedor en sesión o el Administrador.
 */
vendorsRouter.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.sessionUser!;
    const vendorId = req.params.id;
    const updates = req.body;

    if (user.role !== 'admin' && user.userId !== vendorId) {
      res.status(403).json({
        success: false,
        error: 'No tienes autorización para modificar los datos de otro asesor.'
      });
      return;
    }

    const payload: any = {
      id: vendorId,
      name: updates.name,
      username: updates.username,
      telegram_url: updates.telegramUrl,
      whatsapp: updates.whatsapp || null,
      avatar: updates.avatar || '👤',
      payment_methods: updates.paymentMethods || [],
      payment_config: updates.paymentConfig || {},
      allowed_categories: updates.allowedCategories || [],
      allowed_service_ids: updates.allowedServiceIds || [],
      updated_at: new Date().toISOString()
    };

    // Solo el admin o el propio usuario pueden actualizar su PIN
    if (updates.pin) {
      payload.pin = String(updates.pin).trim();
    }
    if (user.role === 'admin' && updates.role) {
      payload.role = updates.role;
    }
    if (updates.customNotes !== undefined) {
      payload.custom_notes = updates.customNotes;
    }

    const { data, error } = await serverSupabase
      .from('vendors')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({
      success: true,
      message: 'Vendedor actualizado con éxito en Supabase desde el servidor.',
      vendor: data
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el vendedor en el servidor.'
    });
  }
});
