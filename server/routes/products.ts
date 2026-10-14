import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../session';
import { serverSupabase } from '../supabase';

export const productsRouter = Router();

/**
 * GET /api/productos
 * Devuelve el catálogo de productos.
 * Para público: solo productos activos.
 * Para vendedores/admin: incluye productos según sus permisos.
 */
productsRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const isPrivileged = req.sessionUser && (req.sessionUser.role === 'admin' || req.sessionUser.role === 'vendor');

    let query = serverSupabase.from('products').select('*');

    // Si no es admin/vendedor autenticado, filtra estrictamente solo productos activos
    if (!isPrivileged) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) {
      // Si la tabla no existe aún en Supabase, responder 200 con fallback
      res.status(200).json({
        success: true,
        source: 'fallback',
        products: []
      });
      return;
    }

    // Mapear al modelo de la aplicación
    const formatted = (data || []).map((d: any) => ({
      id: d.id,
      vendorId: d.vendor_id,
      assignedVendorIds: d.assigned_vendor_ids || [],
      category: d.category,
      categoryLabel: d.category_label,
      title: d.title,
      description: d.description,
      subItemLabel: d.sub_item_label,
      buttonLabel: d.button_label,
      visualType: d.visual_type,
      customImageUrl: d.custom_image_url,
      badge: d.badge,
      priceFrom: d.price_from,
      rating: d.rating,
      stockStatus: d.stock_status,
      popular: d.popular,
      active: d.active !== false,
      details: d.details
    }));

    res.json({
      success: true,
      source: 'supabase',
      products: formatted
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Error al consultar productos desde el servidor.'
    });
  }
});

/**
 * POST /api/productos
 * Crea o actualiza un producto en Supabase desde el Servidor.
 * Requiere sesión válida de Vendedor o Administrador.
 */
productsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.sessionUser!;
    const product = req.body;

    if (!product || !product.title || !product.category) {
      res.status(400).json({
        success: false,
        error: 'El título y la categoría del producto son obligatorios.'
      });
      return;
    }

    // Control de acceso: Si es vendedor, verificar que no intente modificar un producto ajeno
    if (user.role !== 'admin' && product.id) {
      const { data: existing } = await serverSupabase
        .from('products')
        .select('vendor_id, assigned_vendor_ids')
        .eq('id', product.id)
        .maybeSingle();

      if (existing) {
        const isOwner =
          existing.vendor_id === user.userId ||
          (Array.isArray(existing.assigned_vendor_ids) && existing.assigned_vendor_ids.includes(user.userId));

        if (!isOwner) {
          res.status(403).json({
            success: false,
            error: 'No tienes autorización para modificar productos asignados a otros vendedores.'
          });
          return;
        }
      }
    }

    const payload = {
      id: product.id || `prod-${Date.now()}`,
      vendor_id: user.role === 'admin' ? product.vendorId || user.userId : user.userId,
      assigned_vendor_ids: product.assignedVendorIds || [user.userId],
      category: product.category,
      category_label: product.categoryLabel || 'PRODUCTO DIGITAL',
      title: String(product.title).trim(),
      description: String(product.description || '').trim(),
      sub_item_label: product.subItemLabel || null,
      button_label: product.buttonLabel || 'Ver planes →',
      visual_type: product.visualType || product.category,
      custom_image_url: product.customImageUrl || null,
      badge: product.badge || null,
      price_from: product.priceFrom || null,
      rating: product.rating || 5.0,
      stock_status: product.stockStatus || 'in_stock',
      popular: !!product.popular,
      active: product.active !== false,
      details: product.details || {},
      updated_at: new Date().toISOString()
    };

    const { data, error } = await serverSupabase
      .from('products')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      res.status(400).json({
        success: false,
        error: `Error de persistencia en Supabase: ${error.message}`
      });
      return;
    }

    res.json({
      success: true,
      message: 'Producto guardado con éxito en Supabase desde el servidor.',
      product: data
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Error interno al procesar el producto en el servidor.'
    });
  }
});

/**
 * DELETE /api/productos/:id
 * Elimina un producto garantizando los permisos del vendedor o admin.
 */
productsRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.sessionUser!;
    const productId = req.params.id;

    if (!productId) {
      res.status(400).json({ success: false, error: 'ID de producto inválido.' });
      return;
    }

    // Verificar propiedad
    if (user.role !== 'admin') {
      const { data: existing } = await serverSupabase
        .from('products')
        .select('vendor_id, assigned_vendor_ids')
        .eq('id', productId)
        .maybeSingle();

      if (existing) {
        const isOwner =
          existing.vendor_id === user.userId ||
          (Array.isArray(existing.assigned_vendor_ids) && existing.assigned_vendor_ids.includes(user.userId));

        if (!isOwner) {
          res.status(403).json({
            success: false,
            error: 'No tienes permisos para eliminar este producto.'
          });
          return;
        }
      }
    }

    const { error } = await serverSupabase.from('products').delete().eq('id', productId);

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, message: 'Producto eliminado correctamente.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Error al eliminar el producto.' });
  }
});
