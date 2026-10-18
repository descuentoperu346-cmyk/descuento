-- Diagnóstico de solo lectura para Supabase (SQL Editor). No modifica datos.
-- Consultas reales de la app: products (WHERE active = true) y vendors (todas las filas).

-- 1) Tamaño y filas de las tablas
SELECT relname, n_live_tup AS filas, pg_size_pretty(pg_total_relation_size(relid)) AS tamano
FROM pg_stat_user_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(relid) DESC;

-- 2) Índices existentes
SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;

-- 3) Políticas RLS
SELECT tablename, policyname, cmd, roles, qual, with_check FROM pg_policies WHERE schemaname = 'public';

-- 4) Planes de ejecución de las consultas que hace el backend
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM public.products WHERE active = true;
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM public.vendors;

-- 5) Peso medio de una fila (details JSONB puede ser grande)
SELECT avg(pg_column_size(p.*))::int AS bytes_fila_products FROM public.products p;
SELECT avg(pg_column_size(v.*))::int AS bytes_fila_vendors FROM public.vendors v;

-- 6) Consultas más lentas (si pg_stat_statements está habilitado)
SELECT calls, round(mean_exec_time::numeric, 2) AS ms_medio, left(query, 120) AS consulta
FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
