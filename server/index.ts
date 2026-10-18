import path from 'path';
import express from 'express';
import { app } from './app';
import { config } from './config';

const PORT = config.port || 3000;
const staticDir = path.resolve(process.cwd(), 'dist');

// Servir archivos estáticos del build del frontend
// Los archivos de /assets llevan hash en el nombre: caché larga e inmutable.
// Imágenes: una semana; index.html siempre se revalida.
app.use(
  express.static(staticDir, {
    setHeaders: (res, filePath) => {
      const p = filePath.replace(/\\/g, '/');
      if (p.includes('/assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      else if (p.includes('/imagenes/')) res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
      else res.setHeader('Cache-Control', 'no-cache');
    }
  })
);

// Fallback SPA para rutas cliente (como /#/servicios, etc.)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(staticDir, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Servidor Descuentos Perú Backend en ejecución.');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[DESCUENTOS PERÚ] Servidor Backend Seguro corriendo en http://0.0.0.0:${PORT}`);
  console.log(`[SEGURIDAD] Todas las conexiones a Supabase están protegidas detrás del backend.`);
});
