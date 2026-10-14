import express, { Request, Response, NextFunction } from 'express';
import { sessionMiddleware } from './session';
import { authRouter } from './routes/auth';
import { productsRouter } from './routes/products';
import { vendorsRouter } from './routes/vendors';
import { syncRouter } from './routes/sync';

export const app = express();

// Middleware básico de parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Middleware de sesión opaca
app.use(sessionMiddleware as express.RequestHandler);

// Endpoint de salud del servidor (sin exponer datos de infraestructura)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Descuentos Perú Backend API',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API de la aplicación
app.use('/api/auth', authRouter);
app.use('/api/productos', productsRouter);
app.use('/api/vendedores', vendorsRouter);
app.use('/api/sync', syncRouter);

// Manejador de errores seguro: NUNCA expone credenciales, cadenas de conexión ni trazas
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]', err?.message || err);
  res.status(500).json({
    success: false,
    error: 'Ocurrió un error interno en el servidor. Por favor intenta más tarde.'
  });
});
